# Competidores — WebMCP Challenge

| | |
|---|---|
| Fecha | 2026-09-28 |
| Modo | hackathon |
| Evaluados | 1 (`ergjus/aisle`) + proyecto propio · clonados 1 (borrado) · **nada se ejecuto** |
| Ventana | submissions 2026-08-25 → 2026-09-04 [1] |

## En criollo

- **Que se miro:** un solo rival, `ergjus/aisle`, contra tu `gmassello/sundae-metrics`, con las mismas sondas.
- **Quien es la amenaza:** Aisle. Es un plano de mesas de boda donde el agente mueve invitados a la vista, con más de 30 herramientas y 107 pruebas [7].
- **Como estamos:** Aisle gana en 3 de 4 criterios. Vos ganás en medir antes/después: 4 min 38 s contra 36 s en tu README [8].
- **Que conviene hacer:** sumar herramientas que aparecen según el estado, y pedirle permiso al humano antes de escribir.

**Pesos del jurado** (`docs/judging.tsv`, reglas del evento): 4 pilares de 25% cada uno.

| Criterio | Peso | Secciones que lo responden |
|---|---:|---|
| WebMCP Leverage (tools dinámicas, humano en el loop, errores, estado compartido) | 25% | 2, 4, 7 |
| Execution (tests, demo en vivo) | 25% | 6, 8, 10 |
| Potential Impact (audiencia real, antes/después) | 25% | 1, 6 |
| Creativity (problema que solo WebMCP resuelve) | 25% | 7 |

Sin peso en el evento (va en la ficha, no en la tabla): CI (pruebas automáticas en la nube), seguridad, equipo.

**Lo que no se pudo ver:**

- El video de Aisle no se miró: no se sabe si muestra el producto o slides.
- No se probó ninguna herramienta contra un agente real: se leyó el código, no se ejecutó.
- Otros inscriptos no entraron al set: quien trabaja en privado es invisible, no débil.

---

## Tabla comparativa

Escala: `fuerte` · `cumple` · `flojo` · `ausente` (se miro y no esta) · `sin evidencia` (no se pudo ver).

| Proyecto | Nicho | WebMCP Leverage 25% | Execution 25% | Impact 25% | Creativity 25% | Nota | Amenaza |
|---|---|---|---|---|---|---:|---|
| `ergjus/aisle` | Plano de mesas de boda | fuerte | fuerte | cumple | fuerte | 8/10 | alta |
| `gmassello/sundae-metrics` (propio) | Dashboard de ventas | cumple | cumple | fuerte | cumple | 7/10 | — |

**Amenaza** es contra *tu* entrada: Aisle compite por el mismo jurado y el mismo pilar más pesado, aunque el nicho sea otro.

---

## `ergjus/aisle` — Aisle

<!-- ficha -->

**Que hace:** una pareja y su agente arman juntos el plano de mesas de la boda, con un cursor que mueve a los invitados a la vista.

| | |
|---|---|
| Repo | https://github.com/ergjus/aisle · creado 2026-08-28 · TypeScript · MIT [2] |
| Demo | https://aisle-three.vercel.app · `curl` 200 en 0.26s [3] |
| Devpost | `aisle-ai-wedding-seating` · video si (youtu.be/81zaJ8tASLo, no visto) [4] |
| Equipo | 1 contribuyente (`ergjus`, 19 commits) · reparto 100% [5] |
| Historial | primer commit 2026-08-27 · 19 commits · previos a la apertura (2026-08-25): no [1] |

| Criterio | Veredicto | Evidencia |
|---|---|---|
| Leverage: tools dinámicas 25% | fuerte | `finalize_chart` existe solo con todos sentados y 0 reglas rotas; adaptador con `AbortSignal` (7 coincidencias en el README [8]) [6] |
| Leverage: humano en el loop | fuerte | `ask_human` espera hasta ~90 s la respuesta; `propose_arrangement` con banner Keep/Revert [6] |
| Leverage: errores accionables | cumple | 7 usos de `isError`; "una mesa llena falla con la lista de mesas libres" [6] |
| Leverage: estado compartido + undo | fuerte | `undo`/`redo` sobre el mismo historial del ⌘Z humano [6] |
| Execution: tests | fuerte | 107 tests, 287 `expect`, 15 archivos [7] |
| Execution: demo en vivo | fuerte | 200 en 0.26s, título propio [3] |
| Impact: audiencia real | cumple | parejas planeando una boda; 1 mención de "for users" [8] |
| Impact: antes/después | ausente | 0 coincidencias de baseline o "without WebMCP" en el README [8] |
| Creativity | fuerte | canvas + cursor del agente, sin backend [8] |
| Sin CI (nadie corre sus pruebas solo) | ausente (sin CI) | 0 workflows, `gh run list` vacío [9] |
| Seguridad | cumple | 0 `.env` en historial, 0 patrones de clave [10] |

**Lo mas fuerte:** más de 30 herramientas y las dos señales de Leverage que vos no tenés (dinámicas y espera al humano).
**Donde se cae:** ninguna medición antes/después (0 coincidencias [8]) y un solo autor.
**Sin evidencia:** si el video muestra el producto; si `ask_human` funciona en ChatGPT real.

---

## Donde queda tu proyecto

| Criterio | tu proyecto | `ergjus/aisle` |
|---|---|---|
| Tools dinámicas (unregister, AbortSignal) | 0 [8] | 7 [8] |
| Humano en el loop | 0 [8] | 8 [8] |
| Antes/después medido | 3 (4 min 38 s vs 36 s) [8] | 0 [8] |
| Tests (`it(`/`test(`) | 50 [7] | 107 [7] |
| Commits | 14 [1] | 19 [1] |
| Endpoint desplegado | 200 en 0.65s [3] | 200 en 0.26s [3] |
| Herramientas | 6 [6] | más de 30 [6] |

### Sugerencias

| # | Sugerencia | Por que importa | Criterio (peso) | Origen | Evidencia | Esfuerzo | Mueve nota |
|---|---|---|---|---|---|---|---|
| S-01 | Una herramienta que aparezca o desaparezca según el estado (ej. exportar solo con vista cargada) | El jurado busca herramientas que cambian con el contexto | Leverage (25%) | brecha | Aisle 7 coincidencias, vos 0 [8] | medio | si |
| S-02 | Que `set_dashboard_view` proponga y espere un OK del humano | Hoy el agente cambia la pantalla sin preguntar | Leverage (25%) | brecha | Aisle 8, vos 0 [8] | medio | si |
| S-03 | Sumar una prueba de punta a punta (Playwright) además de las 50 unitarias | Aisle duplica tus pruebas y tiene tests de componentes | Execution (25%) | brecha | 107 vs 50 [7] | medio | si |
| S-04 | Subir a la primera línea de Devpost el 4 min 38 s vs 36 s | Es el único dato de impacto medido del set | Impact (25%) | hueco | Aisle 0 vs vos 3 [8] | bajo | si |
| S-05 | Más estrellas o topics en el repo | Ningún criterio del jurado lo mide | — | — | — | bajo | **cosmetico** |

> Control de sesgo: en el criterio de impacto salgo mejor, en los otros tres peor. No salió parejo a favor: la ventaja de 1 de 4 es medida, no cómoda. Ojo: la nota de Leverage propia es `cumple` por 6 herramientas y errores como texto (README y CLAUDE.md), sin ejecutar nada.

---

## Apendice — como se midio

<!-- ficha -->

| Ref | Comando |
|---|---|
| [1] | `gh api "repos/ergjus/aisle/commits?until=2026-08-25T15:00:00Z&per_page=1" --jq length` (devolvió 0); `git log --reverse --format='%ad %s' --date=short \| head -3`; `git rev-list --count HEAD`; fechas de `webmcp.devpost.com/details/dates` |
| [2] | `jq '{fork,stars:.stargazers_count,created:.created_at,pushed:.pushed_at,lang:.language,license:.license.spdx_id,homepage,archived}' aisle.json` (fork false) |
| [3] | `curl -s -o /dev/null -w '%{http_code} %{time_total}s' https://aisle-three.vercel.app` y `https://sundae-metrics.vercel.app` |
| [4] | `curl -s -A 'curl/8' https://devpost.com/software/aisle-ai-wedding-seating` (el slug `aisle` es otro proyecto, NoelVFX/Aisle) |
| [5] | `gh api repos/ergjus/aisle/contributors --jq '.[] \| "\(.login) \(.contributions)"'` y `git shortlog -sn` |
| [6] | `grep -n` sobre `src/webmcp/adapter.ts` y `tools.ts` del clone (registerTool, AbortSignal, `finalize_chart`, `ask_human`, `isError`) y tabla de herramientas del README |
| [7] | `grep -rEc "^\s*(it\|test)\(" src --include='*.test.ts*'` y `grep -rc "expect("` en cada repo |
| [8] | `grep -icE` de las 9 regex de `docs/judging.tsv` contra `<repo>.readme` |
| [9] | `grep -E '^\.github/workflows/' aisle.tree` y `gh run list --repo ergjus/aisle --limit 10` |
| [10] | `git log --all --diff-filter=A --name-only --format= \| grep -iE '\.env$\|\.pem$'` y `grep -rEl` de patrones de clave |
