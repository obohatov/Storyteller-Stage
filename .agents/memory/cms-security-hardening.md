---
name: CMS security hardening
description: All 10 security/integrity fixes applied to the Phase 2 CMS — what was changed and why
---

## Admin allowlist
- `ADMIN_USER_IDS` Replit Secret (comma-separated user IDs) controls who can access the CMS.
- `artifacts/api-server/src/lib/adminGuard.ts` — `isAdminUser(userId)` + `requireAdmin` middleware (401 = not authenticated, 403 = not an admin).
- Admin router (`routes/admin/index.ts`) uses `requireAdmin` instead of plain `isAuthenticated`.
- If `ADMIN_USER_IDS` is empty/unset, **nobody** is an admin (fail-closed).

**Why:** Previously any authenticated Replit user could write, publish, and delete content.

## GET /admin/me endpoint
- Added to `routes/admin/dashboard.ts`. Returns `{ isAdmin: true, user: {...} }` for verified admins.
- Returns 401/403 via the parent `requireAdmin` guard.
- Frontend `AdminLayout` calls this single endpoint to determine all three states: loading → unauthenticated → forbidden → authorized.

## Frontend AdminLayout 403 state
- Three visual states: login screen (401), "Access Denied" screen (403), sidebar + children (200).
- No longer depends on `useAuth()` hook — uses a direct fetch to `/api/admin/me`.

## Preview mode restricted to admins
- `isPreviewMode()` in `public-content.ts` now calls `isAdminUser()` — any logged-in non-admin still gets the published-only view.

## Rich-text XSS sanitization
- `artifacts/api-server/src/lib/sanitize.ts` — `sanitizeRichText()` using `sanitize-html` package.
- Allowlist: p/br, h1–h6, strong/em/b/i/s, ul/ol/li, a (http/https only, forced target=_blank rel=noopener), blockquote, pre/code, hr.
- Applied server-side on every write of `body`/`synopsis`/`excerpt`/`stagingNotes` fields in fairy-tales, plays, and about routes.

## File upload hardening
- `routes/storage.ts` now requires admin (not just authentication).
- MIME type allowlist: `image/jpeg`, `image/png`, `image/gif`, `image/webp`.
- Max size: 10 MB (checked against `size` field in request body).
- Auth check fires before validation (401/403 before 400).

## Input validation
- All admin write routes validate string max lengths and integer ranges inline (no external lib to avoid version issues).
  - title ≤ 300, blurb/logline ≤ 1000, seoTitle ≤ 120, seoDesc ≤ 320, body ≤ 200 000
  - themes: array ≤ 20 items, each ≤ 50 chars
  - estimatedReadingTime / estimatedDuration: int 1–9999
  - scriptAvailability: enum `public | excerpt_only | on_request`

## Slug integrity
- Submitted slug normalized through `generateSlug()` before storage.
- Validated against `/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/` after normalization.
- PostgreSQL unique constraint violation (code `23505`) caught and returned as `409 { error: "slug", message: "..." }` instead of 500.

## DB constraints (pre-existing, verified)
- `slug.unique()` on both `fairy_tales` and `plays` tables.
- FK cascade delete on translation tables (orphan-free).
- Unique index on `(fairyTaleId | playId, locale)` and `locale` on `about_translations`.
