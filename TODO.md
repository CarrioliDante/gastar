# Gastar — Tareas Pendientes y Mejoras

> Estado al 2026-05-15. Orden dentro de cada sección es de mayor a menor prioridad.

---

## Flujo crítico (impacta retención del usuario nuevo)

- [ ] **Empty states** — usuario nuevo ve pantallas vacías sin guía. Agregar ilustraciones mínimas y copy de primeros pasos en Dashboard, Blocks, Installments, Goals
- [ ] **Error handling en forms** — mostrar mensaje visible en el form cuando una server action falla (ya hay try/catch en todas las acciones, falta UI de error)
- [ ] **Create Block desde UI** — server action `blocks.ts` existe pero no hay form. Es el primer paso del flujo de configuración personal
- [ ] **`.env.example` documentado** — nuevos contribuidores no saben qué variables configurar (DATABASE_URL, Supabase keys, etc.)

---

## Páginas incompletas / placeholder

- [ ] **Calendar** — página existe pero está vacía. Vista mensual de transacciones + vencimientos de cuotas y recurrentes
- [ ] **Settings** — UI existe (`settings-client.tsx`) pero acciones sin implementar:
  - [ ] Cambiar nombre de usuario (escribe a `user_metadata` de Supabase)
  - [ ] Export CSV (botón existe, acción no implementada)
  - [ ] Theme toggle (dark mode real — hoy solo UI)
  - [ ] Font picker (persiste preferencia)

---

## Features de datos (CRUD pendiente)

- [ ] **Filtros en Transactions** — filtrar por categoría, mes, tipo (gasto/ingreso). La query SQL ya hace joins, falta el UI + params
- [ ] **Editar cuota existente** — en Installments hay pay/delete pero no edit (nombre, monto, cuotas restantes)
- [ ] **Editar presupuesto de Block** — el `budget` se fija al crear pero no hay forma de actualizar
- [ ] **Pausa/reanudar en Recurring** — acción de toggle `isActive` existe en schema, falta botón en UI
- [ ] **Anotar ingreso** — solo existe "gasto rápido" (QuickExpense). Agregar ingreso rápido desde header (shortcut `⌘⇧N`)
- [ ] **Comparativa mes anterior en Insights** — la página Insights muestra el mes actual pero no compara contra el anterior

---

## Performance y arquitectura

- [x] ~~**Optimistic updates completos** — migrado a TanStack Query v5. Todas las mutaciones tienen actualización optimista del cache + invalidación en settle. Eliminado `unstable_cache`, `useOptimistic`, Zustand optimistic store y `router.refresh()`.~~
- [x] ~~**Capa de datos offline-first** — hooks en `hooks/queries.ts` y `hooks/mutations.ts`. Query keys en `hooks/query-keys.ts`. Server actions de lectura en `app/actions/queries.ts`. `staleTime: 0` para datos financieros siempre frescos.~~
- [x] ~~**Connection pool mejorado** — `keepAlive`, `maxLifetimeSeconds`, `connectionTimeoutMillis: 15s`, manejo de errores del pool.~~
- [ ] **Revalidación granular** — hoy `revalidateTag` usa un solo tag por usuario. Separar tags por entidad (`blocks:userId`, `transactions:userId`) para no invalidar queries innecesarias. (Menos prioritario ahora que las queries son siempre fresh vía TanStack Query)
- [ ] **Persistencia offline** — TanStack Query persist + MMKV/Zustand para datos offline en mobile y web

---

## Ahorros, Cuotas, Recurrentes (UX completada)

- [x] ~~**Ahorros**: campo "Inicial" en form de meta, sin descuento automático del balance al contribuir~~
- [x] ~~**Cuotas**: campo "Fecha inicio" explícito, cálculo automático basado en cuotas ya pagadas~~
- [x] ~~**Dashboard**: botones "Pagar" en cuotas y recurrentes, estado "Completo" al finalizar~~
- [ ] **Editar meta de ahorro** — cambiar nombre, target, deadline
- [ ] **Historial de cuotas pagadas** — mostrar lista de transacciones generadas por cada cuota

---

## Roadmap de features (acordados, no implementados)

### Fase 4 — Insights completo
- [ ] Pie chart de categorías (recharts `PieChart`)
- [ ] Area chart de tendencia (ya existe base en SpendingChart — ampliar a 12 meses)
- [ ] Bar chart de gastos por semana
- [ ] Comparativa mes anterior con delta %
- [ ] Frecuencia de compra por comercio (top 5)

### Fase 5 — Animaciones fluidas
- [ ] Stagger animations en listas (transactions, blocks, installments) con `motion/react`
- [ ] `layoutId` en cards para transiciones entre vistas (dashboard → detalle)
- [ ] Spring physics en modales (QuickExpense open/close)
- [ ] Número animado en BalanceCard (conteo animado al cambiar el total)

### Fase 6 — Smart features
- [ ] **Smart categorization** — auto-categorizar transacción por nombre del comercio (regex patterns, sin ML). Ej: "Rappi" → Food, "Netflix" → Entertainment
- [ ] **Runway calculator** — "a este ritmo de gasto, tus ahorros duran N meses". Cálculo en `lib/queries/stats.ts`
- [ ] **Zen Monday Digest** — banner lunes al abrir el dashboard con resumen semanal silencioso. Solo visible ese día
- [ ] **Emergency fund widget** — cuántos meses de gastos cubre el saldo actual. Widget pequeño en Dashboard
- [ ] **Dólar blue / MEP** — cotización real para usuarios en Argentina. Convertir gastos en ARS a USD real
- [ ] **Quincena mode** — ciclos de 15 días para salario quincenal (LATAM). Cambia el período base de análisis
- [ ] **Import CSV** — importar extracto de banco (Mercado Pago, BBVA, Galicia). Parser por columnas estándar

---

## Mobile (Expo) — scaffolding mínimo hecho, todo por implementar

- [ ] Pantalla de login / auth flow con Supabase
- [ ] Dashboard con balance y transacciones recientes
- [ ] Quick add transaction (sheet desde tab bar)
- [ ] Blocks list
- [ ] Installments list
- [ ] Offline persistence — React Query + MMKV + Zustand persist
- [ ] Push notifications para vencimientos de cuotas y recurrentes

---

## Landing page

- [ ] Contenido real (hoy es scaffolding Next.js por defecto)
- [ ] Hero con screenshot/demo del dashboard
- [ ] Features section
- [ ] CTA → signup

---

## Deuda técnica

- [ ] Prisma shadow DB workaround documentado en `CLAUDE.md` / `AGENTS.md` — `migrate dev` falla, hay que usar `db push` en nuevos modelos
- [ ] Tipos de `@gastar/shared` desincronizados con Prisma models — hay duplicación. Evaluar generar tipos desde Prisma directamente
- [ ] `apps/web/src/components/ui/amount-input.tsx` es nuevo pero no tiene tests ni Storybook story
- [ ] Revisar y limpiar `tsconfig.json` del mobile (marcado con cambios no commiteados)

---

## No prioritarios (backlog)

- Cuota sin interés con inflación real (complejo, requiere API externa)
- Split expenses (multi-usuario)
- Salary anticipation curve
- Retirement calculator
- Collaborative budgets / shared household
