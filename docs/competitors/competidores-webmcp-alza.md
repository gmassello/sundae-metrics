# Competidores — WebMCP Challenge (Alza)

| | |
|---|---|
| Fecha | 2026-09-28 |
| Modo | hackathon |
| Evaluados | 1 · clonados 1 (borrado) · **nada se ejecuto** |
| Ventana | apertura 2026-08-25 (Devpost `details/dates`) → cierre no consultado |

## En criollo

- **Que se miro:** un solo rival, `Elioz404/Alza`, un editor de planos de casas con vista 3D que un agente de IA maneja por herramientas WebMCP.
- **Quien es la amenaza:** Alza, alta: usa las cuatro ideas que el jurado premia (herramientas que aparecen y desaparecen, aprobacion humana, deshacer, errores que el agente puede corregir) y vos solo una.
- **Como estamos:** mas tests (50 contra 30) y demo en vivo igual de rapido (0.37 s contra 0.43 s), pero con menos profundidad en el uso de WebMCP.
- **Que conviene hacer:** sumar una aprobacion humana antes de escribir y documentar la medicion sin/con herramientas.

**Pesos del jurado** (`docs/judging.tsv`, criterios de `webmcp.devpost.com/rules` §7, igual peso):

| Criterio | Peso | Secciones que lo responden |
|---|---:|---|
| WebMCP Leverage (4 señales) | 25% | 2, 7 |
| Execution (tests, demo en vivo) | 25% | 1, 6, 10 |
| Potential Impact (audiencia real, antes/despues) | 25% | 1, 6 |
| Creativity (problema que solo WebMCP resuelve) | 25% | 7, 4 |

**Lo que no se pudo ver** — el margen de error de todo lo que sigue:

- Solo se evaluo 1 repo; no se busco al resto de los inscriptos, asi que "amenaza" es contra Alza, no contra el campo.
- El video de Alza esta en Devpost [6] pero no se miro: si muestra el producto andando queda `sin evidencia`.
- Nada se ejecuto: que las herramientas registren y el bloqueo de aprobacion funcionen se lee del codigo, no se vio andar.

---

## Tabla comparativa

Escala: `fuerte` · `cumple` · `flojo` · `ausente` (se miro y no esta) · `sin evidencia` (no se pudo ver).

| Proyecto | Nicho | WebMCP Leverage | Execution | Potential Impact | Creativity | Nota | Amenaza |
|---|---|---|---|---|---|---:|---|
| `gmassello/sundae-metrics` (tuyo) | Tablero de ventas | flojo | cumple | flojo | cumple | 6/10 | — |
| `Elioz404/Alza` | Planos 2D a 3D | fuerte | cumple | flojo | fuerte | 8/10 | alta |

**Amenaza** es contra *tu* entrada: Alza es de otro nicho pero compite en los mismos cuatro criterios del jurado.

---

## `Elioz404/Alza` — Alza

<!-- ficha -->

**Que hace:** editor de planos donde una persona y su agente dibujan sobre el mismo modelo y lo suben a 3D.

| | |
|---|---|
| Repo | https://github.com/Elioz404/Alza · creado 2026-09-01 · TypeScript · MIT |
| Demo | https://alza-dev.pages.dev · `curl` 200 en 0.43s [1] |
| Devpost | `alza` · video si (YouTube embebido) [6] |
| Equipo | 1 contribuyente · 100% [4] |
| Historial | primer commit 2026-09-01 · 4 commits · previos al evento: no [2] |

| Criterio | Veredicto | Evidencia |
|---|---|---|
| WebMCP Leverage 25% | fuerte | herramientas que se retiran con `AbortSignal` (bootstrap.ts, registry.ts), puerta de aprobacion para las destructivas, pila de deshacer de 50 pasos [5] |
| Execution 25% | cumple | 30 tests en 2 archivos, `vitest` en `package.json`; demo 200 en 0.43s; sin CI (sin workflows, `runs` vacio) [1][3] |
| Potential Impact 25% | flojo | README sin comparacion sin/con herramientas (`baseline` 0 menciones); audiencia dicha en el pitch pero no medida [7] |
| Creativity 25% | fuerte | geometria en coordenadas que un agente no maneja como un raton; proveedor en otro origen que publica sus propias herramientas (`partner/`) [5] |
| Seguridad | cumple | `.env` commiteado pero solo con 2 URLs publicas, comentado como no secreto; sin credencial expuesta [8] |

**Lo mas fuerte:** el uso de WebMCP a fondo: herramientas dinamicas, aprobacion humana y deshacer en un mismo producto.
**Donde se cae:** sin CI, sin medicion de impacto, y un unico autor con 4 commits en 2 dias.
**Sin evidencia:** video sin mirar; funcionamiento real de las herramientas (nada se ejecuto).

---

## Donde queda tu proyecto

| Criterio | tu proyecto | `Elioz404/Alza` |
|---|---|---|
| Herramientas dinamicas (`unregist`/`AbortSignal`) | 0 menciones [5] | 3 y 1 en README, y en `src/mcp` [5] |
| Aprobacion humana antes de escribir | 0 (`approv\|propos`) [5] | puerta en `registry.ts` [5] |
| Deshacer | 1 nivel, `undo` en 5 archivos de `src` [5] | pila de 50 pasos [5] |
| Tests | 50 casos en 3 archivos [3] | 30 en 2 archivos [3] |
| Commits | 14 [4] | 4 [4] |
| Demo desplegado | 200 en 0.37s [1] | 200 en 0.43s [1] |
| CI (pruebas automaticas) | sin CI | sin CI |
| Antes/despues sin herramientas | `?webmcp=off` existe en el video; `baseline` en 1 archivo de `src` [7] | 0 menciones [7] |

### Sugerencias

| # | Sugerencia | Por que importa | Criterio (peso) | Origen | Evidencia | Esfuerzo | Mueve nota |
|---|---|---|---|---|---|---|---|
| S-01 | Poner una aprobacion humana antes de `set_dashboard_view` | El jurado premia que la persona confirme lo que el agente cambia | WebMCP Leverage (25%) | brecha | Alza tiene puerta, tuyo 0 menciones [5] | medio | si |
| S-02 | Registrar o retirar herramientas segun la pantalla (por ejemplo, solo mostrar la de deshacer despues de escribir) | Es la señal de WebMCP que hoy solo tiene Alza | WebMCP Leverage (25%) | brecha | Alza usa `AbortSignal`, tuyo 0 [5] | medio | si |
| S-03 | Publicar en el README la medicion sin/con herramientas (la toma `?webmcp=off`) con numeros | Impacto solo se cree si esta medido | Potential Impact (25%) | hueco | ni Alza ni tuyo la tienen en el README [7] | bajo | si |
| S-04 | Agregar un flujo de GitHub Actions que corra `npm test` | Ninguno de los dos tiene CI; el primero en mostrarlo se separa | Execution (25%) | hueco | sin `.github` en ambos [3] | bajo | si |
| S-05 | Sumar estrellas o topics al repo | Casi nadie lo pondera | — | — | Alza tiene 3 estrellas [1] | bajo | **cosmetico** |

> Control de sesgo: tu proyecto salio peor o igual en 5 de 8 filas, no mejor en todas. Las celdas `cumple` propias (tests, demo) se re-miraron con el mismo comando.

---

## Apendice — como se midio

<!-- ficha -->

| Ref | Comando |
|---|---|
| [1] | `curl -s -o /dev/null -w '%{http_code} %{time_total}s' <url del demo>` |
| [2] | `gh api "repos/<o>/<r>/commits?until=2026-08-25T19:00:00Z&per_page=1" --jq length` y `git log --reverse --format='%ad %s' --date=short \| head -3` |
| [3] | `grep -cE '\\b(it\|test)\\(' tests/*.test.ts` (Alza) y en `src/lib/*.test.ts` (propio); `ls .github` y `gh run list` |
| [4] | `git rev-list --count HEAD` y `gh api repos/<o>/<r>/contributors` |
| [5] | `grep -iE 'unregist\|AbortSignal\|approv\|undo' src/mcp/*.ts src/model/store.ts` y `grep -icE` sobre el README |
| [6] | `curl -sL -A curl/8 https://devpost.com/software/alza \| grep -oiE 'youtube[^"]{0,40}\|github.com/[A-Za-z0-9_/-]+'` |
| [7] | `grep -icE 'baseline\|without (webmcp\|the tools)' README.md` |
| [8] | `git ls-files \| grep -iE '\.env$'` y lectura del `.env` con los valores ocultos |
