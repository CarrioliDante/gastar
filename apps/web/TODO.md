# Gastar Web — TODO

> Actualizado 2026-05-18. Solo tareas del dashboard web (Next.js 16 App Router).

---

## CRUD pendiente

### Installments
- [ ] `updateInstallment(id, data)` — server action + modal de edición
- [ ] Validar que las cuotas pagadas no excedan el total

### Recurring
- [ ] `toggleRecurringPause(id)` — server action que escribe `pausedAt`
- [ ] Botón pausar/reanudar en cada fila
- [ ] Ícono opcional en Recurring (`icon` field + fallback a categoría)

### Goals
- [ ] `updateSavingsGoal(id, data)` — server action + modal de edición

### Blocks
- [x] `createBlock` / `updateBlock` / `archiveBlock` — completo
- [ ] `getTransactionsByBlock(blockId, userId)` — query real en `lib/queries/`
- [ ] Panel derecho de Blocks: reemplazar trend sintético con lista real de transacciones

### Settings
- [ ] Cambiar nombre de usuario — `supabase.auth.updateUser({ data: { full_name } })`
- [ ] Campo editable en Settings (hoy es solo lectura)
- [x] Presupuesto mensual — funcional
- [x] Toggle dark mode — funcional
- [x] Selector de moneda — funcional
- [x] Export CSV — funcional
- [ ] **Pulso financiero** — mobile lo muestra en Settings (score 0-100), web no
- [ ] **Diagnosis section** — mobile muestra API URL, ping, stats status en Settings

### Header
- [x] Shortcut `⌘N` (gasto) y `⌘⇧N` (ingreso) — funcional
- [ ] Tooltip visible en el botón "Anotar"

---

## Features de producto

- [ ] Smart categorization — regex por comercio en server action
- [ ] Runway calculator — "tus ahorros duran N meses"
- [ ] Zen Monday Digest — banner semanal silencioso
- [ ] Dólar blue / MEP — doble balance local + USD
- [ ] Emergency fund widget — meses cubiertos con ahorros

---

## Analytics

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

- [ ] Calendar view avanzada (hoy ya muestra cuotas + recurrentes)
- [ ] Import CSV de bancos
- [ ] Quincena mode
- [ ] Historial de cuotas pagadas
- [ ] Dark mode: persistir preferencia del toggle correctamente
