# Gastar Mobile — TODO

> Actualizado 2026-05-18. Solo tareas de la app mobile (Expo + React Native).

---

## Mutations faltantes

### Transactions
- [x] Crear — CaptureSheet funcional (keypad, categorías, selector de bloque)
- [ ] Editar — modal o swipe action
- [ ] Eliminar — confirmación + optimistic update
- [ ] Campo nombre/nota en CaptureSheet (hoy usa la categoría como nombre)
- [ ] Date picker en CaptureSheet (hoy siempre usa today)

### Blocks
- [x] Crear — CreateBlockModal inline en blocks.tsx
- [ ] Editar — modal de edición (nombre, budget, ícono)
- [ ] Archivar/eliminar

### Installments
- [ ] Crear — mutation + form
- [ ] Pagar cuota
- [ ] Eliminar

### Recurring
- [ ] Crear — mutation + form
- [ ] Marcar como pagado
- [ ] Eliminar

### Goals
- [ ] Pantalla de Goals (no existe)
- [ ] Crear meta
- [ ] Contribuir a meta
- [ ] Eliminar meta

---

## Pantallas faltantes

- [ ] **Calendar** — no existe screen ni componente
- [ ] **Goals** — tipo definido en `lib/data.ts` pero sin usar
- [ ] **Installments** — solo summary en Insights, sin pantalla dedicada
- [ ] **Recurring** — solo summary en Insights, sin pantalla dedicada
- [ ] **Transaction detail** — rows no son tappeables

---

## UX pendiente

- [ ] Empty states en lista de transacciones ("Sin movimientos")
- [ ] Empty state en lista de bloques ("Sin bloques")
- [ ] Error handling en mutations (CaptureSheet, forms)
- [ ] Error boundary global
- [ ] Swipe-to-delete / long-press menu en filas
- [ ] Pull-to-refresh con feedback visual más claro

---

## API endpoints faltantes en web

El mobile consume `apps/web/src/app/api/mobile/*`. Faltan endpoints POST para:

- [ ] `POST /api/mobile/installments` — crear cuota
- [ ] `POST /api/mobile/installments/[id]/pay` — pagar cuota
- [ ] `DELETE /api/mobile/installments/[id]` — eliminar cuota
- [ ] `POST /api/mobile/recurring` — crear recurrente
- [ ] `POST /api/mobile/recurring/[id]/pay` — marcar pagado
- [ ] `DELETE /api/mobile/recurring/[id]` — eliminar recurrente
- [ ] `GET/POST /api/mobile/goals` — CRUD metas
- [ ] `PUT /api/mobile/transactions/[id]` — editar transacción
- [ ] `DELETE /api/mobile/transactions/[id]` — eliminar transacción
- [ ] `PUT /api/mobile/blocks/[id]` — editar bloque
- [ ] `DELETE /api/mobile/blocks/[id]` — archivar bloque

---

## Mobile avanzado

- [ ] Offline-first — React Query offline + MMKV + Zustand persist
- [ ] Push notifications — Expo Push para vencimientos de cuotas
- [ ] Calendar view mobile
- [ ] Error handling en forms de auth (signup, login)
- [ ] Form validation (email, password strength)

---

## Diferencias con webapp

Lo que la webapp tiene y mobile todavía no.

### Íconos / Glyphs
- [ ] Web tiene 36 glyphs (Tabler Icons semánticos: Home, Car, Coffee, etc.)
- [ ] Mobile tiene solo 12 (geométricos abstractos: circle, dot, square, etc.)
- [ ] Expandir a 36 glyphs o migrar a Tabler Icons para paridad visual

### Settings
- [ ] **Presupuesto mensual** — web tiene input + server action `setMonthlyBudget`
- [ ] **Currency picker** — web tiene USD/ARS/BRL/EUR
- [ ] **CSV Export** — web tiene link `/api/export`

### Charts
- [ ] **AreaChart** — web usa recharts (gradient fill), mobile no tiene
- [ ] **RadarChart** — web tiene spider chart de salud financiera en Insights
- [ ] **Donut / CategoryBreakdown** — web tiene gráfico de torta por categoría
- [ ] **Grouped BarChart** — web tiene barras lado a lado (ingreso vs gasto)

### Animaciones
- [ ] Web tiene ScrollReveal, TextReveal, AnimatedNumber, PageTransition
- [ ] Mobile solo usa Reanimated en PreBoot, login y onboarding
- [ ] **Cero animaciones en tab screens** (home, transactions, blocks, insights)
- [ ] Agregar entrance animations + stagger en listas

### Filtros en Transactions
- [ ] **Month filter** — web tiene dropdown de meses
- [ ] **Category filter** — web tiene dropdown de categorías únicas
- [ ] **Text search** — web tiene input de búsqueda (nombre + categoría + nota)
- [ ] **Column sorting** — web permite ordenar por fecha, descripción, categoría, monto

### Export / Data
- [ ] Web tiene CSV export en settings y transactions
- [ ] Mobile no tiene export ni share sheet

### Stats / Data shape
- [ ] Web incluye `incomeTrend` (6 meses) — mobile no
- [ ] Web balance es objeto `{total, currency, change}` — mobile es plain number
- [ ] Unificar tipos entre `StatsResponse` mobile y `DashboardStats` web
