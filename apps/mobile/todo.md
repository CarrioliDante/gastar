# Gastar Mobile — TODO

> Actualizado 2026-05-22. Solo tareas de la app mobile (Expo + React Native).

---

> Actualizado 2026-05-24. Todos los bugs y UX items del 2026-05-22 resueltos.

## Publicación App Store + Play Store

- [ ] Offline-first — React Query persist + MMKV + NetInfo + mutation queue
- [ ] EAS: `eas build:configure` + `eas.json` con env vars de prod
- [ ] iOS: Apple Developer Program ($99/año) + App Store Connect + certificados vía EAS
- [ ] Android: Google Play Developer ($25 one-time) + service account + app signing key
- [ ] Assets: screenshots App Store (6.7" + 6.5"), feature graphic + screenshots Play Store
- [ ] Build iOS + Android (`eas build --platform all --profile production`)
- [ ] iOS: TestFlight beta → Submit for Review
- [ ] Android: closed testing (20 testers × 14 días) → producción
- [ ] Privacy policy — hostear en landing page
- [ ] Landing page: links a app stores, SEO

---

## Mutations pendientes (v2)

- [x] Editar transacción — EditTxSheet modal + PATCH /api/mobile/transactions
- [x] Eliminar transacción — ya existía, long-press ahora ofrece Editar / Eliminar
- [x] Editar bloque — EditBlockModal + useUpdateBlock (ya existía)
- [x] Archivar bloque — useArchiveBlock + handleBlockMenu (ya existía)
- [x] Calendar view mobile — grilla 7 cols + dots + lista por día, nextDueIso en API
- [ ] Push notifications — vencimientos de cuotas

---

## Bugs conocidos (resueltos 2026-05-24)

- [x] Crear bloque sin techo — `budget >= 0` en canSave (CreateBlockModal + EditBlockModal). Stat "Disponible" oculto cuando budget=0.
- [x] Teclado numérico — CaptureSheet usa `keyboardType="decimal-pad"` + auto-focus al abrir. Keypad custom eliminado.
- [x] Day picker calendario — chips 44×44 (era 38×38), fontSize 13 (era 12).
- [x] Sidebar swipe — sin cambios en layout, sigue funcionando.

## UI/UX (resueltos 2026-05-24)

- [x] Cuotas mobile — sección "Completadas" al pie con opacity 0.4 y tachado. API retorna todas sin filtro `completedAt: null`.
- [x] Cuotas — campo "cantidad de cuotas" solo dígitos — `onChangeText={v => setFormTotal(v.replace(/[^0-9]/g, ''))}`.
- [x] Cuotas — selector de categoría (web + mobile) — campo `category` en schema, chips en create form.
- [x] Cuotas web — fila muestra `/ mes · {monthly * remaining} restante`.
- [x] Dólar mobile — rediseño a stats planos (sin cards): tenencia/costo font:28, cotizaciones font:18.
- [x] Botones mobile — auditados todos los screens. Settings back button + budget save, Dólar back button, sistema unificado: `borderRadius:8` forms, `12` modales, `14` CaptureSheet primary, `99` icon pills.

---

## UX pendiente (v2)

- [x] Error boundary global — ErrorBoundary export en _layout.tsx (Expo Router v6)
- [x] Reiniciar datos — POST /api/mobile/reset + useResetData + confirmación en settings
- [ ] Swipe-to-delete / long-press menu en filas
- [ ] Transaction detail — rows tappeables
- [x] Presupuesto mensual — settings input + PATCH /api/mobile/user
- [x] Form validation — email regex + errores on-blur + indicador de fortaleza de contraseña en signup

---

## Paridad mobile ↔ web (v2)

- [x] Animation parity — FadeInDown entrance + stagger en los 4 tabs, viewKey en transactions y blocks, respeta animationsEnabled
- [x] Category filter en Transactions — pills horizontales bajo tabs de tipo
- [ ] Data shape unification — `StatsResponse` mobile vs `DashboardStats` web
