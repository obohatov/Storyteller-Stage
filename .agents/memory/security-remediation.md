---
name: Security remediation pass (Aug 2026)
description: Documents what was fixed, what remains open, and key design decisions from the focused security fix.
---

# Security Remediation — Aug 2026

## Fixed findings

| ID | File | What changed |
|---|---|---|
| H1 CORS | `app.ts` | `origin: true` → explicit allowlist (`bohatova.art` + `REPLIT_DEV_DOMAIN` in dev) |
| H2 Rate limit | `app.ts` + `lib/rateLimit.ts` | `app.set("trust proxy", 1)` + use `req.ip` instead of raw X-Forwarded-For |
| H3 Storage | `routes/storage.ts` | Fixed calls to non-existent methods; now uses `getObjectEntityFile()` → `canAccessObjectEntity()` → `downloadObject(File)` |
| M1 XSS | `routes/admin/plays.ts` | `productionInfo`, `productionHistory`, `awards` now run through `sanitizeRichText` before DB insert (POST, PATCH, PUT handlers) |
| M6 OIDC origin | `routes/auth.ts` | `getOrigin()` uses `PUBLIC_SITE_URL` env var when set; header fallback only in dev |
| L2 PII logs | `lib/email.ts` | Removed `to`, `reply_to`, `subject` from `console.log`; kept Resend id and HTTP status code |

## Still open (deferred — not in scope of this pass)

- **M2** — OIDC tokens in plaintext JSONB sessions (would require token encryption layer)
- **M3** — About page has no draft/publish lifecycle (schema change required)
- **M4** — GET logout CSRF (requires CSRF token or POST refactor)
- **M5** — Bearer = raw session ID, 7-day TTL no rotation
- **L1** — Shared rate limiter instance across contact + script-request
- **L3** — No explicit body size limit on public endpoints
- **L4** — No PostgreSQL CHECK constraints on enum columns
- **L5** — CONTACT_RECIPIENT_EMAIL not a Replit secret
- **L6** — clearCookie attribute mismatch

## Pre-existing TypeScript errors (not introduced by security fixes)

`tsc --noEmit` reports ~21 errors, none in files changed by this pass except `plays.ts` which has a pre-existing `coverImageAlt` Drizzle-type mismatch (db package not rebuilt). `routes/storage.ts` now has zero TypeScript errors (was 2, caused by H3 broken method calls).

## Key decisions

**Why:** `trust proxy: 1` — Replit uses a single proxy hop. This makes `req.ip` resolve to the real client IP from the X-Forwarded-For entry the proxy writes, while ignoring any client-supplied prefix values.

**Why:** `PUBLIC_SITE_URL` for OIDC origin — in production this must be set as a Replit secret/env var. Without it the dev fallback (header-based) is used, which is acceptable in Replit's controlled dev environment.
