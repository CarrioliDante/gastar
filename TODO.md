# Gastar — Roadmap

> Actualizado 2026-05-19. Orden: primero frontend, luego funcionalidad.

---

## Fase 1 — Flujo crítico ✅

### 1.1 Error handling en forms
- [x] QuickExpense — mostrar mensaje de error visible cuando falla la server action
- [x] Create/Edit Block modal — ídem
- [x] Create Installment / Recurring — ídem
- [x] Server actions throw errores descriptivos en vez de `return;` silencioso
- [x] Success UI solo en `onSuccess` — sin "guardado" falso
- [x] FK validation en `blockId` (mobile API + server action web)
- [ ] Mobile CaptureSheet — mostrar errores de mutation

### 1.2 Editar Block ✅
- [x] Server action `updateBlock(id, { name, budget, icon })`
- [x] EditBlockModal reutiliza estructura de Create
- [x] Optimistic update + rollback en cache
- [x] Error handling en el modal

### 1.3 Empty states ✅
- [x] Dashboard: Bloques, Cuotas, Recurrentes con copy + CTA
- [x] Transactions vacío — copy + CTA
- [x] Blocks vacío — CTA
- [x] Installments vacío — copy + CTA
- [x] Goals vacío — copy + CTA

---

## Fase 2 — Dashboard zen ✅

### 2.1 Simplificar vista inicio
- [x] Balance 96px protagonista absoluto
- [x] Gráfico de barras de gasto mensual (6 meses)
- [x] 4 secciones con ritmo visual consistente
- [x] Formato de moneda unificado con `useCurrency`

---

## Fase 3 — Dashboard harmonizado web + mobile ✅

Rediseño completo del dashboard con estructura editorial compartida.

### 3.1 Estructura final (ambas plataformas) ✅
1. Balance hero con ahorro a la derecha (pie chart + total)
2. Selector `Semana / Mes` — underline style, sin "Hoy"
3. % presupuesto (barra de progreso fina)
4. Stats: Gastado · Disponible · Ingreso (actualizan con período)
5. Cuotas → Recurrentes
6. Bloques de Vida (horizontal scroll cards en web)
7. Movimientos (limitado a 5, link "Ver todo →")
8. SIN gráfico de barras en dashboard principal

### 3.2 Cambios realizados ✅
- [x] Selector de período unificado (underline style) en dashboard y Lectura
- [x] Stats semanales reales (weekSpend, weekBudget = monthBudget / 4.3)
- [x] Ahorro a la derecha del balance con donut + total + nombre/nº metas
- [x] Block cards: 142px ancho fijo, borde separador, sin fondos ni sombras
- [x] Eliminado: gráfico de barras del dashboard, "Hoy", net worth mini chart
- [x] Quitado: Runway estimado, Zen Monday Digest, Pulso financiero
- [x] Quitado: "Tu semana en silencio" banner mobile

### 3.3 Mobile específico ✅
- [x] Misma estructura que web
- [x] Quitado botón hamburguesa sidebar del header
- [x] Quitados "Objetivos" del fondo del home
- [x] Sidebar con pan gesture (sigue el dedo, withTiming 200ms snap)
- [x] Swipe entre tabs con paths explícitos + try/catch
- [x] FAB unificado: un solo botón +/− dinámico según último tipo
- [x] Gesture conflict fix: `failOffsetY` en swipe horizontal

### 3.4 Fixes funcionales ✅
- [x] Fix editar cuota — AnimatePresence + motion.div con height animation
- [x] Cuota pagada este mes — ocultar "Pagar", mostrar "Pagada" (nextDue month > current month)
- [x] Recurrente pagada este período — ídem, con `lastPaidAt` en schema
- [x] Presupuesto mobile — `displayPct` usa `displaySpend / displayBudget`

---

## Fase 4 — Sistema de íconos ✅

### 4.1 Unificación Tabler ✅
- [x] 36 íconos Tabler (`@tabler/icons-react` v3) como único sistema
- [x] Tipos: `TablerGlyphKind` con 36 valores categorizados
- [x] `GlyphKind = TablerGlyphKind` (sin geometrías)
- [x] Categorías: Vivienda, Transporte, Salud, Comida/Compras, Trabajo/Ocio, Social/Tech
- [x] Web: `BlockGlyph` renderiza Tabler icons vía `@tabler/icons-react`
- [x] Mobile: `BlockGlyph` renderiza SVG paths de Tabler vía `react-native-svg` (`tabler-icons.ts`)
- [x] `create-block-modal.tsx` web: 5 íconos rápidos + "+" para picker completo
- [x] Mobile `blocks.tsx`: 5 íconos rápidos + "+" para picker, sin bloques pre-armados
- [x] Picker colapsable: grid 6-columnas categorizado con los 36
- [x] Sin geometrías ni formas inventadas en ningún lado

---

## Fase 5 — Vistas dedicadas ✅

### 5.1 Vista Cuotas ✅
Formato:
```
Cuotas
[POR MES: $X]  [PENDIENTE TOTAL: $Y]  [ACTIVAS: N]

Lista con barras segmentadas por cuota (cuadraditos)
Botón "Pagar cuota" solo si no pagada este mes
```
- [x] Web: header 3 stats, barras segmentadas, "Pagada" badge, edit con AnimatePresence
- [x] Mobile: header 3 stats, barras segmentadas, CRUD completo

### 5.2 Vista Recurrentes ✅
Formato:
```
Recurrentes
[POR MES: $X]  [SUSCRIPCIONES: N]  [SERVICIOS: N]

Agrupadas por categoría:
— Suscripciones (Subs, Suscripciones, Subscripcion)
— Servicios (Casa, Servicios, Vivienda)
— Otros
```
- [x] Web: header 3 stats, agrupación por categoría, "Pagado" badge, pause/delete
- [x] Mobile: header 3 stats, agrupación, CRUD completo
- [x] Schema: `lastPaidAt` en RecurringExpense para tracking de pago

### 5.3 Vista Ahorro ✅
Formato:
```
Ahorro
[AHORRADO VS METAS — $X] ——— [META TOTAL · $Y · 21% DEL TOTAL]

Cards en filas de 2 (web) / 1 columna (mobile)
Cada card: donut ring 52px, nombre, current/target, deadline, progreso
```
- [x] Web: header 2 bloques + progress bar, grid 2-columnas
- [x] Mobile: header 2 bloques + progress bar, lista single column
- [x] Donut rings con `AnimatedNumber`

---

## Fase 6 — CRUD completo

### 6.1 Anotar ingreso desde header
- [x] Shortcut `⌘⇧N` en web
- [ ] Tooltip visible en el botón del header

### 6.2 Editar cuota existente ✅
- [x] Server action `updateInstallment(id, { name, monthlyAmount, paidInstallments })`
- [x] Form inline de edición en la lista de Installments

### 6.3 Pausar / reanudar Recurring ✅
- [x] Server action `toggleRecurringPause(id)`
- [x] Botón en fila de la lista

### 6.4 Editar meta de ahorro ✅
- [x] Server action `updateSavingsGoal(id, { name, targetAmount, deadline })`
- [x] Form inline de edición en Goals

### 6.5 Detalle de transacciones por bloque ✅
- [x] Query `getTransactionsByBlock(blockId, userId)`
- [x] Reemplazar trend sintético en panel Blocks con lista real

### 6.6 Settings — cambiar nombre de usuario ✅
- [x] `supabase.auth.updateUser({ data: { full_name } })`
- [x] Campo editable inline en Settings

---

## Fase 7 — Lectura / Insights

### 7.1 Web Lectura ✅
- [x] Selector de período underline: Semana, Mes, 6 meses, 1 año
- [x] Eliminado Pulso financiero
- [x] Patrimonio neto = balance + suma ahorros
- [x] Donut de distribución de gastos por categoría (opacidades corregidas)
- [x] Gasto diario con velas + línea de promedio
- [x] Scroll funcional, sin difuminados
- [x] Vista semana = mismo layout que mes

### 7.2 Mobile Lectura ✅
- [x] Quitado LineChart de patrimonio neto
- [x] TickerAmount en números clave
- [x] Donut distribución, installments, recurring, patterns preservados

---

## Fase 8 — Categorías editables ✅

- [x] `CustomCategory` interface (id, label, glyph, type)
- [x] `getCustomCategories(userId)` — lee de `UserSetting` KV, fallback a defaults
- [x] `saveCustomCategories(userId, categories)` — upsert en `UserSetting`
- [x] API: `GET/PUT /api/mobile/categories`
- [x] `useCategories()` + `useSaveCategories()` hooks mobile
- [x] Web settings: editor de categorías con nombre + glyph picker + restaurar defaults
- [x] Mobile settings: editor inline + guardar cambios + restaurar defaults
- [x] `CaptureSheet.tsx` usa categorías custom (con fallback a defaults)

---

## Fase 9 — Mobile navegación y UX ✅

### 9.1 Sidebar ✅
- [x] Pan gesture (sigue el dedo, no spring caricaturesco)
- [x] `withTiming` 200ms snap al soltar
- [x] Edge gesture desde borde izquierdo para abrir
- [x] Panel gesture para cerrar arrastrando
- [x] Links: Inicio, Movimientos, Bloques, Lectura, Cuotas, Recurrentes, Objetivos, Ajustes
- [x] Backdrop overlay con tap para cerrar

### 9.2 Swipe entre tabs ✅
- [x] `SwipeableTabView` con `Gesture.Pan()`
- [x] Paths explícitos (no template literals)
- [x] try/catch para prevenir crashes
- [x] `failOffsetY` para no interferir con scroll vertical

### 9.3 FAB unificado ✅
- [x] Un solo botón +/− en BottomNav
- [x] `lastCaptureType` en app store
- [x] Icono dinámico: − (gasto) / + (ingreso)

### 9.4 CRUD cuotas y recurrentes en mobile ✅
- [x] API endpoints: POST/PUT/DELETE + /pay + /pause
- [x] Mutation hooks: create, update, pay, delete, pause
- [x] Pantalla installments.tsx con crear/editar/pagar/eliminar
- [x] Pantalla recurring.tsx con crear/editar/pagar/pausar/eliminar

---

## Fase 10 — UX / Animaciones ✅

### 10.1 Números animados ✅
- [x] Web: `AnimatedNumber` en Stat, dashboard stats, cuotas, recurrentes, bloques, Lectura
- [x] Mobile: `TickerAmount` (slit-flap) en balance, stats, Lectura
- [x] `Stat` component web usa `AnimatedNumber` internamente

### 10.2 Selector underline unificado ✅
- [x] Dashboard, Lectura: texto + border-bottom, sin fondos sólidos
- [x] Mobile: mismo estilo con `borderBottomWidth` + `Pressable`
- [x] Reutilizado en todas las vistas con selector de período

### 10.3 Toggle animaciones ✅
- [x] Web: CSS class `.no-animations` global, toggle en settings
- [x] Mobile: `animationsEnabled` en store, toggle en settings

---

## Fase 11 — Features de producto

### 11.1 Smart categorization ✅
- [x] `lib/categorization.ts` — 50+ patrones regex en 8 categorías
- [x] Auto-selección en QuickExpense con badge "auto"

### 11.2 Dólar blue / MEP
- [ ] Fetch cotización desde `dolarapi.com` (API pública, sin auth)
- [ ] Doble balance en el hero — moneda local + equivalente USD
- [ ] Cache con `unstable_cache` + revalidate cada 1 hora

### 11.3 Emergency fund widget
- [ ] Cálculo: saldo Goals / promedio gasto mensual = N meses
- [ ] Widget en Dashboard o Insights

---

## Fase 12 — Analytics

### 12.1 Comparativa período anterior
- [ ] Query delta % respecto al período anterior (mes anterior, semana anterior, ayer)
- [ ] Badge `+X%` o `−X%` junto a stats principales

### 12.2 Split-flap balance
- [ ] Componente `SplitFlap` — anima cada dígito individualmente
- [ ] Integrar en el balance hero del dashboard

---

## Fase 13 — Auth OAuth

### 13.1 Google
- [ ] Habilitar provider en Supabase Dashboard
- [ ] Botón "Continuar con Google" en `/login` y `/signup`

### 13.2 Apple
- [ ] Requiere Apple Developer account + Service ID
- [ ] Botón "Continuar con Apple" en iOS

---

## Fase 14 — Infraestructura

- [ ] **RLS en Supabase** — capa extra sobre filtrado `userId`
- [ ] **Connection pooler** — configurar en Supabase Dashboard
- [ ] **Revalidación granular** — tags por entidad en lugar de `user:${id}`
- [ ] **`.env.example`** — documentar variables requeridas
- [ ] **Tipos `@gastar/shared`** — sincronizar con Prisma models
- [ ] **`useCurrency`** — extender a transactions-client y calendar-client

---

## Fase 15 — Mobile avanzado

- [ ] **Offline-first** — React Query offline + MMKV + Zustand persist
- [ ] **Push notifications** — Expo Push Notifications para vencimientos
- [ ] **Error handling en forms mobile** — auth (signup, login) y CaptureSheet

---

## Fase 16 — Fixes visuales pendientes

### 16.1 Botones editoriales
- [ ] Todos los botones de acción con estilo editorial (texto + underline, sin fondos surface)
- [ ] Cards de métricas en Recurrentes reemplazadas por editorial (sin `borderRadius` ni `boxShadow`)

### 16.2 Bloques de vida en dashboard web
- [ ] Ajustar a diseño de referencia (`screens.jsx`): 142px cards, separadores, sin fondos
- [ ] En bloques con techo/tope: mostrar ícono dentro del pie chart

### 16.3 Icon picker refinamiento
- [ ] Al seleccionar ícono, cerrar el picker automáticamente
- [ ] El botón "+" debe transformarse en el ícono elegido

### 16.4 Lectura
- [ ] Fix fade/opacidad trabada en vista lectura
- [ ] Scroll completo en todas las secciones

---

## Fase 17 — Fixes funcionales pendientes

### 17.1 Cuotas con fecha de inicio
- [ ] Crear cuota con fecha de inicio anterior → reflejar pagos pasados en calendario
- [ ] Marcar automáticamente como pagadas las cuotas de meses anteriores a hoy

### 17.2 Vista Movimientos
- [ ] Selector nativo de meses (nuestro, no nativo del browser)
- [ ] Arreglar filtro por "Cuotas" y por "Recurrentes"

### 17.3 Vista Bloques
- [ ] Al anotar en un bloque seleccionado, la transacción tarda en aparecer → fix cache invalidation

### 17.4 Fix ancho en edición inline
- [ ] Cuotas: al editar, el ancho de los contenedores se expande — usar ancho fijo
- [ ] Recurrentes: mismo fix

### 17.5 Metas y bloques
- [ ] Ver metas de ahorro completadas
- [ ] Ver bloques archivados
- [ ] Revivir bloques archivados

---

## Backlog

- [ ] **Import CSV** — extracto de banco (Mercado Pago, BBVA, Galicia)
- [ ] **Quincena mode** — ciclos de 15 días para salario quincenal (LATAM)
- [ ] **Historial de cuotas pagadas** — transacciones generadas por cada cuota
- [ ] **Font picker** — persiste preferencia (web)
- [ ] **Pulso financiero** — posible regreso con análisis combinado de gastos e ingresos
- [ ] Cuota sin interés con inflación real
- [ ] Split expenses (multi-usuario)
- [ ] Salary anticipation curve
- [ ] Retirement calculator
- [ ] Collaborative budgets / shared household
- [ ] Calendario nativo para cuotas (modal nativo, no input date browser)
- [ ] Desactivar animaciones individualmente (ya está el toggle global)

---

## Archivo — Completado

<details>
<summary>Ver completados (2026-05-13 → 2026-05-19)</summary>

### Infraestructura
- [x] Monorepo pnpm (web + landing + mobile + shared)
- [x] Next.js 16 App Router + Prisma 7 + Supabase PostgreSQL
- [x] Auth email/password con Supabase SSR (cookie-based)
- [x] Separación de datos por usuario (`userId` en todos los modelos)
- [x] Server Actions + TanStack Query v5 + optimistic updates
- [x] Mobile API bridge — 7+ endpoints + auth JWT
- [x] Capa de queries: `lib/queries/`, hooks centralizados, `staleTime: 0`
- [x] Keyboard shortcuts (`⌘N` gasto, `⌘⇧N` ingreso, `⌘K` comando)

### Web — Features
- [x] Dashboard completo — balance hero, stats, blocks grid, cuotas, recurrentes
- [x] Dashboard harmonizado web + mobile — selector Semana/Mes, ahorro derecha, orden editorial
- [x] Transactions — historial agrupado por fecha, filtros, delete inline
- [x] Blocks — grid editorial, panel derecho, Create Block con picker 36 íconos Tabler
- [x] Insights — donut, area chart, bar chart, patrones, daily spend candles
- [x] Calendar — vista mensual con datos reales
- [x] Goals — crear, contribuir, editar, eliminar metas
- [x] Installments — crear, pagar, editar, eliminar cuotas con barras segmentadas
- [x] Recurring — crear, pagar, pausar, eliminar recurrentes agrupadas por categoría
- [x] Settings — presupuesto, tema, moneda, nombre, categorías, animaciones, export CSV, logout
- [x] Landing page — hero, features, pricing, FAQ, dark mode
- [x] Dark mode completo — CSS tokens + ThemeProvider + toggle
- [x] 36 íconos Tabler unificados — `GlyphKind`, `BlockGlyph`, picker categorizado
- [x] Sistema de animaciones — spring presets, ScrollReveal, AnimatedNumber, RevealText
- [x] Smart categorization — `lib/categorization.ts`, auto-selección en QuickExpense
- [x] Categorías editables — custom en UserSetting, UI en settings web + mobile
- [x] Toggle animaciones global — CSS class `.no-animations` + setting

### Mobile — Features
- [x] Scaffolding Expo + NativeWind + Supabase JWT auth + Zustand store
- [x] React Query hooks — transactions, blocks, installments, recurring, stats, user, categories
- [x] Dashboard harmonizado con web — misma estructura, selector underline, ahorro derecha
- [x] Todas las pantallas con datos reales (home, transactions, blocks, insights, settings)
- [x] Goals, Installments, Recurring screens con CRUD completo
- [x] Vistas Cuotas/Recurrentes con headers de métricas y agrupación
- [x] Animación PreBoot → Login (zoom ease-out, sin flicker)
- [x] Loading state con respiración del círculo negro
- [x] Bottom nav 4 tabs + FAB unificado (+/− dinámico)
- [x] Settings fuera de tabs con categorías editables + toggle animaciones
- [x] Login + onboarding 4-step flow
- [x] CaptureSheet con categorías custom (custom o defaults)
- [x] CreateBlockModal con 5 íconos rápidos + picker Tabler
- [x] Pull-to-refresh en pantallas principales
- [x] Light/dark theme + 3 font options
- [x] Chunked SecureStore para JWTs grandes
- [x] Sidebar con pan gesture (finger-following, no spring)
- [x] Swipe entre tabs con Gesture.Pan + failOffsetY
- [x] 36 íconos Tabler vía SVG paths en `tabler-icons.ts`
- [x] Slit-flap numbers (TickerAmount) en stats principales

</details>
