# Shot list — the two takes, in the ChatGPT app

**Filmed Sep 1, 2026.** This document stands as the record of what was shot, and as the instructions
if it ever has to be shot again.

Before and after were filmed in the **same environment**, changing only `?webmcp=off`. Same model,
same question, same page: that is what makes the **4m 38s against 36 s** contrast honest.

App setup (language, *Enable site tools*, Work mode, browser environment) → `chatgpt-run.md`.

**Language comes first, and deleting the Spanish line is NOT enough.** *Settings → General →
Language* is already English. The Spanish comes from *Settings → Personalization → Custom
instructions*, which holds a pasted copy of the global instructions. Removing the literal line
`- Responder siempre en español` was tried and **it kept answering in Spanish**, because the rest of
that document is written in Spanish and the model mirrors it. What worked was **adding `- Always answer in
English.`**. When you are done, remove that line and put the old one back — it applies to every chat
on the machine.

Record with `Cmd+Shift+5` → window mode → the ChatGPT window → mic off. The window shows the chat on
the left and the built-in browser on the right; both halves have to fit in frame.

No rush: `fit-to-audio.py` compresses the dead waiting afterwards. Only the order matters, and
holding still on the money shots 🎯.

## Take A — "before" · `video/raw-before.mov`

Page: `https://sundae-metrics.vercel.app/?webmcp=off`, reloaded, scrolled to the top. The rail has to
read **No agent connected**.

| # | Action | Hold | Beat |
|---|---|---|---|
| 1 | Start recording with the whole dashboard in frame | 4 s 🎯 | `0:00` |
| 2 | Scroll to the chart: the 12 bars with their values | 4 s | `0:00` |
| 3 | Back to the top, the rail's **No agent connected** legible | 4 s 🎯 | `0:20` |
| 4 | Paste **question 1** → send | — | `0:20` |
| 5 | Let it work, touching nothing — about 4 min 40 | 5 s | `0:20` |
| 6 | The answer, with **Worked for 4m 38s** legible above it | 6 s 🎯 | `0:55` |

**Step 6 is the whole take.** The `Worked for 4m 38s` header is the left half of the contrast; if it
does not read on camera, the take is useless, and it has to land in the same frame as pistachio's 554
units. About three minutes in, the agent asks permission to **download the page's JavaScript data
file**: answer **Deny**. Downloading `sales.json` is skipping the screen, which is exactly what the
video says it cannot do.

## Take B — "after" · `video/raw-after.mov`

Page: `https://sundae-metrics.vercel.app` (no parameter), **reloaded** so the rail starts at `No calls
yet`. The green `WebMCP · 6 tools` pill visible.

| # | Action | Hold | Beat |
|---|---|---|---|
| 1 | Start recording with the `WebMCP · 6 tools` pill and the empty rail | 4 s 🎯 | `1:10` |
| 2 | Paste **question 0** → send; the list of the 6 tools comes back | 5 s 🎯 | `1:10` |
| 3 | Paste **question 1** → send | — | `1:40` |
| 4 | The rail filling up: 5 entries and **Worked for 36s** | 6 s 🎯 | `1:40` |
| 5 | Click a rail entry to open its JSON | 4 s 🎯 | `2:10` |
| 6 | The answer: 554 against 2,099 (December) | 5 s 🎯 | `2:10` |
| 7 | Scroll to the chart: January, the tallest bar of the year | 4 s 🎯 | `2:30` |
| 8 | Paste **question 2** → send | — | `2:50` |
| 9 | Amber toast + `WRITE` entry + **Undo** chip | 5 s 🎯 | `2:50` |

Question 0 **leaves no entries in the rail** — listing the tools does not execute them, verified.
That is why the rail holds exactly 5 entries when the voice says "Five calls. Thirty-six seconds.".
If others show up, the narration contradicts the screen: reload and redo the take.

### Step 7, in detail

Go back to the **dashboard**, not the chat. Scroll until the **Monthly revenue** card fits whole,
with the 12 bars and the `Sep … Aug` axis:

```
Dec 46,200   Jan 50,800   Feb 48,124
             ^ the tallest of the twelve
```

This is beat `2:30`. The viewer has just heard that pistachio collapsed in January, and sees that
January was the best month of the year. That collision is the entire video.

- **Do not touch the month selector.** With the `Sep 2025 → Aug 2026` range all 12 bars are indigo
  and every one shows its number. Narrow the range and the ones outside it go grey and lose their
  value.
- **Do not click the bars**: they have no tooltip.
- It goes **before** step 8 on purpose: question 2 switches the dashboard to South and the chart
  redraws.

## To copy

Question 0 (take B only):

```
List the site tools this page exposes.
```

Question 1 (both takes, word for word identical):

```
For the North store, what happened to sales in January 2026? Compare the flavor breakdown against December and tell me if anything looks off.
```

Question 2 (take B only):

```
Switch the dashboard to the South store.
```

## What can come out differently

The agent is not deterministic. All five runs produced the same figures — 15,826 units, US$ 50,800,
pistachio 554 against 2,099 — but worded the conclusion differently every time ("an anomaly specific
to pistachio", "a sharp discontinuity", and — in Spanish, from a run before the language fix — "a
stock-out or an anomalous figure"), and twice went for the wrong flavor entirely under the old
wording of question 1. **Film what it says and rewrite that line of the
narration**, rather than re-asking until the pretty phrase comes out.

The two numbers that do have to appear on camera are the times. **That contingency already fired:**
the filmed run gave **4m 38s** and **36 s**, so the two narration lines (`0:55` and `1:40`) were
rewritten and the audio rebuilt to **2:32.3**. If a reshoot gives different ones, same procedure.

## Between takes

Reload the page: the state lives in memory, so reloading is the reset. **The delivered `.mov` files
are `raw-before.mov` (6:27) and `raw-after.mov` (3:23)** — do not overwrite them unless you are
deliberately reshooting. After editing the narration you have to redo the fit as well, not just
`build-video.sh` — `build-audio.sh` wipes `video/out/` entirely.
