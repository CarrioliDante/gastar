# Gastar — Roadmap

> Actualizado 2026-05-21. Orden: primero frontend, luego funcionalidad.

---

## Fase 1 — Flujo crítico ✅

### 1.1 Error handling en forms
- [x] QuickExpense — mostrar mensaje de error visible cuando falla la server action
- [x] Create/Edit Block modal — ídem
- [x] Create Installment / Recurring — ídem
- [x] Server actions throw errores descriptivos en vez de `return;` silencioso
- [x] Success UI solo en `onSuccess` — sin "guardado" falso
- [x] FK validation en `blockId` (mobile API + server action web)
- [x] Mobile CaptureSheet — mostrar errores de mutation

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
- [x] Heatmap de intensidad de gasto (GitHub-style, 21 semanas, 4 niveles quantiles)
- [x] Quitados AreaChart "Tendencia de gastos" y BarChart "Ingresos vs Gastos" (cards con sombras, fuera de UI editorial)
- [x] Tooltip en celdas del heatmap (fecha + monto)

### 7.2 Mobile Lectura ✅
- [x] Quitado LineChart de patrimonio neto
- [x] TickerAmount en números clave
- [x] Donut distribución, installments, recurring, patterns preservados
- [x] SpendingHeatmap (GitHub-style) con datos reales de transacciones

---

## Fase 8 — Categorías editables ✅

- [x] `CustomCategory` interface (id, label, glyph, type)
- [x] `getCustomCategories(userId)` — lee de `UserSetting` KV, fallback a defaults
- [x] `saveCustomCategories(userId, categories)` — upsert en `UserSetting`
- [x] API: `GET/PUT /api/mobile/categories`
- [x] `useCategories()` + `useSaveCategories()` hooks mobile
- [x] Web settings: crear/editar/eliminar categorías con BlockGlyph (36 Tabler icons)
- [x] Mobile settings: crear/editar/eliminar categorías con picker horizontal Tabler
- [x] Defaults unificados web + mobile (Coffee, Home, Car, Music, CreditCard, Heart, etc.)
- [x] `fetchCustomCategories` server action + `useCustomCategories` hook web
- [x] QuickExpense usa categorías custom (vía `buildCatList` con fallback a defaults)
- [x] RecurringClient AddForm y EditRecurringForm usan categorías custom
- [x] Recurring mobile: picker horizontal de categorías reemplaza TextInput libre
- [x] `CaptureSheet.tsx` usa categorías custom (con fallback a defaults)
- [x] Typos: "Subscripciones" → "Suscripciones" en los 4 archivos + alias en glyph.tsx
- [x] GlyphSVG eliminado, reemplazado por BlockGlyph (Tabler) en web settings
- [x] Layout: filas con minHeight, GlyphPicker scrollable horizontal (no wrap)
- [x] Scroll: `<main>` overflow:auto para scroll nativo de página entera
- [x] Botones editor: "Agregar" por sección (gastos/ingresos), "×" eliminar en cada fila
- [x] Cache invalidation: `qc.invalidateQueries(qk.categories)` al guardar → visibles al instante en QuickExpense y RecurringClient
- [x] "Servicios" agregado como categoría default (Droplet) en web + mobile

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
- [x] Web: `DashboardContent` omite `PageTransition` cuando disabled
- [x] Mobile: `animationsEnabled` en store, toggle en settings

---

## Fase 11 — Features de producto

### 11.1 Smart categorization ✅
- [x] `lib/categorization.ts` — 50+ patrones regex en 8 categorías
- [x] Auto-selección en QuickExpense con badge "auto"

### 11.2 Dólar blue / MEP ✅
- [x] Fetch cotización desde `dolarapi.com` — Blue + Oficial
- [x] Cache con `unstable_cache` + revalidate cada 1 hora
- [x] Doble balance en el hero — toggle ARS / USD
- [x] Página `/dolar` dedicada con tenencia, compra/venta, cotizaciones
- [x] Modelo `DollarOperation` — historial de operaciones de compra/venta USD
- [x] `buyDollars()` / `sellDollars()` — server actions con `$transaction` atómico
- [x] Transacción "dolar" automática — debita/acredita balance ARS al operar
- [x] Sidebar nav item "Dólar" bajo Crecimiento

### 11.3 Emergency fund widget
- [ ] Cálculo: saldo Goals / promedio gasto mensual = N meses
- [ ] Widget en Dashboard o Insights

---

## Fase 12 — Analytics

### 12.1 Comparativa período anterior ✅
- [x] Query `previousMonth` en stats — mes anterior spending/income
- [x] Badge `↑ +X%` o `↓ −X%` junto a stats en dashboard (vista Mes)

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

## Fase 18 — Publicación App Store + Play Store

- [ ] Deploy `apps/web` a Vercel/Railway — dominio público para `EXPO_PUBLIC_API_URL`
- [ ] Offline-first mobile — React Query persist + MMKV + NetInfo + mutation queue
- [ ] EAS: `eas build:configure` + `eas.json` con env vars de prod
- [ ] iOS: Apple Developer Program ($99/año), App Store Connect, certificados vía EAS
- [ ] Android: Google Play Developer ($25 one-time), service account, app signing key vía EAS
- [ ] Assets: screenshots App Store (6.7" + 6.5"), feature graphic + screenshots Play Store
- [ ] Privacy policy pública — hostear en `apps/landing/privacy`
- [ ] Build iOS + Android (`eas build --platform all --profile production`)
- [ ] iOS: TestFlight beta → Submit for Review
- [ ] Android: closed testing (20 testers × 14 días) → producción
- [ ] Landing page: links a stores, onboarding público, SEO

---

## Fase 16 — Fixes visuales pendientes

### 16.1 Botones editoriales ✅
- [x] Todos los botones de acción con estilo editorial (texto + underline, sin fondos surface)
- [x] Primarios: círculo `+` 32px ink bg (dashboard, transactions, blocks, sidebar)
- [x] Secundarios: texto sin fondo ni borde, underline al hover (editar, archivar, pagar, pausar)
- [x] Eliminado `ghostBtn()` en toda la webapp
- [x] FontPicker y CurrencyPicker: texto con underline en activo
- [x] Calendario sin botón "Anotar" (vista de consulta)
- [x] "Disponible" oculto en vista Semana (dashboard + mobile)
- [x] "Ahorrado" oculto en vista Semana en Lectura/Insights

### 16.2 Bloques de vida en dashboard web
- [ ] Ajustar a diseño de referencia (`screens.jsx`): 142px cards, separadores, sin fondos
- [ ] En bloques con techo/tope: mostrar ícono dentro del pie chart

### 16.3 Icon picker refinamiento ✅
- [x] Mobile: botón "+" se transforma en ícono elegido, picker cierra al seleccionar
- [x] Quick icons cierran el picker completo si está abierto

### 16.4 Lectura ✅
- [x] Fix fade/opacidad trabada — ScrollReveal reemplazado por motion.div (initial/animate)
- [x] Scroll completo — minHeight: 0 en contenedor flex chain
- [x] Dashboard shell: mismo fix minHeight: 0 en scrollable

---

## Fase 17 — Fixes funcionales pendientes

### 17.1 Cuotas con fecha de inicio ✅
- [x] Crear cuota con fecha de inicio anterior → reflejar pagos pasados en calendario
- [x] nextDueDate auto-calculado de startedAt + paidInstallments
- [x] Calendario muestra todas las cuotas (pagadas tachadas + pendientes)

### 17.2 Vista Movimientos
- [ ] Selector nativo de meses (nuestro, no nativo del browser)
- [x] Arreglar filtro por "Cuotas" y por "Recurrentes" (B9, resuelto en sesión paralela)

### 17.3 Vista Bloques ✅
- [x] Al anotar en un bloque seleccionado, la transacción tarda en aparecer → optimistic update en ["block-transactions", blockId]

### 17.4 Fix ancho en edición inline ✅
- [x] Cuotas: minWidth/maxWidth/boxSizing en EditInstallmentForm
- [x] Recurrentes: grid estable con columnas fijas en AddForm y EditRecurringForm

### 17.5 Metas y bloques ✅
- [x] Ver metas completadas — toggle Activas/Completadas, query `getCompletedGoals`
- [x] Ver bloques archivados — toggle Activos/Archivados, query `getArchivedBlocks`
- [x] Revivir bloques archivados — `unarchiveBlock` server action + botón "Revivir"

---

## Backlog

- [ ] **Import CSV** — extracto de banco (Mercado Pago, BBVA, Galicia)
- [ ] **Quincena mode** — ciclos de 15 días para salario quincenal (LATAM)
- [x] **Historial de cuotas pagadas** — calendario muestra todas las cuotas (pagadas + pendientes)
- [x] **Editar recurrentes** — EditRecurringForm inline + updateRecurring server action
- [x] **DatePicker editorial** — componente compartido en Goals, Installments, Recurring
- [ ] **Font picker** — persiste preferencia (web)
- [ ] **Pulso financiero** — posible regreso con análisis combinado de gastos e ingresos
- [ ] Cuota sin interés con inflación real
- [ ] Split expenses (multi-usuario)
- [ ] Salary anticipation curve
- [ ] Retirement calculator
- [ ] Collaborative budgets / shared household
- [x] Calendario nativo para cuotas — DatePicker editorial implementado
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

### 2026-05-22 — Fixes UX: modales, layout shift, DatePicker

- [x] Fix crash bloques sin datos — null guard en `block.budget` y `block.id`
- [x] AddGoalForm, AddForm (installments), AddForm (recurring) ahora abren en modal overlay en vez de inline — elimina layout shift en las 3 vistas
- [x] DatePicker: `<div>` → `<input readOnly>` para altura idéntica a los demás inputs
- [x] DatePicker: placeholder "Fecha limite" → "Fecha límite", color dinámico no pisado por `fieldStyle`
- [x] AddGoalForm rediseñado vertical (Nombre full-width, Meta+Inicial 1fr+1fr, Fecha límite full-width, botones right-aligned)
- [x] AddForm modals: removido `borderBottom` y `padding` heredados de inline styling

### 2026-05-21 (tarde) — Dólar + Fixes visuales/funcionales + Analytics
- [x] Página `/dolar` — tenencia USD, compra/venta con cotizaciones Blue/Oficial, historial
- [x] Modelo `DollarOperation` — operaciones atómicas con `$transaction` (Transaction + DollarOperation)
- [x] Dashboard toggle ARS/USD en hero balance
- [x] Sidebar nav "Dólar" bajo Crecimiento
- [x] Icon picker mobile refinado — "+" se transforma, picker cierra al seleccionar
- [x] Lectura: fix fade/opacidad + scroll completo (minHeight: 0 + sin ScrollReveal)
- [x] Metas completadas — toggle Activas/Completadas + query getCompletedGoals
- [x] Bloques archivados — toggle Activos/Archivados + unarchiveBlock + Revivir
- [x] Comparativa mes anterior — delta % badges en stats del dashboard
- [x] Cotizaciones Blue + Oficial desde dolarapi.com en dashboard y /dolar

### 2026-05-21 — Dashboard temporal + DatePicker + Calendario
- [x] Dashboard temporal (semana/mes) con toggle, candlestick datos reales
- [x] ChartTooltip compartido con prop formatValue
- [x] DatePicker editorial — calendario popover monocromático sin dependencias
- [x] DatePicker en Goals (crear/editar), Installments (startedAt, nextDueDate)
- [x] EditRecurringForm inline + updateRecurring server action + useUpdateRecurring
- [x] Calendario: todas las cuotas (pagadas tachadas + pendientes) por installment
- [x] Server action createInstallment: nextDueDate auto-calculado
- [x] Error handling: AddGoalForm + GoalCard.contribute (onSuccess close + error display)
- [x] Bug fixes: B2 (date picker), B10 (cache blocks), B11 (ancho edición inline)
- [x] Lectura: SpendingHeatmap GitHub-style reemplaza AreaChart + BarChart (fuera de UI editorial)
- [x] Lectura: tooltip en celdas del heatmap (fecha + monto)

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
