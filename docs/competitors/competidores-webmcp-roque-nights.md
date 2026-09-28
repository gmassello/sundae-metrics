# Competidores — webmcp (WebMCP Challenge)

| | |
|---|---|
| Fecha | 2026-09-28 |
| Modo | hackathon |
| Evaluados | 1 · clonados 1 (borrado) · **nada se ejecuto** |
| Ventana | submissions 2026-08-25 → 2026-09-04 (fuente: `webmcp.devpost.com/details/dates` [1]) |

## En criollo

- **Que se miro:** `sebastianfernandezgarcia/roque-nights`, un planificador de noches de observacion astronomica, contra `gmassello/sundae-metrics`.
- **Quien es la amenaza:** Roque Nights, y es alta. Tiene 15 herramientas (nosotros 6), 807 pruebas automaticas (nosotros 50) y un demo en linea que responde.
- **Como estamos:** detras en casi todo lo que el jurado pesa; adelante solo en que tenemos video publicado y ellos no lo confirmamos.
- **Que conviene hacer:** sumar lo que ellos tienen y nosotros no: herramientas que aparecen y desaparecen, aprobacion humana de lo que propone el agente, y una medicion con y sin WebMCP.

**Pesos del jurado** (de `docs/judging.tsv`, reglas §7, cuatro criterios de igual peso):

| Criterio | Peso | Señales que lo responden |
|---|---:|---|
| WebMCP Leverage | 25% | herramientas dinamicas, humano en el loop, errores accionables, estado compartido + undo |
| Execution | 25% | pruebas / E2E, demo en vivo |
| Potential Impact | 25% | audiencia real, medicion antes/despues |
| Creativity | 25% | problema que solo WebMCP resuelve |

**Lo que no se pudo ver:**

- La pagina de Devpost del competidor: `devpost.com/software/roque-nights` da 404 y no hay otro enlace en su repo [2].
- El video: su `docs/devpost.md` dice "YouTube URL, to add" [3]; hay guion y subtitulos, no un video confirmado.
- Ninguna prueba se ejecuto: `807` cuenta declaraciones de test, no que pasen.

---

## Tabla comparativa

Escala: `fuerte` · `cumple` · `flojo` · `ausente` (se miro y no esta) · `sin evidencia` (no se pudo ver).

| Proyecto | Nicho | WebMCP Leverage 25% | Execution 25% | Impact 25% | Creativity 25% | Nota | Amenaza |
|---|---|---|---|---|---|---:|---|
| `sebastianfernandezgarcia/roque-nights` | planificador de noche de estrellas | fuerte | fuerte | cumple | fuerte | 9/10 | alta |
| `gmassello/sundae-metrics` (propio) | panel de ventas de helados | cumple | cumple | flojo | cumple | 6/10 | — |

**Amenaza** es contra *tu* entrada: aca comparten idea (pagina cliente sin servidor) y el rival la lleva mas lejos.

---

## `sebastianfernandezgarcia/roque-nights` — Roque Nights

<!-- ficha -->

**Que hace:** un mapa del cielo donde la persona y el agente manejan el mismo instrumento y el agente propone un plan que la persona acepta o rechaza.

| | |
|---|---|
| Repo | https://github.com/sebastianfernandezgarcia/roque-nights · creado 2026-09-02 · TypeScript · MIT [4] |
| Demo | https://roque-nights.netlify.app · `curl` 200 en 0.82s [5] |
| Devpost | sin evidencia (404) · video sin evidencia [2] |
| Equipo | 1 contribuyente · 17 commits, 100% de una persona [6] |
| Historial | primer commit 2026-08-31 · 17 commits · previos al evento: no (0 antes del 2026-08-25) [7] |

| Criterio | Veredicto | Evidencia |
|---|---|---|
| WebMCP Leverage 25% | fuerte | 15 herramientas; 4 se registran y se sacan segun el estado; `AbortSignal` en 4 archivos; plan propuesto que el humano acepta item por item; deshacer con token; errores con razon [8] |
| Execution 25% | fuerte | 50 archivos de test, 807 declaraciones `it`/`test`; demo 200 en 0.82s; sin CI (sin workflows, no es "roto") [9] |
| Impact 25% | cumple | audiencia real declarada (autor trabaja en un telescopio en La Palma) [3]; 0 menciones de medicion antes/despues en el README [8] |
| Creativity 25% | fuerte | "no hay API; un MCP clasico no tiene nada que envolver"; formulario declarativo ademas de herramientas [8] |
| Calidad de codigo | cumple | ~55.000 lineas sin json/imagenes [10]; oxlint presente; sin vendorizados versionados |
| Seguridad | cumple | sin `.env` ni `.pem` en el arbol ni en el historial [11] |

**Lo mas fuerte:** WebMCP usado a fondo: 15 herramientas, 4 contextuales y aprobacion humana.
**Donde se cae:** sin medicion con/sin WebMCP (0 coincidencias) y sin CI.
**Sin evidencia:** Devpost, video, y si las 807 pruebas pasan.

---

## Donde queda tu proyecto

| Criterio | tu proyecto | `roque-nights` |
|---|---|---|
| Herramientas WebMCP | 6, todas fijas | 15, 4 contextuales |
| Registro dinamico (`unregister`/`AbortSignal`) | ausente: 0 archivos [12] | 4 archivos [8] |
| Humano aprueba lo que propone el agente | ausente: 0 coincidencias en `src` [12] | `propose_plan` + `commit_proposal` |
| Undo | si: `undoView`, un nivel [12] | token de undo en `clear_plan` |
| Tests | 3 archivos, 50 declaraciones | 50 archivos, 807 |
| Medicion con/sin WebMCP | flojo: 3 menciones en README, sin cifras propias [12] | 0 menciones |
| Commits | 14, desde 2026-08-27 | 17, desde 2026-08-31 |
| Demo desplegado | 200 en 0.38s [12] | 200 en 0.82s |
| Video | publicado en YouTube (link en README) [12] | sin evidencia |

### Sugerencias

| # | Sugerencia | Por que importa | Criterio (peso) | Origen | Evidencia | Esfuerzo | Mueve nota |
|---|---|---|---|---|---|---|---|
| S-01 | Herramienta que propone y un boton de aceptar/rechazar antes de escribir | El jurado mira si la persona controla al agente | WebMCP Leverage (25%) | brecha | `roque-nights` tiene `propose_plan`/`commit_proposal`; nosotros 0 [8][12] | medio | si |
| S-02 | Registrar/sacar herramientas segun el estado (ej. `undo` solo tras una escritura) | Muestra uso real de la API de WebMCP | WebMCP Leverage (25%) | brecha | 4 archivos con `AbortSignal`/`unregister` contra 0 [8][12] | medio | si |
| S-03 | Publicar una medicion con y sin WebMCP con cifras (tiempo, aciertos) | Es la unica señal de impacto que ninguno mide | Impact (25%) | hueco | 0 menciones en `roque-nights`; nosotros solo texto sin cifras [8][12] | medio | si |
| S-04 | Subir la suite de tests y agregar un E2E | Compite contra 807 declaraciones | Execution (25%) | brecha | 50 contra 807 [9] | alto | si |
| S-05 | Agregar un workflow de CI que corra `npm test` | Ninguno del set tiene CI | Execution (25%) | hueco | 0 workflows en ambos [9][12] | bajo | si |
| S-06 | Estrellas, topics, tamaño del README | Ningun criterio del jurado lo pondera | — | — | 0 estrellas en el rival [4] | bajo | **cosmetico** |

> Control de sesgo: tu proyecto se evaluo con las mismas sondas y salio peor o igual en todos los criterios menos el video. Las celdas mas comodas (demo y video) se volvieron a mirar: el demo del rival responde, el video del rival no se pudo ver, no que no exista.

---

## Apendice — como se midio

<!-- ficha -->

| Ref | Comando |
|---|---|
| [1] | `curl -s https://webmcp.devpost.com/details/dates \| sed 's/<[^>]*>//g' \| grep -iE '20(26\|25)'` |
| [2] | `curl -s -o /dev/null -w '%{http_code}' https://devpost.com/software/roque-nights` |
| [3] | `grep -niE 'youtu\|devpost\.com/software\|video' README.md docs/devpost.md` |
| [4] | `jq '{fork,stars:.stargazers_count,created:.created_at,lang:.language,license:.license.spdx_id,homepage,archived}' roque-nights.json` |
| [5] | `curl -s -o /dev/null -w '%{http_code} %{time_total}s' https://roque-nights.netlify.app` |
| [6] | `gh api repos/sebastianfernandezgarcia/roque-nights/contributors --jq '.[] \| "\(.login) \(.contributions)"'` |
| [7] | `gh api "repos/…/roque-nights/commits?until=2026-08-25T00:00:00Z&per_page=1" --jq 'length'` y `git log --reverse --format='%ad %s' --date=short \| head -3` |
| [8] | `grep -icE '<regex de docs/judging.tsv>' roque-nights.readme` (una por señal) |
| [9] | `grep -cE '\.test\.' roque-nights.tree`; `grep -rhoE '\b(it\|test)\(' src --include='*.test.ts' \| wc -l`; `grep -cE '^\.github' roque-nights.tree`; `roque-nights.runs` = `[]` |
| [10] | `git ls-files \| grep -vE 'node_modules/\|dist/\|screenshots/\|package-lock\|\.json$\|\.png$\|\.srt$' \| xargs wc -l \| tail -1` |
| [11] | `grep -iE '(^\|/)\.env$\|\.pem$' roque-nights.tree`; `git log --all --diff-filter=A --name-only --format= \| grep -iE '\.env$\|\.pem$'` (0 salidas) |
| [12] | en el repo propio: `grep -rilE 'unregist\|AbortSignal' src`; `grep -rlE 'undoView' src`; `grep -rliE 'propos\|approv' src`; `git ls-files \| grep -cE '\.test\.'`; `curl` al demo; `ls .github` |
