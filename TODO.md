# Gastar — Tareas Pendientes y Mejoras

> Estado al 2026-05-18. Orden dentro de cada sección es de mayor a menor prioridad.

---

## Flujo crítico (impacta retención del usuario nuevo)

- [ ] **Error handling en forms** — mostrar mensaje visible en el form cuando una server action falla (try/catch existe en todas las acciones, falta UI de error)
- [ ] **Editar Block** — cambiar nombre, presupuesto e ícono de un bloque existente (server action falta)
- [ ] **Anotar ingreso desde header** — shortcut `⌘⇧N`. QuickExpense ya soporta tipo "ingreso", falta el atajo de teclado
- [ ] **Empty states** — usuario nuevo ve pantallas vacías sin guía. Agregar copy de primeros pasos en Dashboard, Blocks, Installments, Goals
- [x] ~~**Create Block desde UI**~~ — modal con picker de 18 glyphs (6 semánticos + 12 geométricos), optimistic update (2026-05-18)
- [x] ~~**Bloques funcionales**~~ — QuickExpense tiene selector de bloque; transacciones se asocian via `blockId` (2026-05-18)
- [x] ~~**Filtros en Transactions**~~ — filtro por mes, categoría, búsqueda texto, tabs por tipo (2026-05-18)
- [x] ~~**Category breakdown rediseñado**~~ — lista flat editorial con glyph + barra proporcional; sin donut, sin card fuera de estilo (2026-05-18)
- [ ] **`.env.example` documentado** — nuevos contribuidores no saben qué variables configurar

---

## Auth / usuarios

- [ ] **Login con Google** — `supabase.auth.signInWithOAuth({ provider: 'google' })` + habilitar provider en Supabase Dashboard → Auth → Providers
- [ ] **Login con Apple** — requiere Apple Developer account ($99/año) + Service ID configurado en Supabase
- [ ] **Crear cuenta vía OAuth** — con Google/Apple, la primera autenticación crea la cuenta automáticamente; no requiere /signup separado
- [x] ~~**Email/password auth**~~ — login + signup funcionando con Supabase Auth SSR
- [x] ~~**Separación de datos por usuario**~~ — cada modelo tiene `userId`; todas las queries filtran por él; ningún usuario ve datos de otro

---

## Páginas incompletas / placeholder

- [ ] **Calendar** — página existe pero está vacía. Vista mensual de transacciones + vencimientos de cuotas y recurrentes
- [ ] **Settings**:
  - [ ] Cambiar nombre de usuario (escribe a `user_metadata` de Supabase)
  - [ ] Export CSV (botón existe, acción no implementada)
  - [ ] Theme toggle (dark mode real — hoy solo UI)
  - [ ] Font picker (persiste preferencia)

---

## Features de datos (CRUD pendiente)

- [ ] **Categorías editables** — gestionar categorías custom (nombre + ícono) desde Settings. Mostrar ícono de categoría en selectores de quick-expense, recurring y transactions. Merge con `CATEGORY_GLYPH` via `UserSetting` JSON
- [ ] **Ícono en Recurring** — agregar campo `icon` opcional a `RecurringExpense` (schema + action + query + UI). Mostrar ícono custom en lista; fallback al ícono de categoría
- [ ] **Editar cuota existente** — en Installments hay pay/delete pero no edit (nombre, monto, cuotas restantes)
- [ ] **Pausa/reanudar Recurring** — campo `pausedAt` existe en schema, falta botón en UI
- [ ] **Editar meta de ahorro** — cambiar nombre, target, deadline
- [ ] **Detalle real de transacciones por bloque** — el panel derecho de Blocks muestra trend sintético; debería listar las transacciones agrupadas del bloque
- [ ] **Historial de cuotas pagadas** — lista de transacciones generadas por cada cuota

---

## Insights y análisis

- [ ] **Comparativa mes anterior** — delta % en stats principales de Insights
- [ ] **Runway calculator** — "a este ritmo de gasto, tus ahorros duran N meses". Cálculo en `lib/queries/stats.ts`
- [ ] **Emergency fund widget** — cuántos meses de gastos cubre el saldo actual. Widget en Dashboard
- [ ] **Dólar blue / MEP** — cotización real para Argentina via dolarapi.com. Convertir gastos ARS → USD real
- [x] ~~**Insights completo**~~ — pie chart, area chart, bar chart, radar, pulso financiero, frecuencia de compra (2026-05-16)

---

## Features de producto (acordados, no implementados)

- [ ] **Smart categorization** — auto-categorizar transacción por nombre del comercio (regex patterns, sin ML). Ej: "Rappi" → Comida, "Netflix" → Suscripciones
- [ ] **Zen Monday Digest** — banner lunes al abrir el dashboard con resumen semanal silencioso. Solo visible ese día
- [ ] **Import CSV** — importar extracto de banco (Mercado Pago, BBVA, Galicia). Parser por columnas estándar
- [ ] **Quincena mode** — ciclos de 15 días para salario quincenal (LATAM). Cambia el período base de análisis

---

## Glyphs e íconos

- [x] ~~**18 glyphs totales**~~ — 6 semánticos (house, car, bike, plane, globe, person) + 12 geométricos (circle, dot, square, diamond, arc, line, cross, half, ring, triangle, bar, grid). Picker en modal de bloque (2026-05-18)
- [x] ~~**36 glyphs Tabler**~~ — migración completa a @tabler/icons-react: 36 íconos tipográficos reemplazan los SVG geométricos. `GlyphKind` unificado, `LEGACY` mapper para datos viejos, `ALL_GLYPHS` en create/edit block modals. Fallbacks `"circle"`/`"ring"` → `"Home"` (2026-05-18)
- [x] ~~**CATEGORY_GLYPH actualizado**~~ — Casa→Home, Comida→ToolsKitchen2, Transporte→Car, Salud→Heart, Ocio→Music, Trabajo→Briefcase, etc (2026-05-18)

---

## Mobile (Expo)

- [x] ~~**Scaffolding y auth**~~ — Expo Router, NativeWind, Supabase JWT auth, store Zustand
- [x] ~~**API bridge**~~ — todos los datos vienen de `apps/web/src/app/api/mobile/*`; JWT Bearer auth
- [x] ~~**Hooks React Query**~~ — `apps/mobile/lib/hooks/index.ts` con queries para transactions, blocks, installments, recurring, goals, stats
- [x] ~~**Pantallas con datos reales**~~ — 5 tabs + CaptureSheet migradas de `DATA.*` a hooks (2026-05-18)
- [x] ~~**Transición PreBoot → Login**~~ — zoom ease-out del círculo negro, sin flicker (2026-05-18)
- [x] ~~**Loading state con logo**~~ — animación de respiración del círculo negro, reemplaza ActivityIndicator (2026-05-18)
- [x] ~~**Bottom nav centrada**~~ — 4 tabs simétricas (2+2) sin settings (2026-05-18)
- [x] ~~**Settings fuera de tabs**~~ — ruta standalone `app/settings.tsx`, acceso desde header del Home (2026-05-18)
- [x] ~~**Login flow arreglado**~~ — `signInWithPassword` va directo a dashboard, no a onboarding (2026-05-18)

### Inmediato

- [ ] **Arreglar conexión a datos** — el dashboard muestra ceros porque las queries no están trayendo datos del servidor web. Verificar que `EXPO_PUBLIC_API_URL` sea accesible desde el device/simulador y que `apps/web` esté corriendo
- [ ] **Ocultar secciones no desarrolladas** — Calendar, Goals, y cualquier pantalla/sección que no tenga backend listo todavía en la webapp. Mostrar "Próximamente" o directamente ocultar
- [ ] **Centrar solo el + (quitar el −)** — la barra inferior solo necesita el FAB de agregar gasto (+); el − para ingreso puede ser opción dentro del CaptureSheet o removerse del FAB
- [ ] **Paridad funcional con webapp** — toda acción que funciona en web (crear/editar/borrar transacciones, bloques, cuotas, recurrentes) debe funcionar en mobile con la misma experiencia

### Siguiente

- [ ] **Selector de bloque en quick-add mobile** — ya funciona con `useBlocks()` en CaptureSheet, falta pulir UI del picker inline
- [ ] **Sincronización de datos con webapp** — las mutaciones mobile ya usan la misma API y invalidan queries. Verificar que los cambios en mobile se reflejen en web y viceversa
- [ ] **Offline-first** — React Query + MMKV + Zustand persist. Las queries se cachean localmente; mutaciones en cola cuando no hay conexión; se sincronizan al reconectar
- [ ] **Push notifications** — vencimientos de cuotas y recurrentes via Expo Push Notifications
- [ ] **Calendar view** — vista mensual en mobile (si ya existe en web)
- [ ] **Error handling en forms mobile** — mostrar errores de mutation (ej: "Email ya registrado") en los forms de auth y CaptureSheet
- [ ] **Empty states mobile** — para usuario nuevo sin datos: guía de primeros pasos en cada pantalla

---

## Animaciones (completado 2026-05-16)

- [x] ~~Sistema de animaciones en `components/motion/`~~ — presets spring, ScrollReveal, AnimatedNumber, RevealText, PageTransition
- [x] ~~Animaciones aplicadas~~ — dashboard, transactions, blocks, insights, settings, sidebar, QuickExpense
- [ ] **Split-flap balance** — animación de dígitos split-flap (estilo Solari) para el balance principal en Dashboard. Componente `SplitFlap` que recibe `value: number` y anima cada dígito individualmente al cambiar

---

## Performance y arquitectura

- [x] ~~**Optimistic updates**~~ — TanStack Query v5, todas las mutaciones con cache optimista + rollback en error
- [x] ~~**Capa de datos**~~ — hooks en `queries.ts` / `mutations.ts`, query keys centralizados, `staleTime: 0` para financiero
- [ ] **RLS en Supabase** — Row Level Security como capa extra de seguridad sobre el filtrado por `userId` en queries
- [ ] **Connection pooler** — configurar en Supabase Dashboard → Settings → Database → Connection pooling
- [ ] **Revalidación granular** — separar tags por entidad (`blocks:userId`, `transactions:userId`) en lugar de un tag único por usuario

---

## Landing page

- [ ] Contenido real (hoy es scaffolding)
- [ ] Hero con screenshot/demo del dashboard
- [ ] Features section
- [ ] CTA → signup

---

## Deuda técnica

- [ ] Tipos de `@gastar/shared` desincronizados con Prisma models — hay duplicación; evaluar generar desde Prisma
- [ ] Prisma shadow DB workaround — `migrate dev` falla en Supabase free tier, usar `db push`; documentar en AGENTS.md
- [ ] `apps/web/src/components/ui/amount-input.tsx` — sin tests ni uso verificado

---

## No prioritarios (backlog)

- Cuota sin interés con inflación real (requiere API externa)
- Split expenses (multi-usuario)
- Salary anticipation curve
- Retirement calculator
- Collaborative budgets / shared household
