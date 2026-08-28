# Sundae Metrics — plan de implementación de la UI

Traduce `Sundae Metrics Mockups.dc.html` (pantallas `1a`–`1g`, proyecto de Claude Design) a archivos del repo. Complementa `docs/BRIEF.md` (qué es el producto), `docs/PLAN.md` (las 9 etapas del challenge) y `docs/UI-SPEC.md` (tokens, spec por pantalla y dataset fijo); este documento cubre las etapas 1 a 6.

## Objetivo

`npm run dev` levanta el dashboard con el look de `1a`, el Tool Inspector lista los 6 tools WebMCP, y `set_dashboard_view({store:"south"})` cambia la pantalla en vivo dejando rastro en el log del agente.

---

## Decisiones tomadas

Tres puntos donde este plan se aparta de `docs/BRIEF.md` / `docs/PLAN.md`, deliberadamente:

| Tema | El BRIEF/PLAN decía | Va | Por qué |
|---|---|---|---|
| Gráfico | Recharts | **Divs CSS** | El mockup ya lo dibuja así: 12 barras con altura en `%`. Son ~25 líneas contra una dependencia de ~100KB que después hay que pelear con `Cell`/`LabelList`/`CartesianGrid` para que se parezca al mockup. `queries.ts` no cambia si mañana se migra. |
| Estilos | Tailwind v4 | **CSS plano con custom properties** | Los valores del mockup (`12.5px`, `#e3e6ea`, radius 9px) están fuera de la escala de Tailwind: quedarían como arbitrary values en todas las clases. Un `index.css` con los tokens de UI-SPEC §1 como variables los toma tal cual. |
| Seed | `npx tsx scripts/seed.ts` | **`node scripts/seed.ts`** | Node 24 strippea tipos por defecto. Fallback a `npx tsx` si falla. |

Otras dos que el mockup no define:

- **`1f` y `1g` van como tabs** en la columna de contenido (`Overview · Flavor ranking · Compare periods`). Un tab bar de 10 líneas evita meter un router.
- **8 componentes, no los 10** que mapea UI-SPEC §4: `WebmcpStatus` se pliega dentro de `AgentActivityLog` (es el mismo panel, vacío) y `AgentViewToast` dentro de `App.tsx` (15 líneas, un solo consumidor).

---

## Etapa 1 — Scaffold

- `npm create vite@latest . -- --template react-ts` sobre el directorio actual, que ya existe.
- Dos dependencias y nada más: `vitest` (dev) y `webmcp-types@0.1.5` (dev — los tipos que el BRIEF ya verificó). Sin Tailwind, sin Recharts, sin router, sin librería de estado.
- `vite.config.ts`: agregar `test: { environment: 'node' }`.
- Borrar `src/App.css`, `src/assets/` y el contenido del template en `App.tsx` / `index.css`.

**Gate:** `npm run build` y `npm run dev` levantan.

---

## Etapa 2 — Datos

### `src/data/stores.ts`
Tipos `Store` / `Flavor` / `SalesRecord` de BRIEF §2 (sin `channel`), las 4 tiendas con `name` y `city`, y los 6 sabores con su label de UI (`dulce_de_leche` → "Dulce de leche").

### `scripts/seed.ts` → `src/data/sales.json`
288 registros (12 meses × 4 tiendas × 6 sabores), **anclados a los números fijos de UI-SPEC §3**. No son negociables: el mockup los muestra en pantalla, y si el seed devuelve otra cosa el diseño y el producto dejan de coincidir.

Los valores viven en UI-SPEC §3 y no se copian acá; lo que define este plan es **cómo se llega a ellos**:

- **Anclado:** el revenue mensual de North — los 12 valores, tal cual.
- **Derivado:** las otras 3 tiendas salen de la misma forma estacional escalada por un factor fijo por tienda, con marzo 2026 sobrescrito a los exactos de la spec para que `get_summary` cierre en su total.
- **Split por sabor:** vector de pesos fijo por tienda; el residuo del redondeo se carga al sabor top para que la suma cierre exacta.
- **Sobrescrito literal:** North Feb 2026, North Mar 2026 (los 6 sabores con units y revenue) y South Mar 2026 — los tres meses que el mockup muestra dato por dato.

`src/data/sales.json` se genera una vez y se **commitea**.

**Gate:** correr el seed dos veces produce un JSON byte-idéntico.

---

## Etapa 3 — Capa de queries

`src/lib/queries.ts` — funciones puras, sin React ni DOM. Es la única fuente de verdad: la consumen igual el dashboard y los tools, así que el número del gráfico y el que devuelve un tool no pueden divergir.

- `listStores()`
- `getSales({ store, month })`
- `comparePeriods({ store, monthA, monthB })`
- `getTopFlavors({ store?, month?, limit, order })`
- `getSummary({ dateFrom, dateTo })`
- `monthlyRevenue(store, from, to)` — alimenta el gráfico
- `flavorBreakdown(store, month)` — alimenta el card de sabores
- `toolText(obj)` — `JSON.stringify` **truncado a 1.500 caracteres**. El límite de Chrome no tira error: descarta el tool en silencio. Un solo helper, usado por los 6.

Las dos últimas existen para que el gráfico y el card no calculen por su cuenta lo que ya calcula la capa de queries.

**Gate — `src/lib/queries.test.ts` (Vitest), asserts contra UI-SPEC §3:**
- `comparePeriods(north, 2026-02, 2026-03)` → **−17.1%**, la respuesta de la pregunta de la demo; más un caso de crecimiento y uno de divisor cero.
- `getSummary(2026-03-01, 2026-03-31)` → el total de marzo y los 4 desgloses por tienda.
- `getTopFlavors(south, 2026-03, 3)` en `top` y en `bottom` → los dos tríos de la spec.
- `getSales(north, 2026-03)` → revenue y units de la spec, y la suma del split por sabor cierra exacta.
- `toolText` recortando un payload sobredimensionado.

El archivo de test es el único lugar del repo donde los números de UI-SPEC §3 se escriben a mano: si el seed se desvía, falla ahí.

---

## Etapa 4 — Estado

`src/lib/store.ts` — store module-level de ~30 líneas expuesto con `useSyncExternalStore`. Mutable desde fuera de React, que es exactamente lo que necesita `set_dashboard_view` en la etapa 6.

- Estado: `{ store, dateFrom, dateTo, tab }`.
- `calls`: array de llamadas del agente, cap 20.
- `toast`: guarda la vista anterior, para el `Undo` que muestran `1c` y `1d`.
- `webmcpReady`: dispara el estado `1e`.
- `applyDashboardView(input)` guarda la vista previa antes de mutar; `undoView()` la restaura.

---

## Etapa 5 — Estilos y componentes

### `src/index.css`
Los 14 tokens de UI-SPEC §1 como custom properties, uno por fila de esa tabla: `--ground`, `--surface`, `--border`, `--border-soft`, `--ink`, `--ink-2`, `--muted`, `--accent`, `--accent-deep`, `--write`, `--write-deep`, `--write-tint`, `--negative`, `--bar-idle`. Los valores salen de ahí, no se duplican acá. IBM Plex Sans (UI) e IBM Plex Mono (todo número, id, nombre de tool y JSON) desde Google Fonts. `@keyframes pulseRing` definido una sola vez.

**La regla que gobierna todo el color: indigo = el agente leyó · ámbar = el agente cambió algo.** Sin otros acentos.

### `src/components/`

| Archivo | Mockup de origen |
|---|---|
| `StoreSelector.tsx` | pills segmentadas de `1a` (track `#e8eaee`, activa blanca con `shadow-sm`), más el estado ámbar de `1c` |
| `DateRangePicker.tsx` | dos `<input type="month">` nativos con un `→` entre medio, texto mono |
| `KpiRow.tsx` | 4 cards de `1a`. Los deltas salen de `comparePeriods`, no de aritmética inline |
| `SalesChart.tsx` | barras CSS de `1a`: 12 meses, gridlines punteadas a 0/50/100%, barras del rango de comparación en indigo con el valor impreso arriba, el resto `--bar-idle`. Más el estado ámbar de `1c` |
| `FlavorBreakdown.tsx` | 6 filas, grid `120px 1fr 78px 104px`, rampa indigo `#4f46e5 → #dbd9f8` |
| `AgentActivityLog.tsx` | rail de `1a` + entradas de `1d` (read/write, expandible, chip `N / 1500 chars`, chip `Undo`, fila punteada "keep 20") **y el estado `1e`** en la misma rama |
| `FlavorRanking.tsx` | `1f`, las dos columnas `order:"top"` y `order:"bottom"` visibles a la vez |
| `PeriodCompare.tsx` | `1g`, incluido el bloque mono "What the agent receives" |

`src/App.tsx` cablea el header, el grid `1fr 328px`, el tab bar, y el toast ámbar de `1c` inline.

El chip `N / 1500 chars` de `1d` no es decoración: es la prueba visible de que el techo de 1.500 caracteres de la etapa 3 se respeta.

**Gate:** el shell vacío coincide con `1a` a 1280px. Cambiar de tienda o de rango actualiza los 4 KPI, el gráfico y el breakdown. La barra de marzo de North lee 3,987,100 — el mismo número que el KPI card.

---

## Etapa 6 — Los 6 tools WebMCP

`src/lib/webmcp-tools.ts`, con `registerTools()` llamado desde `main.tsx`.

**Guard:** si `document.modelContext` es `undefined` **o** la URL trae `?webmcp=off`, avisa por consola, deja `webmcpReady = false` (que renderiza el estado `1e`) y sigue. El dashboard humano nunca se rompe — y `?webmcp=off` es la toma "before" del video.

Los 6 de BRIEF §3: `list_stores`, `get_sales`, `compare_periods`, `get_top_flavors`, `get_summary`, `set_dashboard_view`.

Dos cosas que el BRIEF ya marcó como bug real y son fáciles de perder:

- `annotations: { readOnlyHint }` va **dentro del objeto del tool**, no como segundo argumento. El segundo solo acepta `signal` y `exposedTo`; puesto ahí, el hint se ignora en silencio.
- `set_dashboard_view` es el único con `readOnlyHint: false`, explícito aunque `false` sea el default.

Cada `execute` delega en `queries.ts`, serializa con `toolText`, y empuja al log `{ tool, input, output, readOnly, ts, ms, chars }` antes de devolver. Ninguno lleva `untrustedContentHint`: todos los datos salen del seed, no hay input de terceros.

**Gate:** el Tool Inspector lista los 6 con su schema; una pregunta al agente deja líneas visibles en el rail sin narrar nada.

---

## Verificación end-to-end

```bash
npm test && npm run build && npm run preview
```

Sobre el preview, en Chrome con `chrome://flags/#enable-webmcp-testing` activo:

1. El Tool Inspector lista los 6 tools con su schema.
2. `get_sales({store:"north", month:"2026-03"})` devuelve 3,987,100 — **el mismo número que muestra la barra de marzo y el KPI card**.
3. `compare_periods({store:"north", monthA:"2026-02", monthB:"2026-03"})` devuelve `-17.1`.
4. `set_dashboard_view({store:"south"})` cambia la pantalla, muestra el toast ámbar y deja una entrada marcada `WRITE` en el log.
5. `?webmcp=off`: el dashboard renderiza igual y el rail muestra el estado `1e`.

---

## Fuera de alcance

Etapas 7 a 9 de `docs/PLAN.md`: deploy a Vercel, README de submission, video y carga en Devpost.

Lo demás no cambia respecto de UI-SPEC §6 y `docs/PLAN.md`: granularidad horaria, `channel`, stock, backend, auth, tests de UI, dark mode, animaciones más allá del pulse del toast, y responsive más allá de 1280px.
