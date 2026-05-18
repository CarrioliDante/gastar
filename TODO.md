# Gastar — Roadmap

> Actualizado 2026-05-18. Fases ordenadas por dependencia y prioridad.

---

## Fase 1 — Flujo crítico ✅

Cosas que un usuario nuevo encuentra rotas o incompletas.

### 1.1 Error handling en forms
- [x] QuickExpense — mostrar mensaje de error visible cuando falla la server action
- [x] Create/Edit Block modal — ídem
- [x] Create Installment / Recurring — ídem
- [x] Server actions throw errores descriptivos en vez de `return;` silencioso
- [x] Success UI solo en `onSuccess` — sin "guardado" falso
- [x] FK validation en `blockId` (mobile API + server action web)
- [ ] Mobile CaptureSheet — mostrar errores de mutation

### 1.2 Editar Block
- [x] Server action `updateBlock(id, { name, budget, icon })`
- [x] EditBlockModal reutiliza estructura de Create
- [x] Optimistic update + rollback en cache
- [x] Error handling en el modal

### 1.3 Empty states
- [x] Dashboard: Bloques, Cuotas, Recurrentes con copy + CTA
- [x] Transactions vacío — copy + CTA
- [x] Blocks vacío — CTA
- [x] Installments vacío — copy + CTA
- [x] Goals vacío — copy + CTA

---

## Fase 2 — Dashboard zen ✅

### 2.1 Simplificar vista inicio
- [x] Eliminado "Sincronizado", stats "Pulso" y "Disponible"
- [x] Balance 96px protagonista absoluto
- [x] Sparkline reemplazado por gráfico de barras de gasto mensual (6 meses)
- [x] 4 secciones con ritmo visual consistente (Bloques, Gasto mensual, Cuotas, Recurrentes)
- [x] Category breakdown solo visible sin bloques
- [x] Formato de moneda unificado con `useCurrency`
- [x] Whitespace y tipografía revisados

---

## Fase 3 — CRUD completo

### 3.1 Anotar ingreso desde header
- [x] Shortcut `⌘⇧N` en web — ya existe en `keyboard-shortcuts.tsx`
- [ ] Tooltip visible en el botón del header

### 3.2 Editar cuota existente (Installments)
- [ ] Server action `updateInstallment(id, { name, totalAmount, monthlyAmount, paidInstallments })`
- [ ] Modal de edición en la lista de Installments

### 3.3 Pausar / reanudar Recurring
- [ ] Server action `toggleRecurringPause(id)` — escribe `pausedAt`
- [ ] Botón en fila de la lista (campo `pausedAt` ya existe en schema)

### 3.4 Editar meta de ahorro (Goals)
- [ ] Server action `updateSavingsGoal(id, { name, targetAmount, deadline })`
- [ ] Modal de edición en Goals

### 3.5 Detalle de transacciones por bloque
- [ ] Query `getTransactionsByBlock(blockId, userId)` en `lib/queries/`
- [ ] Reemplazar trend sintético en el panel derecho de Blocks con lista real

### 3.6 Settings — cambiar nombre de usuario
- [ ] `supabase.auth.updateUser({ data: { full_name } })` en server action
- [ ] Campo editable en Settings

---

## Fase 4 — Mobile: paridad funcional

### 4.1 Arreglar conexión a datos
- [x] API bridge funcional — 7 endpoints + auth JWT
- [x] React Query hooks para todas las entidades
- [ ] Mobile POST endpoints para installments, recurring, goals

### 4.2 Pantallas faltantes
- [ ] Calendar — no existe screen
- [ ] Goals — no existe screen, tipo definido pero sin uso
- [ ] Installments — solo summary en Insights, sin pantalla dedicada
- [ ] Recurring — solo summary en Insights, sin pantalla dedicada
- [ ] Transaction detail — rows no son tappeables

### 4.3 FAB simplificado
- [x] Dos botones fijos: Expense (−) e Income (+)

### 4.4 Mutations faltantes en mobile
- [x] Crear transacción (CaptureSheet funcional)
- [x] Crear Block (CreateBlockModal inline)
- [ ] Editar transacción
- [ ] Eliminar transacción
- [ ] Editar / archivar Block
- [ ] Crear Installment
- [ ] Pagar / eliminar Installment
- [ ] Crear Recurring
- [ ] Pagar / eliminar Recurring
- [ ] Crear / contribuir / eliminar Goal
- [ ] Error states en mutations

### 4.5 UX mobile pendiente
- [ ] Empty states en lista de transacciones y bloques
- [ ] Nombre y nota en CaptureSheet (hoy solo usa categoría)
- [ ] Date picker para transacciones
- [ ] Error boundary global
- [ ] Swipe actions en filas

### 4.6 Paridad visual con webapp
- [ ] **Glyphs**: mobile tiene 12 geométricos, web tiene 36 Tabler Icons — expandir
- [ ] **Charts**: mobile no tiene AreaChart, RadarChart, Donut (web sí)
- [ ] **Animaciones**: mobile solo en auth/preboot, cero en tab screens (web tiene en cada página)
- [ ] **Filtros**: mobile no tiene month filter, category filter, text search, column sort
- [ ] **Settings**: mobile no tiene presupuesto mensual ni currency picker
- [ ] **Export**: mobile no tiene CSV export

---

## Fase 5 — Features de producto

### 5.1 Smart categorization
- [ ] Tabla de patrones en `lib/categorization.ts` — regex por comercio
- [ ] Aplicar en `createTransaction` server action como pre-fill
- [ ] UI: sugerencia visual que el usuario puede overridear

### 5.2 Runway calculator
- [ ] Cálculo en `lib/queries/stats.ts` — promedio gasto 3 meses vs saldo Goals
- [ ] Widget en Dashboard — "a este ritmo tus ahorros duran N meses"

### 5.3 Zen Monday Digest
- [ ] Banner lunes en Dashboard con resumen semanal
- [ ] Lógica: solo visible el lunes, `UserSetting` para no repetir
- [ ] Copy minimalista

### 5.4 Dólar blue / MEP
- [ ] Fetch cotización desde `dolarapi.com` (API pública, sin auth)
- [ ] Doble balance en el hero — moneda local + equivalente USD
- [ ] Convertir stats principales a USD en secondary label
- [ ] Cache con `unstable_cache` + revalidate cada 1 hora

### 5.5 Emergency fund widget
- [ ] Cálculo: saldo Goals / promedio gasto mensual = N meses
- [ ] Widget en Dashboard o Insights

---

## Fase 6 — Analytics

### 6.1 Comparativa mes anterior
- [ ] Query delta % en stats principales de Insights
- [ ] UI: badge `+X%` o `−X%` junto a cada stat

### 6.2 Split-flap balance
- [ ] Componente `SplitFlap` — anima cada dígito individualmente
- [ ] Integrar en el balance hero del Dashboard

---

## Fase 7 — Auth OAuth

### 7.1 Google
- [ ] Habilitar provider en Supabase Dashboard
- [ ] Botón "Continuar con Google" en `/login` y `/signup`
- [ ] `supabase.auth.signInWithOAuth({ provider: 'google' })`

### 7.2 Apple
- [ ] Requiere Apple Developer account + Service ID
- [ ] Botón "Continuar con Apple" en iOS

---

## Fase 8 — Infraestructura

- [ ] **RLS en Supabase** — capa extra sobre filtrado `userId`
- [ ] **Connection pooler** — configurar en Supabase Dashboard
- [ ] **Revalidación granular** — tags por entidad en lugar de `user:${id}`
- [ ] **`.env.example`** — documentar variables requeridas
- [ ] **Tipos `@gastar/shared`** — sincronizar con Prisma models
- [ ] **`useCurrency`** — extender a transactions-client y calendar-client

---

## Fase 9 — Mobile avanzado

- [ ] **Offline-first** — React Query offline + MMKV + Zustand persist
- [ ] **Push notifications** — Expo Push Notifications para vencimientos
- [ ] **Calendar view mobile** — vista mensual de transacciones + vencimientos
- [ ] **Error handling en forms mobile** — auth (signup, login) y CaptureSheet

---

## Backlog

Features válidos sin prioridad acordada aún.

- [ ] **Import CSV** — extracto de banco (Mercado Pago, BBVA, Galicia)
- [ ] **Quincena mode** — ciclos de 15 días para salario quincenal (LATAM)
- [ ] **Historial de cuotas pagadas** — transacciones generadas por cada cuota
- [ ] **Ícono en Recurring** — campo `icon` opcional en `RecurringExpense`
- [ ] **Font picker** — persiste preferencia (web)
- [ ] Cuota sin interés con inflación real (requiere API externa)
- [ ] Split expenses (multi-usuario)
- [ ] Salary anticipation curve
- [ ] Retirement calculator
- [ ] Collaborative budgets / shared household

---

## Archivo — Completado

<details>
<summary>Ver completados (2026-05-13 → 2026-05-18)</summary>

### Infraestructura
- [x] Monorepo pnpm (web + landing + mobile + shared)
- [x] Next.js 16 App Router + Prisma 7 + Supabase PostgreSQL
- [x] Auth email/password con Supabase SSR (cookie-based)
- [x] Separación de datos por usuario (`userId` en todos los modelos)
- [x] Server Actions + TanStack Query v5 + optimistic updates
- [x] Mobile API bridge — 7 endpoints + JWT Bearer auth
- [x] Capa de queries: `lib/queries/`, hooks centralizados, `staleTime: 0`
- [x] Keyboard shortcuts (`⌘N` gasto, `⌘⇧N` ingreso, `⌘K` comando)

### Web — Features
- [x] Dashboard completo — balance hero 96px, stats, blocks grid, cuotas, recurrentes, gráfico de barras mensual
- [x] Transactions — historial agrupado por fecha, filtros (mes, categoría, texto, tipo), delete inline
- [x] Blocks — grid editorial, panel derecho con editar/archivar, Create Block con picker de 36 glyphs Tabler
- [x] Insights — pie chart, area chart, bar chart, radar, pulso financiero
- [x] Calendar — vista mensual con datos reales (cuotas + recurrentes)
- [x] Goals — crear, contribuir, eliminar metas de ahorro
- [x] Installments — crear, pagar, eliminar cuotas
- [x] Recurring — crear, marcar pagado, eliminar recurrentes
- [x] Settings — presupuesto mensual, tema, moneda, export CSV, logout
- [x] Landing page — hero, features, pricing, FAQ, dark mode
- [x] Dark mode completo — CSS tokens + ThemeProvider + toggle
- [x] CSV export funcional
- [x] 36 glyphs Tabler — migración completa, `GlyphKind` unificado
- [x] Sistema de animaciones — spring presets, ScrollReveal, AnimatedNumber, RevealText, PageTransition
- [x] Error handling en todos las forms de creación (QuickExpense, Block, Installment, Recurring, Goals)
- [x] FK validation en `blockId` (mobile API + server action web)
- [x] Empty states con copy + CTA en dashboard y páginas dedicadas

### Mobile — Features
- [x] Scaffolding Expo + NativeWind + Supabase JWT auth + Zustand store
- [x] React Query hooks — transactions, blocks, installments, recurring, stats, user
- [x] Todas las pantallas con datos reales (home, transactions, blocks, insights, settings)
- [x] Animación PreBoot → Login (zoom ease-out, sin flicker)
- [x] Loading state con respiración del círculo negro
- [x] Bottom nav 4 tabs simétricas + FAB (expense/income)
- [x] Settings fuera de tabs (`app/settings.tsx`, acceso desde header)
- [x] Login + onboarding 4-step flow
- [x] CaptureSheet funcional (crear transacción con keypad, categorías, bloque)
- [x] CreateBlockModal inline en blocks.tsx
- [x] Pull-to-refresh en pantallas principales
- [x] Light/dark theme + 3 font options
- [x] Chunked SecureStore para JWTs grandes

</details>
