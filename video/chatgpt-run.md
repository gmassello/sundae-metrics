# ChatGPT run — setup and prompts

Everything needed to reproduce the agent side of the demo in the ChatGPT desktop app's built-in
browser. English only: the app must answer in English, because the answers are on camera.
**Executed Aug 31, filmed Sep 1** — the results are recorded inline below.

## The app

`/Applications/ChatGPT.app` — bundle id `com.openai.codex`, version 26.825.51511. Note that
`/Applications/Codex.app` shares that bundle id and is an older build (26.506.31421); open the
first one.

## Setup — four things, all of them blocking

1. **Answers in English — and deleting the Spanish line does not work.** Settings → General →
   *Language* is already English; that is not the knob. The Spanish comes from Settings →
   **Personalization → Custom instructions**. Removing the literal line
   `- Responder siempre en español` from there was tried and the app **still answered in Spanish**, because the rest of that document is written in
   Spanish and the model mirrors it. What worked was **adding an explicit `- Always answer in
   English.` line**. Remove it and restore the original after the shoot; it applies to every chat on
   this machine.
2. **Enable site tools.** Settings → the **built-in browser** pane (its subtitle reads "Manage the
   built-in browser…") → *Permissions* → **Enable site tools**. It is *not* in *General*; the
   ChatGPT docs call the same pane "Browser". Its description reads "Allow ChatGPT to discover and call site tools exposed by
   websites, including WebMCP".
3. **Work mode.** On the home screen the composer has a **Chat ↔ Work** toggle. The built-in browser
   only exists on the **Work** side — asked from Chat, the model answers that it cannot open a
   browser. If a splash says "You don't have access to Work yet", the workspace gates it and this
   whole path is unavailable.
4. **Browser environment.** In Work, the environment selector must not sit on *No Environment* —
   pick the built-in browser.

Model: `gpt-5.6-terra` (Sol also works; Luna has WebMCP disabled).

## Run A — with the tools (executed Aug 31, filmed Sep 1)

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

**Result: 5 tool calls, 36 s** — `get_sales` for January and December, `get_top_flavors` for both,
and `compare_periods`. That is what beat `1:40` of the narration says. The page's own rail counts
them too, until the page is reloaded.

### A5 — the write tool

> Switch the dashboard to the South store.

Expected: the screen changes on its own, an amber toast appears, and a `WRITE`-marked entry lands in
the rail with an `Undo` on it.

## Run B — without the tools (Gate 2, passed Aug 31)

Page: **https://sundae-metrics.vercel.app/?webmcp=off** in the built-in browser — same page, tools
not registered, rail shows "No agent connected".

> How much did North's sales change between February and March 2026?

What mattered was not the answer but the cost. **It reached the number**, so both takes were filmed
in this same environment, changing only `?webmcp=off`.

**The filmed "before" used question A3, not this one** — the before/after pair has to ask the
identical January question for the contrast to mean anything. Gate 2 used Feb/March only to prove the
agent could get anywhere at all without the tools.

## What came back

- **A1:** all six names, no omissions.
- **A2:** −17.1% revenue, −15.4% units — the §4 figures to the decimal.
- **A3:** the anomaly, worded differently on every run. What got filmed: *"pistachio collapsed from
  2,099 to 554 units (−74%) and fell from third-best seller to last … that sharp pistachio drop looks
  off … because it runs directly against the otherwise broad January increase."*
- **A4:** 5 tool calls, 36 s.
- **B:** it reached the number, in **4 min 38 s**, after asking permission (denied on camera) to
  download the page's JavaScript data file rather than keep reading the interface.
