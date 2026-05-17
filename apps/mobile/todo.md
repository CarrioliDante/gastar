# Mobile — TODO

> Objetivo: pasar de mock estático a app funcional con auth, datos reales y onboarding de calidad.

---

## ✅ Completado

### Infraestructura
- [x] `@supabase/supabase-js` + `expo-secure-store` instalados
- [x] `lib/supabase.ts` — cliente con ChunkedSecureStore (maneja límite de 2KB en iOS)
- [x] `store/auth.ts` — zustand store: `session`, `user`, `isChecking`, `setSession`
- [x] `app/_layout.tsx` — QueryClientProvider + onAuthStateChange listener
- [x] `app/index.tsx` — PreBoot animado: circle spring-in → logo text fade → snap-to-zero + navigate
- [x] `lib/api.ts` — `apiFetch()` con JWT auto-inyectado + tipos de respuesta
- [x] `lib/hooks/index.ts` — `useStats`, `useTransactions`, `useBlocks`, `useInstallments`, `useRecurring`, `useUser`, `useCreateTransaction`

### Auth screens
- [x] `app/(auth)/_layout.tsx` — Stack sin animación (manejamos las propias)
- [x] `app/(auth)/login.tsx` — staggered FadeInDown entrance, validación inline, onboarding check
- [x] `app/(auth)/onboarding.tsx` — 4 pasos (cuenta + contexto + objetivo + bienvenida), spring slide entre pasos

### API layer (webapp)
- [x] `api/mobile/_auth.ts` — `requireMobileAuth()` verifica JWT con Supabase Admin
- [x] `api/mobile/stats/route.ts` — balance, monthly, dailySeries, netWorth24mo, categories, pulso
- [x] `api/mobile/transactions/route.ts` — GET agrupado por fecha + POST crear transacción
- [x] `api/mobile/blocks/route.ts` — bloques con spent del mes actual
- [x] `api/mobile/installments/route.ts` — cuotas activas con count (no amount)
- [x] `api/mobile/recurring/route.ts` — recurrentes con freq en español
- [x] `api/mobile/user/route.ts` — nombre + email desde Supabase auth metadata

---

## Pendiente: Conectar pantallas

### Home (`app/(tabs)/home.tsx`)
- [ ] Reemplazar `DATA.*` con `useStats()` + `useBlocks()` + `useTransactions()` + `useInstallments()` + `useRecurring()`
- [ ] Fecha dinámica: `new Date()` formateada en español
- [ ] Saludo dinámico: "Buen día/tarde/noche, {user.name}" desde `useUser()`
- [ ] Remover banner "Tu semana, en silencio" → backlog
- [ ] Loading state: opacidad reducida mientras carga

### Transactions (`app/(tabs)/transactions.tsx`)
- [ ] Reemplazar `DATA.groups` con `useTransactions().data.groups`
- [ ] Conteo "N mov" dinámico desde `useTransactions().data.total`
- [ ] Filtros (Todo/Salida/Entrada/Cuotas/Recurrentes) sobre datos reales
- [ ] Empty state si no hay transacciones

### Blocks (`app/(tabs)/blocks.tsx`)
- [ ] Reemplazar `DATA.blocks` con `useBlocks().data`
- [ ] Header: contar bloques reales
- [ ] `BlockDetail`: transacciones filtradas via `useTransactions(blockId)`
- [ ] Trend de 14 días: placeholder hasta tener endpoint específico

### Insights (`app/(tabs)/insights.tsx`)
- [ ] Reemplazar `DATA.*` con `useStats()` + `useInstallments()` + `useRecurring()`
- [ ] Remover sección "Patrones" → backlog
- [ ] Mes dinámico en header

### CaptureSheet (`components/CaptureSheet.tsx`)
- [ ] Block selector usa `useBlocks().data` (lista real)
- [ ] `onSave` → `useCreateTransaction()` mutation (nombre + amount + category + blockId)

### Settings (`app/(tabs)/settings.tsx`)
- [ ] Mostrar nombre y email reales desde `useUser()`
- [ ] Remover "Cuentas vinculadas" → backlog
- [ ] Remover "Tarjetas" → backlog
- [ ] Remover "Recordatorios" → backlog
- [ ] Remover "Exportar CSV" → backlog
- [ ] "Cerrar sesión" → `supabase.auth.signOut()` + navigate a `/login`
- [ ] Pulso dinámico desde `useStats().data.pulso`

---

## Limpieza final
- [ ] Eliminar `DATA` export de `lib/data.ts` (mantener solo tipos)
- [ ] Verificar `.env.example` con keys de desarrollo

---

## Backlog (no tocar por ahora)
- Cuentas vinculadas (bank linking)
- Tarjetas (bank cards)
- Recordatorios / push notifications
- Exportar CSV
- Zen Monday Digest (banner semanal)
- Patrones de gasto (analytics: día/hora pico)
- Offline-first real (MMKV + sync en background)
