---
name: Phase 3 SEO — server-side HTML injection
description: Architecture decisions and gotchas for the meta-server SEO system
---

## What was built

`artifacts/storytellers-stage/meta-server.ts` — thin Express + Vite (middlewareMode) server that:
- Intercepts every HTML request before Vite serves it
- Calls `vite.transformIndexHtml` first (adds dev scripts), then injects per-route SEO
- Injects: `<html lang>`, `<title>`, `<meta description>`, canonical, hreflang, OG, Twitter card, JSON-LD into `<!-- SEO_INJECT_START --> ... <!-- SEO_INJECT_END -->` markers in `index.html`
- Serves `/robots.txt` and `/sitemap.xml` dynamically from the DB
- Returns HTTP 404 for non-existent slug routes (good for search engines)
- Returns `noindex` for `/admin/*` and unknown routes

## Critical env var facts

- `BASE_PATH=/` — NOT `/storytellers-stage`. The Replit proxy strips the base path BEFORE forwarding to the container. The meta-server receives `/en` not `/storytellers-stage/en`.
- `PUBLIC_SITE_URL` — optional, for production canonical URLs. Without it, the server derives the site URL from request headers (works in dev; set this for production deploys).
- `PORT` — injected by Replit workflow; meta-server uses it directly.

## Express 5 compatibility

Express 5 uses path-to-regexp v8 which rejects bare `*` wildcards.
**Fix:** Use `app.use(handler)` (no path argument) for catch-all HTML serving — NOT `app.use('*', handler)`.

## drizzle-orm import in browser package

`@workspace/storytellers-stage` (the Vite SPA package) now has `@workspace/db` and `drizzle-orm` as direct dependencies.
Both are server-only (meta-server.ts imports them). They should NOT be imported in any file that Vite bundles for the browser.

## React Helmet attrs

In JSX inside `react-helmet-async` `<Helmet>` components, `<link>` attributes must use React camelCase conventions:
- `hrefLang` NOT `hreflang` (causes React DOM warning)
- `rel`, `href` — already camelCase compatible

## DB schema additions (Phase 3)

Three new nullable TEXT columns added and pushed to prod:
- `fairy_tale_translations.cover_image_alt`
- `play_translations.cover_image_alt`
- `about_translations.author_photo_alt`

All are stored, served via public API responses, and editable in admin UI.
