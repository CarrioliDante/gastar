# Gastar Mobile — TODO

> Actualizado 2026-05-18. Solo tareas de la app mobile (Expo + React Native).

---

## Mutations faltantes

### Transactions
- [x] Crear — CaptureSheet funcional (keypad, categorías, selector de bloque)
- [x] Campo nombre/nota en CaptureSheet (fallback a categoría si está vacío)
- [ ] Editar — modal o swipe action
- [ ] Eliminar — confirmación + optimistic update
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
- [x] Pantalla de Goals — `/goals` con radial hero y progress por objetivo
- [ ] Crear meta
- [ ] Contribuir a meta
- [ ] Eliminar meta

---

## Pantallas faltantes

- [x] **Goals** — `/goals` dedicada, accesible desde Home e Insights
- [x] **Installments** — `/installments` dedicada con progress dots y total mensual
- [ ] **Calendar** — no existe screen ni componente
- [ ] **Recurring** — solo summary en Insights, sin pantalla dedicada
- [ ] **Transaction detail** — rows no son tappeables

---

## UX pendiente

- [x] Empty state en lista de transacciones ("Sin movimientos" / "Sin resultados")
- [x] Empty state en lista de bloques ("Sin bloques")
- [ ] Error handling en mutations (CaptureSheet, forms)
- [ ] Error boundary global
- [ ] Swipe-to-delete / long-press menu en filas
- [ ] Pull-to-refresh con feedback visual más claro

---

## API endpoints faltantes en web

El mobile consume `apps/web/src/app/api/mobile/*`. Faltan endpoints POST para:

- [x] `GET /api/mobile/goals` — listar metas (implementado)
- [x] `GET /api/mobile/transactions?month=YYYY-MM` — filtro por mes (implementado)
- [ ] `POST /api/mobile/installments` — crear cuota
- [ ] `POST /api/mobile/installments/[id]/pay` — pagar cuota
- [ ] `DELETE /api/mobile/installments/[id]` — eliminar cuota
- [ ] `POST /api/mobile/recurring` — crear recurrente
- [ ] `POST /api/mobile/recurring/[id]/pay` — marcar pagado
- [ ] `DELETE /api/mobile/recurring/[id]` — eliminar recurrente
- [ ] `POST /api/mobile/goals` — crear meta
- [ ] `PUT /api/mobile/goals/[id]` — contribuir / editar meta
- [ ] `DELETE /api/mobile/goals/[id]` — eliminar meta
- [ ] `PUT /api/mobile/transactions/[id]` — editar transacción
- [ ] `DELETE /api/mobile/transactions/[id]` — eliminar transacción
- [ ] `PUT /api/mobile/blocks/[id]` — editar bloque
- [ ] `DELETE /api/mobile/blocks/[id]` — archivar bloque

---

## Mobile avanzado

- [x] Persistencia de preferencias — Zustand persist + expo-secure-store (theme/font/currency)
- [ ] Offline-first de datos — React Query offline + MMKV para transacciones sin conexión
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
- [x] **Currency picker** — ARS/USD/BRL/EUR implementado, persiste entre sesiones
- [ ] **Presupuesto mensual** — web tiene input + server action `setMonthlyBudget`
- [ ] **CSV Export** — web tiene link `/api/export`

### Transactions
- [x] **Month filter** — navegación prev/next por mes, pasa `?month=YYYY-MM` al API
- [x] **Text search** — input de búsqueda toggle con lupa
- [ ] **Category filter** — dropdown de categorías únicas
- [ ] **Column sorting** — ordenar por fecha, descripción, categoría, monto

### Charts
- [ ] **AreaChart** — web usa recharts (gradient fill), mobile no tiene
- [ ] **RadarChart** — web tiene spider chart de salud financiera en Insights
- [ ] **Donut / CategoryBreakdown** — web tiene gráfico de torta por categoría
- [ ] **Grouped BarChart** — web tiene barras lado a lado (ingreso vs gasto)

### Animaciones
- [ ] Web tiene ScrollReveal, TextReveal, AnimatedNumber, PageTransition
- [ ] Mobile solo usa Reanimated en CaptureSheet, login y onboarding
- [ ] **Cero animaciones en tab screens** (home, transactions, blocks, insights)
- [ ] Agregar entrance animations + stagger en listas

### Export / Data
- [ ] Web tiene CSV export en settings y transactions
- [ ] Mobile no tiene export ni share sheet

### Stats / Data shape
- [ ] Web incluye `incomeTrend` (6 meses) — mobile no
- [ ] Web balance es objeto `{total, currency, change}` — mobile es plain number
- [ ] Unificar tipos entre `StatsResponse` mobile y `DashboardStats` web
