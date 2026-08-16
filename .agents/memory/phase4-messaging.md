---
name: Phase 4 messaging
description: Contact form + script request implementation decisions and gotchas
---

# Phase 4 — Messaging system

## Architecture
- Single `messages` table with `type` discriminator (`contact` | `script_request`), not two tables.
- Status lifecycle: `new` → `read` (auto-set when admin opens detail) → `archived`.
- Shared in-memory rate limiter (`createRateLimiter`) instance applied to BOTH POST /api/contact and POST /api/script-requests. That means 5 submissions/IP/15 min across both endpoints combined.

## Rate limiter
- `artifacts/api-server/src/lib/rateLimit.ts` — in-memory per-IP. Not Redis; single-instance only. Has setInterval cleanup every 60 s with `.unref()` to allow clean process exit.

## Email (Resend)
- `artifacts/api-server/src/lib/email.ts` — sends via Resend REST API using native fetch, no SDK.
- Gracefully optional: if `RESEND_API_KEY` env var absent, logs warning and returns `{ ok: false, reason: 'not_configured' }`. The DB insert always succeeds first; email is fire-and-forget.
- Two env vars needed: `RESEND_API_KEY` (secret), `CONTACT_RECIPIENT_EMAIL` (non-secret, the author's address), `CONTACT_SENDER_EMAIL` (optional, defaults to `noreply@bohatova.art`).
- Domain `bohatova.art` must be verified in Resend dashboard for from-address to work. Free tier is 3,000/month.

## Script request endpoint
- `POST /api/script-requests` — requires `playSlug` in body; server resolves it to `play_id` via `innerJoin(playTranslationsTable, ... status='published')`.
- Returns 404 if the play has no published translation for the requested locale.
- Frontend sends `playSlug` from URL params (never internal numeric ID).

## Translations
- All new keys added to all 4 locales in `artifacts/storytellers-stage/src/translations.ts`.
- `contact.categories` — 7 enum values; `scriptRequest.intendedUseOptions` — 7 enum values.
- Frontend validation messages come from `t.contact.validation.*` and `t.scriptRequest.validation.*` passed into Zod schema factories (`makeSchema(v)`).

## Admin UI
- `AdminMessages` — list with All/Contact/Script Requests tabs, filter client-side.
- `AdminMessageDetail` — auto-marks message `read` on open (non-critical PATCH). Confirm-delete pattern: first click shows "Confirm Delete", second click executes.
- `AdminLayout` — `Mail` icon added for Messages nav item.
- `AdminDashboard` — uses `anyStats` type cast to access `newContactMessages` / `newScriptRequests` (Orval types may lag behind actual API response shape).

**Why `anyStats` cast:** Orval codegen types are generated from the OpenAPI spec; the dashboard response shape was extended in-code without regenerating the spec. Future: update the spec and re-run codegen.
