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
