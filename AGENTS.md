<!-- BEGIN:nextjs-agent-rules -->

# Next.js Rules

This repo uses Next.js 16.

- Check `node_modules/next/dist/docs/` before changing framework APIs, routing, caching, metadata, server actions, or config.
- Prefer current docs over training-data assumptions.
<!-- END:nextjs-agent-rules -->

# Repo Rules

- Keep edits small and reuse existing patterns before adding abstractions or dependencies.
- `apps/web` and `apps/landing` are web surfaces; `apps/mobile` is Expo/React Native.
- Keep shared contracts in `packages/shared`.

# Mobile Rules

- `apps/mobile` has no backend — all data comes from `apps/web/src/app/api/mobile/*` REST endpoints.
- Mobile auth is Supabase JWT (`Authorization: Bearer`). Web auth is Supabase SSR (cookies). Never mix them.
- Do not add new mobile endpoints without a corresponding typed interface in `apps/mobile/lib/api.ts`.
- NativeWind (Tailwind v3 via `className`) is the styling system — no inline StyleSheet unless unavoidable.
- Expo Router v6: routes live in `app/`. Use route groups `(auth)` and `(tabs)` for layout segmentation.

# Mobile API Bridge Rules

- API response types defined in `apps/mobile/lib/api.ts` must match exactly what each `apps/web/src/app/api/mobile/*` route returns.
- When adding a new mobile endpoint: add the route in `apps/web`, add the typed interface in `apps/mobile/lib/api.ts`, add the React Query hook in `apps/mobile/lib/hooks/index.ts`.
- Shared types (used in both web and mobile) belong in `packages/shared/src/types/`, not duplicated.

# Shared Package Rules

- `packages/shared` is types only — no runtime dependencies, no side effects.
- Import shared types in both `apps/web` and `apps/mobile` via `@gastar/shared`.
