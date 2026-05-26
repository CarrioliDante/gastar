# Gastar Web — TODO

> Actualizado 2026-05-26. Solo tareas del dashboard web (Next.js 16 App Router).

---

## 2026-05-26 — OAuth + CSV Import + Infraestructura ✅

- [x] Tooltip "Anotar" en header — `src/components/ui/tooltip.tsx` (reusable, hover state, top/bottom)
- [x] Google OAuth — `src/app/(auth)/oauth-buttons.tsx` (`GoogleButton` + `OAuthDivider`). Login + signup. Callback detecta new user por `onboarding_completed` → `/onboarding`.
- [x] Import CSV — `src/components/dashboard/csv-importer.tsx`. Detección Mercado Pago/BBVA/Galicia/genérico. Preview con checkboxes + selector categoría por fila. Deduplicación 1 año por `name|amount|date`. Bulk insert via `src/app/actions/import-csv.ts`. Integrado en Settings / sección Datos.
- [x] `.env.example` — documentado con todas las variables (`SUPABASE_*`, `DATABASE_URL`, `DIRECT_URL`)
- [x] RLS Supabase — `UserSetting` y `DollarOperation` habilitados + policy `own_*` (`auth.uid()::text = "userId"`)
- [x] Connection pooler — operativo: `pg.Pool` con `DATABASE_URL` port 6543. `DIRECT_URL` port 5432 para migraciones.

---

## 2026-05-24 — Bugs + Migración categoría cuotas ✅

- [x] Bloques sin techo — `budget >= 0` en canSave. Stat "Disponible" oculto cuando budget=0.
- [x] Monto restante en fila cuotas — `/ mes · {monthly * remaining} restante`
- [x] Selector de categoría en cuotas (web + mobile) — campo `category` en schema `Installment`

---

## 2026-05-22 — Fixes UX: modales, layout shift, DatePicker ✅

- [x] Fix crash bloques sin datos — null guard en `block.budget` y `block.id`
- [x] AddGoalForm, AddForm (installments), AddForm (recurring) → modal overlay en vez de inline
- [x] DatePicker: `<button>` → `<input readOnly>` (altura idéntica a inputs)
- [x] AddGoalForm rediseñado vertical en vez de 5 columnas horizontales

---

## CRUD

### Installments ✅
- [x] `updateInstallment`, selector de categoría, monto restante, nextDueDate auto-calculado

### Recurring ✅
- [x] `toggleRecurringPause`, `updateRecurring` con EditRecurringForm inline
- [ ] Ícono opcional en Recurring (`icon` field + fallback a categoría)

### Goals ✅ / Blocks ✅ / Settings ✅

### Header
- [x] Shortcut `⌘N` / `⌘⇧N`
- [x] Tooltip visible en botón "Anotar"

---

## Features de producto

- [x] Smart categorization
- [x] Dólar — `/dolar`, `DollarOperation`, toggle ARS/USD, cotizaciones Blue + Oficial
- [x] Import CSV — `CsvImporter` en Settings
- [ ] Apple OAuth — requiere Apple Developer account ($99/año)
- [ ] Runway calculator — "tus ahorros duran N meses"
- [ ] Zen Monday Digest — banner semanal silencioso
- [ ] Emergency fund widget — meses cubiertos con ahorros
- [ ] Quincena mode

---

## Analytics

- [x] SpendingHeatmap (GitHub-style)
- [x] Comparativa mes anterior — delta % badges
- [ ] Split-flap balance

---

## Publicación App Store + Play Store

- [ ] Deploy a Vercel/Railway — dominio público para `EXPO_PUBLIC_API_URL`
- [ ] `/privacy` page — política de privacidad pública
- [ ] Rate limiting en mobile API
- [ ] Health check endpoint

---

## Infraestructura pendiente

- [ ] Revalidación granular — tags por entidad en lugar de `user:${id}`
- [ ] `useCurrency` en transactions-client y calendar-client
- [ ] Tipos `@gastar/shared` — sincronizar con Prisma models

---

## Backlog

- [x] Calendar view avanzada — todas las cuotas (pagadas + pendientes)
- [x] Import CSV de bancos
- [ ] Quincena mode
- [ ] Dark mode: persistir preferencia correctamente
- [ ] Pulso financiero (score 0-100) — mobile lo tiene, web no
