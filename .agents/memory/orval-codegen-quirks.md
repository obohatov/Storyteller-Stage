---
name: Orval codegen quirks
description: Known issues with orval v8.23 + Zod v3.25 combination and how to fix them
---

## Issue 1: format: email/uri → Zod v4 methods
Orval v8.23 generates `zod.email()` for `format: email` and `zod.url()` for `format: uri`.
These don't exist in Zod v3.25 — they're Zod v4 methods.

**Fix:** Remove `format: email` and `format: uri` from all OpenAPI spec fields. Plain `type: string` validates fine.

**How to apply:** Before codegen, grep the spec for `format: email` and `format: uri` and remove those lines.

## Issue 2: Types folder collides with Zod const names
When `schemas: { path: "generated/types", type: "typescript" }` is set in orval config, it generates a `generated/types/` folder with TypeScript type aliases (e.g. `type GetPublicFairyTaleParams`). These share names with the Zod schema consts in `generated/api.ts` (e.g. `const GetPublicFairyTaleParams`). TypeScript reports TS2308 when both are re-exported.

**Fix:** Remove `schemas: ...` from the zod output config in `lib/api-spec/orval.config.ts`. Use `z.infer<typeof Schema>` for type inference instead of the generated type aliases.

## Issue 3: Orval appends to workspace-level index.ts
Even after removing schemas config, orval may append `export * from './generated/types'` to `lib/api-zod/src/index.ts` on subsequent codegen runs (it manages the workspace barrel file).

**Fix:** After codegen, ensure `lib/api-zod/src/index.ts` contains only `export * from "./generated/api";`. Delete `generated/types/` directory if it was generated from a previous run.

## Working codegen command
```
pnpm --filter @workspace/api-spec run codegen
```
Runs: orval → generates api.ts (zod) + api.ts + api.schemas.ts (react-query) → typecheck:libs

**How to apply:** After fixing the spec and running codegen, if typecheck:libs fails with module-not-found on ./generated/types, fix index.ts manually to remove the types export.
