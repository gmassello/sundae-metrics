# Competidores — webmcp (Mandate)

| | |
|---|---|
| Fecha | 2026-09-28 |
| Modo | hackathon |
| Evaluados | 1 · clonados 1 · **nada se ejecuto** |
| Ventana | submissions: fecha de apertura no legible en `/details/dates` (sin evidencia); el repo rival se creo 2026-08-29 [1] |

## En criollo

- **Que se miro:** un solo rival, `HarzerHeribert/webMCP` ("Mandate"), contra `gmassello/sundae-metrics`, con las mismas sondas.
- **Quien es la amenaza:** Mandate, alta. Su README y su Devpost se presentan como ganador del concurso, y sus 58 casos de prueba mas 251 verificaciones cubren el criterio "humano en el loop" que el nuestro no toca [2][3].
- **Como estamos:** mejor en simpleza y claridad (demo 0.21 s, un solo dataset); peor en ingenieria de permisos, pruebas de navegador y documentacion.
- **Que conviene hacer:** medir y publicar el antes/despues (con y sin WebMCP) y agregar una confirmacion humana antes de escribir.

**Pesos del jurado** (de `docs/judging.tsv`, criterios de `webmcp.devpost.com/rules`; los cuatro pesan igual):

| Criterio | Peso | Secciones que lo responden |
|---|---:|---|
| WebMCP Leverage | 25% | 2, 7 |
| Execution | 25% | 4, 5, 6, 10 |
| Potential Impact | 25% | 1, 6 |
| Creativity | 25% | 7, 4 |

**Lo que no se pudo ver** — el margen de error de todo lo que sigue:

- La fecha de apertura del evento: la pagina `/details/dates` devolvio solo el pie de pagina, asi que "commits previos al evento" queda sin evidencia [1].
- Si las pruebas pasan: no se ejecuto nada, solo se contaron.
- El video de Mandate: existe en Devpost (YouTube) [4], pero no se miro su contenido.

---

## Tabla comparativa

Escala: `fuerte` · `cumple` · `flojo` · `ausente` (se miro y no esta) · `sin evidencia` (no se pudo ver).

| Proyecto | Nicho | WebMCP Leverage | Execution | Potential Impact | Creativity | Nota | Amenaza |
|---|---|---|---|---|---|---:|---|
| `HarzerHeribert/webMCP` | permisos acotados para agentes (CRM) | fuerte | fuerte | cumple | fuerte | 8/10 | alta |
| `gmassello/sundae-metrics` (tuyo) | dashboard de ventas que un agente lee exacto | cumple | cumple | cumple | cumple | 6/10 | — |

**Amenaza** es contra *tu* entrada, no calidad absoluta: aca ambos usan WebMCP pero resuelven problemas distintos (permisos vs lectura exacta).

---

## `HarzerHeribert/webMCP` — Mandate

<!-- ficha -->

**Que hace:** una persona define que puede tocar un agente y por cuanto tiempo, y el servidor rechaza todo lo que se salga de ese permiso.

| | |
|---|---|
| Repo | https://github.com/HarzerHeribert/webMCP · creado 2026-08-29 · TypeScript · MIT |
| Demo | https://webmcp-weld.vercel.app · `curl` 200 en 0.38s [5] |
| Devpost | mandate-ix29ek · video si (YouTube) [4] |
| Equipo | 1 contribuyente humano · 50/50 commits en el clone (mas 1 de bot "Claude") [6] |
| Historial | primer commit 2026-08-29 (init de especificacion, 3 lineas) · 85 commits [7] · previos al evento: sin evidencia |

| Criterio | Veredicto | Evidencia |
|---|---|---|
| WebMCP Leverage 25% | fuerte | 11 codigos de error tipados (`OUT_OF_SCOPE`, `HUMAN_CONFIRMATION_REQUIRED`, `POLICY_CHANGED`...); cambios "staged" y sin herramienta de apply; notas sobre Chrome 152 y `AbortSignal` en el adaptador [8] |
| Execution 25% | fuerte | 58 tests (38 unit/integracion + 20 navegador), 251 `expect` [2]; demo 200 en 0.38s [5]; **sin CI (nadie corre sus pruebas solo)** [9] |
| Potential Impact 25% | cumple | caso CRM concreto; plan de comparacion con "baseline generico" solo en `docs/08_EVAL_AND_TEST_PLAN.md`, sin resultado publicado [10] |
| Creativity 25% | fuerte | herramientas que se achican cuando el permiso se achica, mas rechazo del servidor a cada llamada [8] |
| Documentacion | fuerte | 22 docs numerados en `docs/`, README 1916 palabras [11] |
| Calidad de codigo | cumple | eslint con 0 warnings permitidos, 16373 lineas sin lockfile ni media [12] |
| Seguridad | cumple | ningun `.env`/`.pem` en el arbol ni en el historial; sin patrones de claves [13] |

**Lo mas fuerte:** ingenieria de permisos con 11 errores tipados y 251 verificaciones [2][8].
**Donde se cae:** sin CI, y el antes/despues esta planeado pero no medido [9][10].
**Sin evidencia:** fecha de apertura del evento, resultado de las pruebas, contenido del video.

---

## Donde queda tu proyecto

| Criterio | tu proyecto | `HarzerHeribert/webMCP` |
|---|---|---|
| Tools con alta/baja dinamica (`unregister`/`AbortSignal`) | 0 apariciones [8] | adaptador lo maneja, con nota de que Chrome 152 no puede deshacer [8] |
| Humano en el loop (aprobar antes de escribir) | 0 archivos con approve/propose/confirm [14] | cambios "staged" + `HUMAN_CONFIRMATION_REQUIRED` [8] |
| Undo / estado compartido | si, `undo` en `store.ts`, un nivel [8] | si, en adaptador e inspector [8] |
| Tests / asserts | 50 `it/test`, 82 `expect` [2] (CLAUDE.md dice 56) | 58 `it/test`, 251 `expect` [2] |
| Tests de navegador (E2E) | 0 | 20 (Playwright) [2] |
| Commits | 14 desde 2026-08-27 [7] | 85 desde 2026-08-29 [7] |
| CI | sin CI [9] | sin CI [9] |
| Demo desplegado | 200 en 0.21s [5] | 200 en 0.38s [5] |
| Antes/despues medido | `?webmcp=off` existe, sin numeros [14] | planeado, sin resultado [10] |

### Sugerencias

| # | Sugerencia | Por que importa | Criterio (peso) | Origen | Evidencia | Esfuerzo | Mueve nota |
|---|---|---|---|---|---|---|---|
| S-01 | Medir y publicar el antes/despues (con y sin WebMCP, tiempo y exactitud) | es la unica forma de probar que la herramienta sirve, y nadie lo publico | Potential Impact (25%) | hueco | ni tu repo ni Mandate tienen resultado medido [10][14] | medio | si |
| S-02 | Agregar confirmacion humana antes de `set_dashboard_view` | el jurado busca que la persona controle al agente | WebMCP Leverage (25%) | brecha | Mandate: `HUMAN_CONFIRMATION_REQUIRED`; tu repo: 0 [8][14] | medio | si |
| S-03 | Agregar pruebas de navegador (Playwright) sobre las 6 tools | hoy solo se prueba logica, no la pantalla | Execution (25%) | brecha | 20 E2E de Mandate contra 0 tuyos [2] | medio | si |
| S-04 | Sumar un workflow minimo de GitHub que corra `npm test` | prueba que los 56 tests corren solos; ninguno lo tiene | Execution (25%) | hueco | 0 workflows en ambos [9] | bajo | si |
| S-05 | Registrar/quitar herramientas segun la vista (`unregister`/`AbortSignal`) | Mandate lo usa, es señal de uso profundo de WebMCP | WebMCP Leverage (25%) | brecha | 0 apariciones tuyas contra adaptador de Mandate [8] | medio | si |
| S-06 | Estrellas, topics, largo del README | el jurado no los pondera | — | — | Mandate tiene 0 estrellas [1] | bajo | **cosmetico** |

> Control de sesgo: tu proyecto sale peor o igual en 8 de 9 filas de la comparacion, asi que no sale mejor en todo. Las celdas mas comodas (demo rapido, dataset claro) se revisaron: solo el tiempo de demo favorece a tu proyecto, y 0.21 s contra 0.38 s no mueve una nota.

---

## Apendice — como se midio

<!-- ficha -->

| Ref | Comando |
|---|---|
| [1] | `jq '{fork,stars:.stargazers_count,created:.created_at,pushed:.pushed_at,license:.license.spdx_id,homepage,archived}' webMCP.json` y `curl -s https://webmcp.devpost.com/details/dates` (sin fechas legibles) |
| [2] | `grep -rEo '^\s*(it\|test)\(' tests e2e \| wc -l` y `grep -rEo 'expect\(' tests e2e \| wc -l` (idem `src` en el repo propio) |
| [3] | `head -40 webMCP.readme` (badge y texto "Winner"); `grep -ci winner` en la pagina de Devpost = 2 |
| [4] | `curl -s https://devpost.com/software/mandate-ix29ek \| grep -oiE 'youtube.com/embed/[A-Za-z0-9_-]+'` |
| [5] | `curl -s -o /dev/null -w '%{http_code} %{time_total}s' <url>` (webmcp-weld.vercel.app y sundae-metrics.vercel.app) |
| [6] | `git shortlog -sn HEAD` en el clone (`--depth 50`, 51 commits visibles) |
| [7] | `gh api "repos/HarzerHeribert/webMCP/commits?per_page=100"` (fechas) y `git rev-list --count HEAD`; root real por API: 3 lineas, "initialize specification repository" |
| [8] | `grep -rnE 'registerTool\|unregister\|AbortSignal\|AbortController' src`, `grep -oE "'[A-Z_]{6,}'" server/core/errors.ts`, `grep -rliE 'staged\|approve\|propose' src server`, `grep -rliE 'undo' src` |
| [9] | `grep -c '.github/workflows' webMCP.tree` = 0; `gh run list` = `[]` |
| [10] | `grep -rniE 'baseline\|without webmcp\|control group' README.md docs` |
| [11] | `grep -c 'docs/' webMCP.tree`; `wc -w webMCP.readme` |
| [12] | `git ls-files \| grep -vE 'package-lock\|node_modules\|dist/\|docs/media' \| xargs wc -l \| tail -1`; `grep '"lint"' package.json` |
| [13] | `git ls-files \| grep -iE '(^\|/)\.env$\|\.pem$'`; `git log --all --diff-filter=A --name-only --format= \| grep -iE '\.env$\|\.pem$'`; `grep -rnE 'sk-[A-Za-z0-9]{20}\|AKIA[0-9A-Z]{16}\|BEGIN (RSA\|PRIVATE)' .` (todo vacio) |
| [14] | `grep -rliE 'approv\|propos\|confirm' src` (vacio) y `grep -ciE 'without\|baseline\|webmcp=off' README.md` = 5 (solo describe el toggle) |
