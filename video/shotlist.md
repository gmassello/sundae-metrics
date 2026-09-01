# Shot list — las dos tomas en la app de ChatGPT

Before y after se filman en el **mismo entorno**, cambiando sólo `?webmcp=off`. Mismo modelo, misma
pregunta, misma página: eso es lo que hace honesto el contraste de 2:31 contra 8,5 s.

Setup de la app (idioma, *Enable site tools*, modo Work, entorno de navegador) → `chatgpt-run.md`.

**El idioma es lo primero, y no se arregla donde parece.** *Settings → General → Language* ya está en
English; el español sale de *Settings → Personalization → Custom instructions*, que tiene pegadas las
instrucciones globales con "Responder siempre en español" como primera línea. Cambiar esa línea antes
de filmar y **devolverla al terminar** — aplica a todos los chats de la máquina.

Grabar con `Cmd+Shift+5` → modo ventana → la ventana de ChatGPT → mic apagado. La ventana muestra el
chat a la izquierda y el navegador integrado a la derecha; las dos mitades tienen que entrar.

Sin apurarse: `fit-to-audio.py` comprime después la espera muerta. Sólo importan el orden y quedarse
quieto en los money shots 🎯.

## Toma A — "before" · `video/raw-before.mov`

Página: `https://sundae-metrics.vercel.app/?webmcp=off`, recargada, scroll arriba de todo. El rail
tiene que decir **No agent connected**.

| # | Acción | Quieto | Beat |
|---|---|---|---|
| 1 | Empezar a grabar con el dashboard completo en cuadro | 4 s 🎯 | `0:00` |
| 2 | Scroll al gráfico: las 12 barras con su valor | 4 s | `0:00` |
| 3 | Volver arriba, el rail con **No agent connected** legible | 4 s 🎯 | `0:20` |
| 4 | Pegar la **pregunta 1** → enviar | — | `0:20` |
| 5 | Dejarlo trabajar sin tocar nada — son ~2 min 30 | 5 s | `0:20` |
| 6 | La respuesta, con **Worked for 2m 31s** legible arriba | 6 s 🎯 | `0:55` |

**El paso 6 es la toma entera.** El encabezado `Worked for 2m 31s` es la mitad izquierda del
contraste; si no se lee en cámara, la toma no sirve. Tiene que quedar en el mismo cuadro que las
554 unidades de pistachio.

## Toma B — "after" · `video/raw-after.mov`

Página: `https://sundae-metrics.vercel.app` (sin el parámetro), **recargada** para que el rail
arranque en `No calls yet`. Pill verde `WebMCP · 6 tools` visible.

| # | Acción | Quieto | Beat |
|---|---|---|---|
| 1 | Empezar a grabar con la pill `WebMCP · 6 tools` y el rail vacío | 4 s 🎯 | `1:10` |
| 2 | Pegar la **pregunta 0** → enviar; queda la lista de las 6 tools | 5 s 🎯 | `1:10` |
| 3 | Pegar la **pregunta 1** → enviar | — | `1:40` |
| 4 | El rail llenándose: 3 entradas y **Worked for ~9s** | 6 s 🎯 | `1:40` |
| 5 | Click en una entrada del rail para abrir su JSON | 4 s 🎯 | `2:10` |
| 6 | La respuesta: 554 contra 2.099 y 2.139 | 5 s 🎯 | `2:10` |
| 7 | Scroll al gráfico: enero, la barra más alta del año | 4 s 🎯 | `2:30` |
| 8 | Pegar la **pregunta 2** → enviar | — | `2:50` |
| 9 | Toast ámbar + entrada `WRITE` + chip **Undo** | 5 s 🎯 | `2:50` |

La pregunta 0 **no deja entradas en el rail** — listar las tools no las ejecuta, verificado. Por eso
el rail queda con exactamente 3 entradas cuando la voz dice "Three calls. Eight seconds.". Si
aparecen más, la narración se contradice con la pantalla: recargar y rehacer la toma.

### El paso 7, en detalle

Vuelve al **dashboard**, no al chat. Scroll hasta que la card **Monthly revenue** entre completa,
con las 12 barras y el eje `Sep … Aug`:

```
Dec 46,200   Jan 50,800   Feb 48,124
             ^ la más alta de las doce
```

Es el beat `2:30`. El espectador acaba de escuchar que pistachio se derrumbó en enero y ve que enero
fue el mejor mes del año. Ese choque es el video entero.

- **No tocar el selector de meses.** Con el rango `Sep 2025 → Aug 2026` las 12 barras están en
  indigo y todas muestran su número. Si se acota el rango, las de afuera quedan grises y sin valor.
- **No clickear las barras**: no tienen tooltip.
- Va **antes** del paso 8 a propósito: la pregunta 2 cambia el dashboard a South y el gráfico se
  redibuja.

## Para copiar

Pregunta 0 (sólo toma B):

```
List the site tools this page exposes.
```

Pregunta 1 (las dos tomas, palabra por palabra la misma):

```
For the North store, what happened to sales in January 2026? Compare the flavor breakdown against December and tell me if anything looks off.
```

Pregunta 2 (sólo toma B):

```
Switch the dashboard to the South store.
```

## Lo que puede salir distinto

El agente no es determinista. Las tres corridas de verificación dieron los mismos números —
15.826 unidades, US$ 50.800, pistachio 554 contra 2.099 y 2.139 — pero redactaron la conclusión
distinto cada vez ("an anomaly specific to pistachio", "a sharp discontinuity", "un faltante de
inventario"). **Filmar lo que diga y reescribir esa línea de la narración**, no re-preguntar hasta
que salga la frase linda.

Los dos números que sí tienen que salir en cámara son los tiempos: **2m 31s** sin tools y **~9 s**
con tools. Si esta corrida da otros, se corrigen las dos líneas de la narración (`0:55` y `1:40`) y
se rearma el audio.

## Entre tomas

Recargar la página: el estado vive en memoria, así que recargar es el reset. Borrar el `.mov` viejo
antes de regrabar encima. Después de editar la narración hay que rehacer también el fit, no sólo
`build-video.sh` — `build-audio.sh` borra `video/out/` entero.
