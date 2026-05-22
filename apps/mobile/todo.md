# Gastar Mobile — TODO

> Actualizado 2026-05-22. Solo tareas de la app mobile (Expo + React Native).

---

> Nota: fixes del 2026-05-22 fueron web-only (modales, DatePicker, layout shift en goals/installments/recurring). Mobile no tuvo cambios.

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

## Bugs conocidos (reportados 2026-05-22)

- [ ] Crear bloque sin techo — validación bloquea aunque "sin techo" sea opción válida (budget=0 debería ser permitido)
- [ ] Teclado numérico — CaptureSheet debería usar teclado numérico del sistema en vez del custom numpad
- [ ] Day picker calendario — DatePicker nativo se ve muy chiquito/mal renderizado en mobile
- [ ] Sidebar swipe — verificar que el edge swipe siga funcionando tras cambios en layout

## UI/UX pendiente (reportado 2026-05-22)

- [ ] Cuotas mobile — mostrar cuotas ya pagadas (historial, no solo las activas)
- [ ] Cuotas — campo "cantidad de cuotas" solo debe aceptar números (keyboardType + validación)
- [ ] Cuotas — agregar selector de categoría (web + mobile)
- [ ] Cuotas web — mostrar monto total del crédito O valor de cada cuota de forma prominente
- [ ] Dólar mobile — cards contenedoras no siguen el UI/UX del producto (rediseño)
- [ ] Botones generales mobile — revisar y adaptar botones que no siguen el sistema de diseño

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
