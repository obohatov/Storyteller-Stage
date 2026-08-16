---
name: CMS Phase 2 architecture
description: Database-backed CMS for The Storyteller's Stage — schema, routes, admin UI, public pages
---

## Content schema
- `lib/db/src/schema/content.ts` — 5 tables: fairyTalesTable, fairyTaleTranslationsTable, playsTable, playTranslationsTable, aboutTranslationsTable
- Translations have unique index on (parent_id, locale); status enum: 'draft' | 'published' | 'archived'
- Tables pushed with `pnpm --filter @workspace/db run push`

## Backend routes (artifacts/api-server/src/routes/)
- `public-content.ts` — public API: GET /public/fairy-tales, /public/fairy-tales/:slug?locale=, /public/plays, /public/plays/:slug?locale=, /public/about/:locale
- `admin/index.ts` — auth guard (requires req.isAuthenticated()), mounts all admin subrouters
- `admin/fairy-tales.ts` — full CRUD + translation upsert/publish/unpublish
- `admin/plays.ts` — full CRUD + translation upsert/publish/unpublish
- `admin/about.ts` — GET/PUT per locale
- `admin/dashboard.ts` — stats endpoint
- `lib/slug.ts` — generateSlug() utility

## Auth
- Replit OIDC/PKCE via openid-client
- Mobile auth routes REMOVED from auth.ts (web-only project)
- Admin guard: all /admin/* endpoints check req.isAuthenticated()

## Frontend (artifacts/storytellers-stage/src/)
- admin/ — AdminLayout (auth gate), AdminDashboard, AdminFairyTalesList/Edit, AdminPlaysList/Edit, AdminAbout, TiptapEditor, ImageUpload
- public pages rewritten to use @workspace/api-client-react hooks instead of static translations.ts
- /admin routes added to App.tsx (lazy imports, no locale prefix)

**Why:** No external CMS — CMS built directly into the app for author autonomy without code changes.
