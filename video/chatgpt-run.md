# ChatGPT run — setup and prompts

Everything needed to reproduce the agent side of the demo in the ChatGPT desktop app's built-in
browser. English only: the app must answer in English, because the answers are on camera.

## The app

`/Applications/ChatGPT.app` — bundle id `com.openai.codex`, version 26.825.51511. Note that
`/Applications/Codex.app` shares that bundle id and is an older build (26.506.31421); open the
first one.

## Setup — four things, all of them blocking

1. **Answers in English.** Settings → General → *Language* is already English — that is not the
   knob. The Spanish comes from Settings → **Personalization → Custom instructions**, whose first
   line reads "Responder siempre en español". Change that line for the shoot and restore it after;
   it applies to every chat on this machine.
2. **Enable site tools.** Settings → the **built-in browser** pane (the one whose subtitle reads
   "Manage the built-in browser…"), section *Permissions* → **Enable site tools**. It is *not* in
   *General*. Its description reads "Allow ChatGPT to discover and call site tools exposed by
   websites, including WebMCP".
3. **Work mode.** On the home screen the composer has a **Chat ↔ Work** toggle. The built-in browser
   only exists on the **Work** side — asked from Chat, the model answers that it cannot open a
   browser. If a splash says "You don't have access to Work yet", the workspace gates it and this
   whole path is unavailable.
4. **Browser environment.** In Work, the environment selector must not sit on *No Environment* —
   pick the built-in browser.

Model: `gpt-5.6-terra` (Sol also works; Luna has WebMCP disabled).

## Run A — with the tools

Page: **https://sundae-metrics.vercel.app**

### A1 — tools are visible

> Open https://sundae-metrics.vercel.app in the built-in browser and list the site tools the page
> exposes.

Expected: `list_stores`, `get_sales`, `compare_periods`, `get_top_flavors`, `get_summary`,
`set_dashboard_view` — all six.

### A2 — the exact number

> How much did North's sales change between February and March 2026?

Expected: **−17.1%** revenue, **−15.4%** units. These are the figures the dashboard prints, so they
must match to the decimal.

### A3 — the finding (this is the one that gets filmed)

> For the North store, what happened to sales in January 2026? Compare the flavor breakdown against December and tell me if anything looks off.

Expected: January is a strong month (15,826 units, $50,800) **and** pistachio collapses to **554
units** against 2,099 in December and 2,139 in February — roughly −74%. The point of the shot is
that the monthly total is a record, so the bar on the chart does not move: nothing on screen shows
the drop.

Capture verbatim what it calls the anomaly. It is not required to name a supply shortage — the last
run said "an anomaly specific to pistachio in January" after checking that the flavor totals
reconcile with the monthly total, and the narration follows whatever it actually says.

### A4 — call count and duration

> How many tool calls did that take, and roughly how long?

This replaces the narration's "About 20 calls in 2 seconds", which was measured on a different
agent. The page's own rail also counts them, until the page is reloaded.

### A5 — the write tool

> Switch the dashboard to the South store.

Expected: the screen changes on its own, an amber toast appears, and a `WRITE`-marked entry lands in
the rail with an `Undo` on it.

## Run B — without the tools (Gate 2)

open: **https://sundae-metrics.vercel.app/?webmcp=off**  in the built-in browser— same page, tools not registered, rail
shows "No agent connected".

> How much did North's sales change between February and March 2026?

What matters is not the answer but the cost: how many steps it takes, and whether it trips on the
month picker (typing a month passes through invalid values and the card reads "No data for this
range"). If it can still get there, the before and after get filmed in this same environment,
changing only `?webmcp=off`. If it gives up, the before stays in Chrome with a browser-driving
agent.

## What to bring back

- A1: the six names — or which ones are missing.
- A2: the two percentages.
- A3: its wording for the anomaly, verbatim.
- A4: number of calls and elapsed time.
- B: number of steps, and whether it reached the number at all.
