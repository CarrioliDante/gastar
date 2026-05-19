UI/UX Manual

Manual de diseño transferible a cualquier instancia de agente. Define el sistema visual, de movimiento y de interacción usado en `gast.ar` — web (Next.js) y mobile (Expo/React Native).

---

## 1. Filosofía de marca

**Finanzas en silencio.** El producto es un cuaderno calmo, no un tablero de control. La interfaz se comporta como una página de revista editorial: jerarquía tipográfica, blanco generoso, sin colores, sin alertas, sin gamificación.

### Lo que SÍ es

- Editorial, monocromo, tipográfico
- Silencioso, sin urgencia
- Local-first, privado
- Un solo número resumen (Pulso)

### Lo que NO es

- No usa color (nunca gradientes, nunca emojis, nunca verde/rojo para "bien/mal")
- No usa cards con sombra (bordes hairline solamente)
- No usa notificaciones agresivas ni badges rojos
- No deforma tipografía (nunca estirar, rotar, o inclinar el wordmark)

---

## 2. Design Tokens

### 2.1 Color system (monocromo)

Dos temas (light/dark), cuatro colores base. Sin paleta secundaria. Sin acentos cromáticos.

| Token           | Light              | Dark                     | Uso                                 |
| --------------- | ------------------ | ------------------------ | ----------------------------------- |
| `--bg`          | `#F5F5F2`          | `#0A0A0A`                | Fondo de página                     |
| `--surface`     | `#FAFAF8`          | `#101010`                | Superficie elevada (modales, cards) |
| `--surface-alt` | `#EFEEE9`          | `#161614`                | Sidebar, superficies alternativas   |
| `--ink`         | `#111111`          | `#F4F3EE`                | Texto principal, íconos             |
| `--ink-deep`    | `#0A0A0A`          | `#FFFFFF`                | Máximo contraste                    |
| `--inverse`     | `#FAFAF8`          | `#0A0A0A`                | Texto sobre fondo ink               |
| `--mute`        | `rgba(0,0,0,0.50)` | `rgba(244,243,238,0.55)` | Texto secundario, etiquetas         |
| `--faint`       | `rgba(0,0,0,0.32)` | `rgba(244,243,238,0.36)` | Texto terciario, metadata           |
| `--whisper`     | `rgba(0,0,0,0.08)` | `rgba(244,243,238,0.08)` | Hover backgrounds                   |
| `--hairline`    | `rgba(0,0,0,0.07)` | `rgba(244,243,238,0.08)` | Reglas separadoras primarias        |
| `--hairline2`   | `rgba(0,0,0,0.12)` | `rgba(244,243,238,0.14)` | Bordes de input, anillos            |

### 2.2 Reglas de uso de color

- Texto principal: siempre `var(--ink)`
- Separadores: siempre `var(--hairline)` (1px solid)
- Bordes de inputs/modales: `var(--hairline)` o `var(--hairline2)`
- NUNCA usar color semántico (verde para positivo, rojo para negativo)
- Los montos negativos usan `var(--faint)` para el signo `−`, no rojo
- Los montos positivos usan `var(--ink)` para el signo `+`, no verde
- Fondos de hover: `var(--whisper)` con transición 120ms

---

## 3. Tipografía

### 3.1 Las tres voces

| Rol         | Fuente         | Peso    | Uso                                                                |
| ----------- | -------------- | ------- | ------------------------------------------------------------------ |
| **Display** | Inter Tight    | 500     | Titulares, números grandes, headings                               |
| **Body**    | Inter          | 400/500 | Texto de cuerpo, labels de items                                   |
| **Mono**    | JetBrains Mono | 400/500 | Etiquetas, metadata, códigos, keyboard shortcuts, uppercase labels |

### 3.2 Escala tipográfica (web)

| Nivel           | Clase           | Font           | Size          | Weight | Letter-spacing     | Uso                            |
| --------------- | --------------- | -------------- | ------------- | ------ | ------------------ | ------------------------------ |
| Hero            | `.display`      | Inter Tight    | 96px          | 500    | -0.05em            | Balance total                  |
| H1              | `.display`      | Inter Tight    | 28-30px       | 500    | -0.035em           | Títulos de página              |
| H2              | `.display`      | Inter Tight    | 22-26px       | 500    | -0.03em            | Subtítulos                     |
| Stat            | `.display.tnum` | Inter Tight    | 22-28px       | 500    | -0.025em a -0.04em | Números en stats               |
| Body            | `.body-font`    | Inter          | 14px          | 500    | -0.005em           | Labels de items                |
| Body-sm         | `.body-font`    | Inter          | 13px          | 500    | -0.005em           | Texto secundario               |
| Amount-hero     | `.display.tnum` | Inter Tight    | 56-64px       | 500    | -0.05em            | Montos grandes                 |
| Amount-decimals | —               | Inter Tight    | ~42% del size | 400    | —                  | Decimales (color faint)        |
| Code-prefix     | —               | Inter Tight    | ~22% del size | 400    | —                  | Código de moneda (color faint) |
| Eyebrow         | `.mono`         | JetBrains Mono | 10px          | 400    | 0.18em             | Títulos de sección UPPERCASE   |
| Meta            | `.mono`         | JetBrains Mono | 9-10px        | 400    | 0.06-0.08em        | Metadata, fechas, categorías   |
| Kbd             | `.kbd`          | JetBrains Mono | 10px          | 500    | 0.02em             | Atajos de teclado              |
| Tx amount       | `.display.tnum` | Inter Tight    | 13-14px       | 500    | -0.015em           | Montos en filas                |

### 3.3 Reglas tipográficas

- `.tnum` (tabular-nums) en TODOS los números financieros
- `.display` (Inter Tight) para titulares y números
- `.mono` (JetBrains Mono) para etiquetas, metadata, uppercase
- `.body-font` (Inter) para texto corrido y labels
- Inter Tight NUNCA se usa para cuerpo de texto largo
- Letter-spacing negativo crece con el tamaño: a mayor font-size, más negativo
- La parte decimal de montos grandes siempre es más chica (~42%) y color `faint`
- El código de moneda siempre es más chico (~22%) y color `faint`

### 3.4 Tipografía alternativa

El usuario puede elegir entre 3 familias desde Settings:

- **Sans** (default): Inter Tight + Inter + JetBrains Mono
- **Serif**: Newsreader para body y display
- **Mono**: JetBrains Mono para todo

---

## 4. Layout System

### 4.1 Principios editoriales

- No cards. No shadows. Solo reglas hairline (1px) para separar.
- Espaciado generoso. El blanco es el principal elemento de diseño.
- Jerarquía puramente tipográfica.
- Layout de una sola columna con scroll vertical.
- Grid de 2 o 3 columnas solo para stats o bloques.

### 4.2 Shell de página (web)

```
┌──────────────────────────────────────────┐
│ Sidebar (232px) │  Content (flex: 1)     │
│ surface-alt     │  bg                    │
│ border-right    │  padding: 0 40px       │
│                 │  overflow-y: auto      │
└──────────────────────────────────────────┘
```

- Sidebar: ancho fijo 232px, fondo `surface-alt`, borde derecho hairline
- Content: padding horizontal 40px, padding inferior 100px (scroll safety)
- Header: padding "20px 40px 0"

### 4.3 Skeleton de pantalla editorial (mobile)

```
┌──────────────────────┐
│ ScreenHead           │  ← título display + subtitle mono
│ (padding vertical)   │
├──────────────────────┤
│ Section              │
│  Eyebrow             │  ← mono uppercase
│  Content             │  ← lista, grid, o texto
│ Hairline             │  ← 1px separador
│ Section              │
│  ...                 │
└──────────────────────┘
```

### 4.4 Patrones de layout

**Eyebrow + valor**: título de sección mono UPPERCASE arriba, valor display abajo. Espacio generoso entre ellos (14-20px).

**Lista editorial**: filas con padding vertical 14-16px, separadas por Hairline. Cada fila: [ícono 28px] [label + meta] [monto alineado a derecha].

**Grid de stats**: 3 columnas con `Stat` components. Gap 16-24px.

**Progress bar**: altura 2px (o 6px en hero), fondo `hairline`, fill `ink`. Transición 1.4s cubic-bezier(.2,.7,.1,1).

**Two-column editorial**: grid `1fr 1fr` con gap 40px. Usado para Cuotas + Recurrentes en dashboard.

---

## 5. Componentes Primitivos

### 5.1 `Eyebrow`

Título de sección mono, uppercase, 10px, tracking 0.18em, color `mute`. Opcional: elemento `right` alineado a la derecha (color `faint`, tracking 0.08em).

### 5.2 `H2`

Wrapper de sección con padding-top configurable (default 56px), margin-bottom 18px. Contiene un Eyebrow con opción de right link.

### 5.3 `Hairline`

`<div>` de 1px de altura, color `hairline`. Acepta `inset` (margen lateral) y `style`.

### 5.4 `Stat`

Número grande (display) + label mono UPPERCASE. Props: `value`, `label`, `size` (default 22), `decimals`, `code`, `sign`, `suffix`, `weight`. El label siempre 9px mono debajo del número.

### 5.5 `Amount`

Display hero para montos. Props: `value`, `size` (default 64), `decimals` (default 2), `code`, `muted`, `weight`. Auto-formatea con coma cada 3 dígitos, decimales en tamaño reducido (42%) y color `faint`, código de moneda en tamaño reducido (22%) y color `faint`. Signo negativo usa `−` (U+2212, no hyphen).

### 5.6 `TxRow`

Fila de transacción: [glyph 28px] [label + meta] [monto ± derecho]. El signo usa colores: positivo `+` en ink, negativo `−` en faint. Soporta `installment` como subtag debajo del monto.

### 5.7 `ListRow`

Fila editorial genérica. Props: `glyph`, `label`, `meta`, `right`, `sub`, `progress` (0-1), `onClick`. Con progress, muestra una barra 2px debajo.

### 5.8 `BlockGlyph`

Ícono de bloque. Usa 36 íconos de Tabler Icons (@tabler/icons-react en web, paths SVG inline en mobile). Props: `kind`, `size` (default 18), `color`, `stroke` (default 1.5). Los íconos están curados en 6 categorías de 6: Vivienda, Transporte, Salud, Comida/Compras, Trabajo/Ocio, Social/Tech.

### 5.9 `RadialRing`

Anillo de progreso SVG. Props: `value` (0-1), `size`, `stroke`, `label`, `sub`. El arco usa stroke-dasharray con transición 1.4s cubic-bezier(.2,.7,.1,1).

### 5.10 `LineChart`

SVG sparkline. Props: `data` (number[]), `width`, `height`, `stroke`, `fill` (gradiente bajo la línea), `dot` (círculo al final). Sin ejes, sin labels. Minimalista.

### 5.11 `BarChart`

SVG bar chart. Props: `data`, `width`, `height`, `gap`, `highlight`. La última barra se resalta en `ink`, el resto en `hairline2`. Sin ejes.

### 5.12 `Pulso`

Medidor semicircular SVG (180° a 360°). Props: `value` (0-100), `size`, `showLabel`. Arco background `hairline2`, arco valor `ink`, dot al final, número centrado abajo.

### 5.13 `Kbd`

Tecla de atajo: inline-flex, 18px height, padding 0 5px, border-radius 4px, fondo whisper, borde hairline2, texto mono 10px.

---

## 6. Sistema de Motion

### 6.1 Filosofía

Cinematic, editorial, settled. Sin overshoot fuerte. Sin bounces exagerados. Todo se siente como pasar la página de una revista.

### 6.2 Curvas de easing (web, framer-motion)

| Nombre         | Valor                | Uso                                                 |
| -------------- | -------------------- | --------------------------------------------------- |
| `springGentle` | spring(100, 20, 0.5) | Entradas de elementos, stagger children             |
| `springSnappy` | spring(200, 25, 0.4) | Interacciones rápidas                               |
| `springBouncy` | spring(320, 14, 0.3) | Solo para acentos (el punto del logo)               |
| `easeOutExpo`  | [0.16, 1, 0.3, 1]    | Scroll reveals, fade+rise                           |
| `easeCinema`   | [0.65, 0, 0.35, 1]   | Transiciones de página, curtain reveal, draw-in SVG |
| `easeGlide`    | [0.2, 0.7, 0.1, 1]   | Progress bars, ring fills                           |

### 6.3 Curvas de easing (vanilla, `motion.js`)

| Nombre   | CSS Value                           |
| -------- | ----------------------------------- |
| `silk`   | `cubic-bezier(0.16, 1, 0.3, 1)`     |
| `soft`   | `cubic-bezier(0.22, 0.61, 0.36, 1)` |
| `cinema` | `cubic-bezier(0.65, 0, 0.35, 1)`    |
| `spring` | `cubic-bezier(0.34, 1.18, 0.64, 1)` |
| `glide`  | `cubic-bezier(0.2, 0.7, 0.1, 1)`    |

### 6.4 Animaciones estándar

**Fade + rise (entrada de elementos)**

- opacity 0 → 1, translateY 14px → 0
- duration: 900ms, ease: silk
- stagger entre children: 60-120ms

**Page transition (cambio de ruta)**

- opacity 0 → 1, translateY 12px → 0
- spring gentle

**Scroll reveal (elementos al entrar al viewport)**

- opacity 0 → 1, translateY 40px → 0 (o direction left/right)
- duration: 500ms, ease: [0.16, 1, 0.3, 1]
- viewport margin: -60px, once: true

**Stagger list (listas)**

- staggerChildren: 0.04-0.08s
- delayChildren: 0.05-0.1s
- cada child: opacity 0→1, y 14px→0, spring gentle

**Progress bar fill**

- width 0% → target%
- duration: 1.2-1.5s, ease: glide o silk
- delay escalonado por índice

**Number ticker (AnimatedNumber)**

- Anima de 0 al valor target (o del valor anterior al nuevo)
- duration: 1.2s, ease: [0.16, 1, 0.3, 1]
- Usa `useMotionValue` + `useTransform` (framer-motion) o `animate()` (motion.js vanilla)

**Text reveal (palabras o caracteres)**

- Cada palabra/char: translateY(100% → 0) + opacity 0→1
- Stagger: 18ms (char) o 60ms (word)
- Spring gentle (o ease out-expo si spring=false)

**Draw-in SVG**

- stroke-dasharray = length, stroke-dashoffset length → 0
- duration: 1600-1800ms, ease: cinema
- stagger entre paths: 60-80ms

**Theme curtain**

- Clip-path circular expand desde el toggle button
- duration: 900ms, ease: cinema
- Overlay se desvanece en 500ms después del cambio

### 6.5 Reglas de motion

- `prefers-reduced-motion` desactiva TODAS las animaciones (clase global `.no-animations`)
- Las animaciones solo se ejecutan una vez (`viewport: { once: true }`)
- Nunca animar layout (solo opacity + transform)
- El motivo del punto ( logo) respira con `breathe()`: scale 1 → 1.012 → 1 en 8-11s, loop infinito

---

## 7. Componentes de Interacción

### 7.1 BottomNav (mobile)

Barra flotante inferior con glass morphism (backdrop-filter blur, transparencia 88%). 4 tabs + FAB central. FAB dinámico: dependiendo del último tipo de captura (gasto/ingreso), muestra `−` (ink sólido) o `+` (outline). Border-radius 28px. Sin labels debajo de los íconos.

### 7.2 Sidebar (web)

Ancho 232px, fondo `surface-alt`, borde derecho hairline. Secciones colapsables con stagger animation. Search input tipo pill al inicio. Footer con botón Anotar, theme toggle, y logout.

### 7.3 SwipeableTabView (mobile)

Navegación por swipe horizontal entre tabs. Usa GestureDetector + Reanimated. Umbral: 50px distancia o 200px/s velocidad. Animación de salida: withTiming 220ms ease-out cubic.

### 7.4 CommandPalette (web)

Modal tipo spotlight (⌘K). Overlay con blur. Input de búsqueda con filtrado fuzzy. Resultados agrupados por categoría, con navegación por teclado (↑↓ Enter Esc). Animación: fade-in + rise en 240ms.

### 7.5 QuickExpense / CaptureSheet

Modal de captura rápida. Web: panel lateral derecho con AmountInput (formateo automático de moneda). Mobile: bottom sheet con campos: monto, nombre, categoría, bloque. Optimizado para < 3 segundos.

### 7.6 AmountInput

Input numérico con formateo automático. Detecta el currency symbol y formatea on blur. Oculta el input original y envía el valor numérico limpio en un hidden input.

---

## 8. Iconografía

### 8.1 Logo

El logotipo es un punto (círculo sólido). El wordmark canónico es `gast.ar` donde:

- `gast` va en Inter Tight 500
- `.` es un círculo geométrico levantado a la altura de la x (radio = ½ x-height)
- `ar` va en Newsreader Italic 400

### 8.2 Íconos de bloque (Tabler Icons)

36 íconos, stroke 1.5px. Curados en 6 categorías:

- **Vivienda**: Home, Building, Key, Bulb, Flame, Droplet
- **Transporte**: Car, Bike, Plane, Train, Bus, GasStation
- **Salud**: Heart, Activity, Barbell, Apple, FirstAidKit, Run
- **Comida/Compras**: Coffee, ToolsKitchen2, ShoppingBag, Pizza, Coins, CreditCard
- **Trabajo/Ocio**: Briefcase, TrendingUp, Music, Book, Movie, Camera
- **Social/Tech**: Users, Dog, Globe, Map, DeviceMobile, DeviceLaptop

### 8.3 Íconos de navegación

SVGs inline minimalistas, 16-18px viewBox, stroke 1.2-1.3px. Sin relleno excepto para el estado activo. Diseñados a mano para cada ruta.

---

## 9. Manejo de Estados

### 9.1 Empty states

- Texto body-font 14px `mute` como título ("Sin cuotas activas")
- Texto mono 11px `faint` como descripción ("Registrá compras en cuotas...")
- Botón CTA: pill con ícono `+` y texto. Fondo `ink`, texto `inverse`
- Opcional: link secundario con borde hairline

### 9.2 Estados de carga

- No hay spinners circulares genéricos
- Preferir skeleton con barras hairline que pulsan
- LoadingLogo: animación de respiración del punto del logo (scale 1→1.05→1)

### 9.3 Errores

- No hay alerts ni toasts intrusivos
- Texto mono en `mute` describiendo el error
- Botón de reintento con estilo ghost (borde hairline)

### 9.4 Estados "Pagar" (acciones en filas)

- Botón inline: texto mono 10px, color `mute`, subrayado hairline
- Estado pagado: texto mono 9px "Pagado" en `faint`
- Estado pagando: texto "..." mientras el mutation está pending

---

## 10. Responsive y Plataformas

### 10.1 Web (Next.js App Router)

- Server Components para páginas (page.tsx)
- Client Components para interactividad (\*-client.tsx)
- Tailwind v4 para utilidades, CSS custom properties para tokens
- Sidebar + contenido en flex row
- Motion: framer-motion (motion/react)
- Íconos: @tabler/icons-react

### 10.2 Mobile (Expo/React Native)

- NativeWind (Tailwind v3) para estilos
- CSS properties idénticas al web a través de `useTheme()` hook
- Reanimated para animaciones de alto rendimiento
- react-native-gesture-handler para gestures
- react-native-svg para íconos y gráficos
- Íconos de bloque: paths SVG hardcodeados de Tabler Icons

### 10.3 Paridad web↔mobile

- Tokens de color idénticos (mismos hex, mismos nombres)
- Tipografía: mismas fuentes (Inter Tight, Inter/System, JetBrains Mono/Menlo). Mobile usa system font como fallback de Inter (no se carga la webfont).
- Mismos nombres de componentes (Eyebrow, Stat, Amount, Hairline, TxRow)
- Misma jerarquía visual y espaciado

---

## 11. Checklist de Implementación

Antes de escribir código, verificar:

- [ ] ¿Estoy usando `var(--ink)` para texto principal? ¿`var(--mute)` para secundario?
- [ ] ¿Estoy usando `var(--hairline)` (1px) para separadores? ¿Nunca cards con shadow?
- [ ] ¿Los números usan `.tnum` (tabular-nums) y `.display` (Inter Tight)?
- [ ] ¿Las etiquetas usan `.mono` (JetBrains Mono) UPPERCASE con tracking generoso?
- [ ] ¿Hay animaciones de entrada (fade+rise, stagger) con `prefers-reduced-motion` respect?
- [ ] ¿No hay colores, gradientes, emojis, badges, o notificaciones agresivas?
- [ ] ¿Los montos negativos usan `−` (U+2212) no `-` (hyphen)?
- [ ] ¿El espaciado es generoso? ¿La jerarquía es puramente tipográfica?
- [ ] ¿Los componentes existen como primitivos reusables en `ui/primitives.tsx`?
- [ ] ¿Web y mobile comparten la misma estructura visual?

---

## 12. Referencia Rápida de Tokens

```css
/* Light theme (default) */
--bg: #f5f5f2;
--surface: #fafaf8;
--surface-alt: #efeee9;
--ink: #111111;
--ink-deep: #0a0a0a;
--inverse: #fafaf8;
--mute: rgba(0, 0, 0, 0.5);
--faint: rgba(0, 0, 0, 0.32);
--whisper: rgba(0, 0, 0, 0.08);
--hairline: rgba(0, 0, 0, 0.07);
--hairline2: rgba(0, 0, 0, 0.12);
```

```css
/* Typography classes */
.display  → Inter Tight, 500, letter-spacing: -0.035em
.body-font → Inter, inherit weight
.mono     → JetBrains Mono, monospace
.tnum     → tabular-nums + ss01
```

```jsx
/* Easing presets (framer-motion) */
springGentle:  { stiffness: 100, damping: 20, mass: 0.5 }
springSnappy:  { stiffness: 200, damping: 25, mass: 0.4 }
easeOutExpo:   [0.16, 1, 0.3, 1]
easeCinema:    [0.65, 0, 0.35, 1]
easeGlide:     [0.2, 0.7, 0.1, 1]
```
