# Sundae Metrics — plan en etapas

## Contexto

El repo está vacío: solo `docs/BRIEF.md`, `README.md` (16 bytes) y `LICENSE`. El brief define un dashboard de ventas para Glacé (4 heladerías ficticias) que expone tools WebMCP, para el WebMCP Challenge de Devpost con deadline **3-sep-2026 13:00 PT**. Hoy es 27-ago-2026: quedan 7 días.

El problema que resuelve el producto: un agente mirando un gráfico SVG no puede leer un número exacto, lo estima o lo inventa. Con `document.modelContext.registerTool()` el dashboard devuelve el dato real. Al terminar: sitio deployado en Vercel, 6 tools funcionando en Chrome con el flag activo, video del contraste before/after, y submission cargada en Devpost.

## Suposiciones

- Datos: 2025-09 → 2026-08, estacionalidad de hemisferio sur (pico dic-feb), montos en ARS.
- **Sin Zustand**: un store module-level de ~20 líneas con `useSyncExternalStore` cubre el estado de la vista y el log. Los tools se ejecutan fuera de React y necesitan mutar estado igual — es el mismo mecanismo para ambas cosas, no vale traer una dependencia.
- **Un solo seed**: `scripts/seed.ts` corrido una vez con `npx tsx`, commiteando `src/data/sales.json`. El brief lista el archivo dos veces (`scripts/` y `src/data/seed-data.ts`); va uno.
- El nombre de la carpeta ya existe: `npm create vite` se corre sobre el directorio actual, no crea `sundae-metrics/` adentro.
- Vos tenés las cuentas de Vercel, YouTube y Devpost; yo no cargo nada con tu identidad sin que lo apruebes.

---

## Etapa 0 — Pre-vuelo (manual, tuyo, antes de que yo toque código)

1. `chrome://flags/#enable-webmcp-testing` → Enabled → relanzar Chrome.
2. Instalar la extensión [Model Context Tool Inspector](https://github.com/beaufortfrancois/model-context-tool-inspector).
3. Reclamar créditos Vercel (`OAIWEBMH-9E2F-MUT4`), Render y Netlify — cupo por orden de llegada.
4. Registrarte en Devpost.

**Gate:** en la consola de Chrome, `document.modelContext` no devuelve `undefined`.

---

## Etapa 1 — Scaffold

- `npm create vite@latest . -- --template react-ts`
- Tailwind v4 (`@tailwindcss/vite`), Recharts, `webmcp-types@0.1.5` como devDependency (los tipos que el brief ya verificó).
- Sin router, sin librería de estado, sin linter extra al del template.

**Gate:** `npm run build` y `npm run dev` levantan la página del template.

---

## Etapa 2 — Datos

- `scripts/seed.ts`: PRNG con semilla fija (determinista, sin `Math.random` libre), 12 meses × 4 tiendas × 6 sabores = 288 registros. Dulce de leche siempre arriba; un sabor con caída fuerte en un mes puntual para que "¿por qué bajó?" tenga respuesta.
- `src/data/sales.json` generado y commiteado. `src/data/stores.ts` con las 4 tiendas y los tipos `Store` / `Flavor` / `SalesRecord` del brief (sin `channel`).

**Gate:** `npx tsx scripts/seed.ts` corrido dos veces produce un JSON byte-idéntico.

---

## Etapa 3 — Capa de queries

`src/lib/queries.ts` — funciones puras, sin React, sin DOM: `listStores`, `getSales`, `comparePeriods`, `getTopFlavors`, `getSummary`. Son la única fuente de verdad: las consumen igual el dashboard y los tools, así que un número que aparece en el gráfico y otro que devuelve un tool no pueden divergir.

Acá va también `toolText(obj)`: serializa y **trunca a 1.500 caracteres**. El límite de Chrome no tira error — descarta el tool en silencio. Un solo helper, usado por los 6.

**Gate:** `src/lib/queries.test.ts` (Vitest, ya viene con Vite). Un archivo, casos mínimos: `comparePeriods` con crecimiento, con caída y con divisor cero; `getTopFlavors` en `top` y en `bottom`; `toolText` recortando un payload sobredimensionado. `npm test` en verde.

---

## Etapa 4 — Dashboard para humanos (sin WebMCP todavía)

- `src/lib/store.ts`: estado `{ store, dateFrom, dateTo }` + array de llamadas del agente, expuesto con `useSyncExternalStore`. Mutable desde fuera de React — es lo que va a necesitar `set_dashboard_view` en la etapa 5.
- `src/components/SalesChart.tsx` (Recharts, barras por mes + desglose por sabor), `StoreSelector.tsx`, `DateRangePicker.tsx` (`<input type="month">` nativo, sin librería de fechas).
- `src/App.tsx` los cablea.

**Gate:** navegando a mano, cambiar de tienda y de rango actualiza el gráfico. Se ve bien en Chrome.

---

## Etapa 5 — Los 6 tools WebMCP

`src/lib/webmcp-tools.ts`, un `registerTools()` llamado desde `main.tsx` con guard: si `document.modelContext` es `undefined` (flag apagado), avisa por consola y sigue — el dashboard humano no se rompe.

Los 6 de la sección 3 del brief: `list_stores`, `get_sales`, `compare_periods`, `get_top_flavors`, `get_summary`, `set_dashboard_view`.

Dos cosas que el brief marca y son fáciles de perder:
- `annotations: { readOnlyHint }` va **dentro del objeto del tool**, no como segundo argumento. El segundo argumento solo acepta `signal` y `exposedTo`.
- `set_dashboard_view` es el único con `readOnlyHint: false`, explícito aunque sea el default.

Cada `execute` delega en `queries.ts` y serializa con `toolText`. Ninguno lleva `untrustedContentHint`: todos los datos salen del seed, no hay input de terceros.

**Gate:** el Tool Inspector lista los 6 con su schema. Prueba manual en Chrome: `get_sales({store:"north", month:"2026-03"})` devuelve el mismo número que muestra el gráfico, y `set_dashboard_view` cambia la pantalla en vivo.

---

## Etapa 6 — AgentActivityLog

`src/components/AgentActivityLog.tsx`, leyendo el array del store de la etapa 4. Cada `execute` empuja `{ tool, input, resumen, readOnly }` antes de devolver.

Lectura y escritura se distinguen visualmente (color + ícono distinto para `set_dashboard_view`). Es gratis —el dato ya está en cada tool— y pone en pantalla el hint de seguridad, que si no queda enterrado en el código.

**Gate:** hacerle una pregunta al agente y ver aparecer la línea `🔧 get_sales(north, 2026-03) → $412.300` sin narrar nada.

---

## Etapa 7 — Deploy + README

- Vercel, proyecto nuevo desde el repo de GitHub. Preset Vite, sin variables de entorno.
- `README.md` (hoy tiene 16 bytes) reescrito **asumiendo que nadie va a correr el código**: qué es, screenshot, los 6 tools con su input/output, cómo activar el flag de Chrome, y por qué WebMCP es lo que hace posible el caso. El FAQ del challenge dice que los jueces pueden puntuar solo con el repo y la descripción.
- Licencia visible en el **About del repo de GitHub**, no solo el archivo `LICENSE`.

**Gate:** abrir la URL de Vercel en Chrome con el flag activo, desde una ventana limpia, y que los 6 tools respondan.

---

## Etapa 8 — Video before/after (< 3 min, YouTube, con audio)

- **Before, real y no actuado**: con Claude in Chrome, misma pregunta contra el dashboard con el registro de tools desactivado (query param `?webmcp=off` que saltea `registerTools()` — 2 líneas). El agente tiene que estimar la altura de la barra. Se filma el fallo de verdad.
- **After**: misma pregunta, tools activos, dos llamadas, número exacto, y el AgentActivityLog mostrándolas.
- Cierre con `set_dashboard_view`: el agente cambia lo que vos estás mirando.

**Gate:** el video dura menos de 3 minutos, tiene audio, está subido a YouTube como público o no listado.

---

## Etapa 9 — Submission Devpost

Descripción escrita cubriendo: por qué WebMCP encaja acá, qué pueden hacer juntos usuario y agente que antes no podían, y el detalle técnico. Incluir los tres puntos del brief que suman sin costo: el vocabulario de KPIs viene de productos que ya se le venden a heladerías reales (HioPOS, Sipos, GETPOS); `order: "bottom"` responde al KPI de "slow movers"; ninguna tool lleva `untrustedContentHint` y está justificado por qué.

**Gate:** submission cargada antes del 3-sep 13:00 PT, con repo público, URL viva y video.

**Después de enviar no se toca nada** —ni Devpost, ni el repo, ni el sitio— hasta el 23-sep. Si querés seguir mejorando, se forkea y se trabaja sobre la copia.

---

## Documentación a actualizar

- `README.md` — reescrito completo en la etapa 7. Es el entregable que más pesa en el puntaje.
- `docs/BRIEF.md` — no se toca, queda como documento de origen.
- Sin CHANGELOG ni docs/ adicionales: proyecto de 7 días, un solo autor.

## Verificación end-to-end

```bash
npm test && npm run build && npm run preview
```

Y sobre el preview, en Chrome con el flag: el Tool Inspector lista 6 tools; `compare_periods({store:"north", monthA:"2026-02", monthB:"2026-03"})` devuelve un porcentaje que coincide con lo que muestra el gráfico; `set_dashboard_view({store:"south"})` cambia la pantalla y deja una línea marcada como escritura en el AgentActivityLog.

## Fuera de alcance

Granularidad horaria, `channel` (mostrador/salón/delivery) y `get_channel_mix`, control de stock, backend, autenticación, tests de UI, responsive más allá de que se vea decente en la pantalla del video.

## Explicación funcional para dummies

Hoy, si le pedís a un asistente de IA que lea un número de un gráfico en pantalla, tiene que mirar la imagen y calcular a ojo cuánto mide la barra. Se equivoca, y peor: se equivoca con seguridad.

Esto construye una página de ventas de una heladería con cuatro sucursales, donde el asistente no tiene que mirar nada: la propia página le ofrece seis "preguntas que puede hacer" y le contesta con el número exacto. Una de esas seis va al revés — el asistente cambia lo que vos estás viendo en la pantalla, así que si le decís "mostrame la sucursal Sur", la pantalla cambia sola delante tuyo.

Al costado hay un panel que va anotando cada consulta que hizo el asistente, con un color distinto según si solo miró datos o si tocó algo. Nada queda oculto: ves en vivo qué preguntó y qué le respondieron.
