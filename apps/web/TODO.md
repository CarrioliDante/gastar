# Gastar Web — TODO

> Actualizado 2026-05-21. Solo tareas del dashboard web (Next.js 16 App Router).

---

## CRUD pendiente

### Installments
- [x] `updateInstallment(id, data)` — server action + form inline de edición
- [x] Validar que las cuotas pagadas no excedan el total
- [x] DatePicker editorial para startedAt y nextDueDate
- [x] nextDueDate auto-calculado de startedAt + paidInstallments

### Recurring
- [x] `toggleRecurringPause(id)` — server action que escribe `pausedAt`
- [x] Botón pausar/reanudar en cada fila
- [x] `updateRecurring(id, data)` — server action + EditRecurringForm inline
- [ ] Ícono opcional en Recurring (`icon` field + fallback a categoría)

### Goals
- [x] `updateSavingsGoal(id, data)` — server action + form inline de edición
- [x] DatePicker editorial para deadline (crear y editar)
- [x] Error handling: onSuccess close + error display en AddGoalForm y contribute

### Blocks
- [x] `createBlock` / `updateBlock` / `archiveBlock` — completo
- [x] `getTransactionsByBlock(blockId, userId)` — query real en `lib/queries/`
- [x] Panel derecho de Blocks: lista real de transacciones

### Settings
- [x] Cambiar nombre de usuario — `supabase.auth.updateUser({ data: { full_name } })`
- [x] Campo editable inline en Settings (hoy es solo lectura)
- [x] Presupuesto mensual — funcional
- [x] Toggle dark mode — funcional
- [x] Selector de moneda — funcional
- [x] Export CSV — funcional
- [ ] **Pulso financiero** — mobile lo muestra en Settings (score 0-100), web no
- [ ] **Diagnosis section** — mobile muestra API URL, ping, stats status en Settings

### Header
- [x] Shortcut `⌘N` (gasto) y `⌘⇧N` (ingreso) — funcional
- [x] Botones editoriales unificados: círculo `+` 32px ink para acciones primarias
- [ ] Tooltip visible en el botón "Anotar"

---

## Features de producto

- [x] Smart categorization — regex por comercio en server action
- [ ] Runway calculator — "tus ahorros duran N meses"
- [ ] Zen Monday Digest — banner semanal silencioso
- [ ] Dólar blue / MEP — doble balance local + USD
- [ ] Emergency fund widget — meses cubiertos con ahorros

---

## Analytics

- [x] SpendingHeatmap (GitHub-style) — reemplaza AreaChart + BarChart en Lectura
- [x] Tooltip en celdas del heatmap
- [ ] Comparativa mes anterior — delta % en stats
- [ ] Split-flap balance — animación de dígitos individuales

---

## Auth

- [ ] Login con Google — OAuth provider + botón
- [ ] Login con Apple — OAuth provider + botón

---

## Infraestructura

- [ ] RLS en Supabase
- [ ] Connection pooler
- [ ] Revalidación granular — tags por entidad
- [ ] `useCurrency` en transactions-client y calendar-client
- [ ] `.env.example`
- [ ] **Daily spend series** — mobile tiene `dailySeries` (gasto diario del mes), web no expone este dato
- [ ] **Pulso server-side** — mobile lo computa en la API, web solo client-side en Insights

---

## Backlog web

- [x] Calendar view avanzada — todas las cuotas (pagadas + pendientes) visibles
- [x] Historial de cuotas pagadas — integrado en calendario
- [x] DatePicker editorial — componente compartido
- [x] ChartTooltip compartido — extraído a componente con formatValue
- [ ] Import CSV de bancos
- [ ] Quincena mode
- [ ] Dark mode: persistir preferencia del toggle correctamente
