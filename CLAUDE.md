@AGENTS.md

# Gastar

Minimalist personal finance OS. Web: Next.js 16 App Router + Supabase + Prisma 7/PostgreSQL.
Mobile: Expo 54 + React Native (NativeWind). Shared type contracts in `packages/shared`.

## Commands

### Workspace (root)
```bash
pnpm dev:web          # Next.js dev on :3000
pnpm dev:mobile       # Expo dev server
pnpm dev:landing      # Landing page dev
pnpm build:web        # Production build
pnpm typecheck        # tsc --noEmit across all packages
pnpm lint             # ESLint across all packages
```

### Web (`apps/web`)
```bash
pnpm prisma generate    # Regenerate → src/generated/prisma/
pnpm prisma db push     # Apply schema changes (migrate dev fails — no shadow DB on Supabase free tier)
pnpm prisma migrate dev # Only works with a local Postgres shadow DB configured
pnpm prisma studio      # DB browser
```

### Mobile (`apps/mobile`)
```bash
pnpm ios              # iOS simulator
pnpm android          # Android emulator
```

## Architecture

```
apps/web      — Next.js dashboard + auth + Server Actions + mobile REST API
apps/mobile   — Expo app; has no backend — calls web's /api/mobile/* exclusively
apps/landing  — Static marketing page, no DB
packages/shared — Shared TypeScript types only (no runtime code)
```

### Mobile ↔ Web API Bridge

The mobile app's entire data layer is backed by `apps/web/src/app/api/mobile/*`.
Mobile sends `Authorization: Bearer <supabase_jwt>`; web verifies via
`supabaseAdmin.auth.getUser()` in `apps/web/src/app/api/mobile/_auth.ts`.

Web dashboard uses a completely separate auth pattern: Supabase SSR (cookie-based
sessions via `src/lib/supabase/server.ts`). Both coexist in the same Next.js app.

Web mutations go through Server Actions (`src/app/actions/`).
Mobile mutations go through `POST /api/mobile/transactions` only — all other
mobile endpoints are read-only GETs.

### Web Client Data Layer

Server Actions in `src/app/actions/queries.ts` serve as queryFn for TanStack Query.
Query keys are centralized in `src/hooks/query-keys.ts` (`qk.*`).
Client query hooks live in `src/hooks/queries.ts`; mutation hooks in `src/hooks/mutations.ts`.
Always use `staleTime: 0` for financial data — never cache stale amounts.

## Domain Model

| Model             | Key fields                                                              |
|-------------------|-------------------------------------------------------------------------|
| `Transaction`     | userId, name, amount, category, date, blockId?                          |
| `Block`           | userId, name, icon, budget, goal?, color, archivedAt?                   |
| `Installment`     | userId, totalAmount, monthlyAmount, paidInstallments, nextDueDate       |
| `SavingsGoal`     | userId, targetAmount, currentAmount, deadline?                          |
| `RecurringExpense`| userId, amount, category, frequency, dayOfMonth?, nextDueDate, blockId? |
| `UserSetting`     | userId, key, value (KV store for preferences/monthly budget)            |

## Key File Paths

| Purpose                   | Path                                              |
|---------------------------|---------------------------------------------------|
| Mobile API fetch util      | `apps/mobile/lib/api.ts`                          |
| Mobile React Query hooks   | `apps/mobile/lib/hooks/index.ts`                  |
| Mobile auth store          | `apps/mobile/store/auth.ts`                       |
| Mobile app store           | `apps/mobile/store/app.ts`                        |
| Mobile theme tokens        | `apps/mobile/lib/theme.ts`                        |
| Mobile formatters          | `apps/mobile/lib/format.ts`                       |
| Mobile static/fallback data| `apps/mobile/lib/data.ts`                         |
| Web DB singleton (Prisma)  | `apps/web/src/lib/db.ts`                          |
| Web auth DAL               | `apps/web/src/lib/dal.ts` (`getUser`, `requireUser`) |
| Web mobile API auth        | `apps/web/src/app/api/mobile/_auth.ts`            |
| Web mobile endpoints       | `apps/web/src/app/api/mobile/`                    |
| Web Server Actions         | `apps/web/src/app/actions/`                       |
| Web query fns (Server)     | `apps/web/src/lib/queries/`                       |
| Web query hooks (Client)   | `apps/web/src/hooks/queries.ts`                   |
| Web mutation hooks         | `apps/web/src/hooks/mutations.ts`                 |
| Web query keys             | `apps/web/src/hooks/query-keys.ts`                |
| Web UI store (Zustand)     | `apps/web/src/stores/ui.ts`                       |
| Prisma schema              | `apps/web/prisma/schema.prisma`                   |
| Shared types               | `packages/shared/src/types/`                      |

## Conventions

**Web**: `page.tsx` = Server Component. `*-client.tsx` = Client Component in same dir.
Actions in `src/app/actions/`, DB queries in `src/lib/queries/`. Prisma always imported
from `@/generated/prisma` — never from `@prisma/client`.
Auth gate: use `requireUser()` from `src/lib/dal.ts` in Server Components; never call
Supabase auth directly in page files.

**Mobile**: Expo Router v6 file-based routing. Route groups: `(auth)`, `(tabs)`.
NativeWind for styling (Tailwind classes on RN views). Zustand for global state,
React Query for server state. UI primitives in `components/ui/`.

**Shared**: Any type crossing the web/mobile boundary belongs in `packages/shared/src/types/`.
Types in `apps/mobile/lib/api.ts` are mobile-local API response shapes — consolidate
to shared when contracts stabilize.

## Environment Variables

**`apps/web`** (all required):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — used by mobile API auth middleware
- `DATABASE_URL` — PostgreSQL connection string (Supabase)

**`apps/mobile`** (all required):
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_API_URL` — base URL of web app (default: `http://localhost:3000`)

## Non-Obvious Constraints

- Mobile has no standalone backend. Never add a separate API server — extend `/api/mobile/` instead.
- `EXPO_PUBLIC_API_URL` must be the machine's LAN IP when testing on a physical device
  or iOS simulator that can't reach `localhost`.
- Prisma client must be imported from `@/generated/prisma`, not `@prisma/client`.
- `useAppStore.theme` defaults to `'light'` and is not persisted — resets on app restart.
- `prisma migrate dev` requires a shadow DB — on Supabase free tier, use `prisma db push` instead.
- No test suite. No CI/CD pipeline. Playwright is installed at root but has zero test files.
- `.mcp.json` contains a live Supabase service token — never commit it and never expose it.

## What to Avoid

- No color or gradients in UI — intentionally monochromatic across web and mobile.
- No Prisma queries outside `src/lib/queries/` or Server Actions.
- No new dependencies without checking existing utilities first.
- Do not call Supabase auth directly in page Server Components — use `getUser()`/`requireUser()` from `src/lib/dal.ts`.
- Do not add `router.refresh()` or `revalidatePath` for client-driven mutations — TanStack Query cache invalidation handles it.
