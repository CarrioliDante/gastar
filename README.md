# Gastar

Monorepo for Gastar, a minimalist personal finance operating system.

## Apps

- `apps/web`: main authenticated web product built with Next.js 16.
- `apps/landing`: marketing/landing surface built with Next.js.
- `apps/mobile`: Expo/React Native client.
- `packages/shared`: shared types and cross-app contracts.

## Commands

```bash
pnpm dev:web
pnpm dev:landing
pnpm dev:mobile
pnpm build:web
pnpm build:landing
pnpm lint
pnpm typecheck
```

## Notes For Agents

- Keep repo instructions concise and repo-specific.
- Prefer targeted edits over broad rewrites.
- Check `node_modules/next/dist/docs/` when changing Next.js behavior.
