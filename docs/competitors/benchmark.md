# Sundae Metrics contra los 10 ganadores de webmcp

Fecha: 2026-09-28 · fuente: https://webmcp.devpost.com/project-gallery

## Resumen

- Comparado contra: **los 10 ganadores** (WebMCP Challenge Winners) + Sundae
- Nicho: los 10 ganadores, elegidos a mano (la regex es `.`)
- Tu tarjeta: thumbnail **propio**, con video, con repo publico

## Tu ficha contra el nicho

| Señal | Vos | Mediana | p25 | p75 | Max | Percentil |
|---|---|---|---|---|---|---|
| Palabras en la descripcion | **1451** | 1171 | 904 | 1464 | 2579 | **70** |
| Screenshots | **2** | 9 | 6 | 14 | 34 | **10** |
| Tags "Built With" | **9** | 10 | 8 | 18 | 22 | **30** |
| Tiene video | si | 10/10 del nicho | — | — | — | — |
| Repo publico | si | 9/10 del nicho | — | — | — | — |

> 1 de 10 del nicho tampoco tienen thumbnail propio.

## Cobertura de features

Que decis que hace lo tuyo, contra cuantos del nicho dicen lo mismo. Un `no` donde el
nicho esta alto, y que ademas toque un criterio de juicio, es el hueco que importa.

| Criterio | Peso | Vos | Nicho |
|---|---|---|---|
| WebMCP Leverage: tools dinámicas | 25% | **no** | 40% |
| WebMCP Leverage: humano en el loop | 25% | **no** | 70% |
| WebMCP Leverage: errores accionables | 25% | **no** | 30% |
| WebMCP Leverage: estado compartido + undo | 25% | si | 50% |
| Execution: tests / E2E | 25% | si | 70% |
| Execution: demo en vivo | 25% | si | 80% |
| Potential Impact: audiencia real | 25% | **no** | 30% |
| Potential Impact: medición antes/después | 25% | si | 20% |
| Creativity: problema que solo WebMCP resuelve | 25% | si | 80% |

## Los mas directos (10 de 10)

Ordenados por peso de ficha: es el proxy de cuanto esfuerzo le pusieron a la entrega.

| Proyecto | Palabras | Img | Link |
|---|---:|---:|---|
| Mandate | 2579 | 4 | devpost.com/software/mandate-ix29ek |
| Alza | 2053 | 34 | devpost.com/software/alza |
| ArchMorph | 1464 | 12 | devpost.com/software/archmorph |
| **Sundae Metrics** | 1451 | 2 | devpost.com/software/sundae-metrics |
| MASIL — Reconnecting Korean Elders to Creativ… | 1312 | 10 | devpost.com/software/masil-reconnecting-korean-elders-to-creative-life |
| JupyterLite WebMCP | 1213 | 6 | devpost.com/software/jupyterlite-webmcp |
| Bouquet Studio | 1130 | 8 | devpost.com/software/bouquet-studio |
| Roque Nights | 1084 | 14 | devpost.com/software/roque-nights-plan-the-sky-with-your-agent |
| Aisle - AI Wedding Seating | 904 | 8 | devpost.com/software/aisle-ai-wedding-seating |
| Faraday | 692 | 16 | devpost.com/software/faraday-3n1zdh |
| Observatory | 496 | 0 | devpost.com/software/observatory-vtphg9 |

## Metodo

1. La galeria publicada da los 11 proyectos con su tagline y sus miembros,
   sin sesion y sin Chrome.
2. El nicho se define con una regex sobre nombre + tagline (`.…`).
   Es el ajuste que hay que revisar en cada hackathon: un nicho mal definido da
   percentiles que no significan nada.
3. Las señales salen de la pagina publica de cada proyecto del nicho.

> El peso de la ficha no es la calidad del proyecto. Mide lo que el jurado ve primero,
> que es otra cosa — y es la unica de las dos que se arregla en cinco minutos.

> Falta el contexto que decide si algo de esto es accionable: las etapas y los premios
> de `docs/HACKATHON.md`.
