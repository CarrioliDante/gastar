# Gastar Web — TODO

> Actualizado 2026-05-22. Solo tareas del dashboard web (Next.js 16 App Router).

---

## 2026-05-22 — Fixes UX: modales, layout shift, DatePicker

- [x] Fix crash bloques sin datos — null guard en `block.budget` y `block.id`
- [x] AddGoalForm, AddForm (installments), AddForm (recurring) → modal overlay en vez de inline (elimina layout shift)
- [x] DatePicker: `<button>` → `<input readOnly>` (altura idéntica a inputs)
- [x] DatePicker: placeholder "Fecha limite" → "Fecha límite"
- [x] AddGoalForm rediseñado vertical en vez de 5 columnas horizontales
- [x] AddForm modals: removido `borderBottom`/`padding` residual del inline styling

---

## CRUD pendiente

### Installments
- [x] `updateInstallment(id, data)` — server action + form inline de edición
- [x] Validar que las cuotas pagadas no excedan el total
- [x] DatePicker editorial para startedAt y nextDueDate
- [x] nextDueDate auto-calculado de startedAt + paidInstallments
- [ ] Mostrar monto total del crédito O valor por cuota de forma prominente en la lista
- [ ] Campo "cantidad de cuotas" — solo aceptar números (input type=number con validación)
- [ ] Agregar selector de categoría a cuotas (web + mobile)

### Recurring
- [x] `toggleRecurringPause(id)` — server action que escribe `pausedAt`
- [x] Botón pausar/reanudar en cada fila
- [x] `updateRecurring(id, data)` — server action + EditRecurringForm inline
- [ ] Ícono opcional en Recurring (`icon` field + fallback a categoría)

### Goals (completadas)
- [x] Toggle Activas/Completadas con query `getCompletedGoals`
- [x] Completed goals cards sin botones de acción

### Goals
- [x] `updateSavingsGoal(id, data)` — server action + form inline de edición
- [x] DatePicker editorial para deadline (crear y editar)
- [x] Error handling: onSuccess close + error display en AddGoalForm y contribute

### Blocks
- [x] `createBlock` / `updateBlock` / `archiveBlock` — completo
- [x] `unarchiveBlock` — revivir bloque archivado
- [x] Toggle Activos/Archivados con query `getArchivedBlocks`
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
- [x] **Dólar** — página `/dolar`, modelo `DollarOperation`, compra/venta con `$transaction`, toggle ARS/USD en dashboard, cotizaciones Blue + Oficial desde dolarapi.com
- [ ] Emergency fund widget — meses cubiertos con ahorros

---

## Analytics

- [x] SpendingHeatmap (GitHub-style) — reemplaza AreaChart + BarChart en Lectura
- [x] Tooltip en celdas del heatmap
- [x] Comparativa mes anterior — delta % badges (`↑ +12%` / `↓ -8%`) en stats
- [ ] Split-flap balance — animación de dígitos individuales

---

## Auth

- [ ] Login con Google — OAuth provider + botón
- [ ] Login con Apple — OAuth provider + botón

---

## Publicación App Store + Play Store

- [ ] Deploy a Vercel/Railway — dominio público como `EXPO_PUBLIC_API_URL`
- [ ] Environment vars en hosting: `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, etc.
- [ ] `/privacy` page — política de privacidad pública (requerida por ambos stores)
- [ ] `/api/mobile/*` endpoints — verificar que todos respondan correctamente
- [ ] Rate limiting en mobile API — protección básica contra abuso
- [ ] Health check endpoint — monitoreo básico

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
