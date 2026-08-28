# Sundae Metrics — UI spec for the Claude Code build

Companion to `docs/BRIEF.md` and `docs/PLAN.md`. Mockups: `Sundae Metrics Mockups.dc.html` (option ids `1a`–`1g`).

Styling decision: **light neutral dashboard**, Tailwind, no design-system dependency. UI copy in English.

---

## 1. Design tokens (map straight to Tailwind)

| Role | Value | Tailwind |
|---|---|---|
| Page ground | `#f6f7f9` | `bg-slate-50` |
| Surface / card | `#ffffff` | `bg-white` |
| Border | `#e3e6ea` | `border-slate-200` |
| Border (subtle, inside cards) | `#eef0f3` | `border-slate-100` |
| Text primary | `#16181d` | `text-slate-900` |
| Text secondary | `#3d424b` | `text-slate-700` |
| Text muted | `#8b919b` | `text-slate-400` |
| Accent / read | `#4f46e5` | `indigo-600` |
| Accent deep (labels on tint) | `#3730a3` | `indigo-800` |
| Write / agent mutation | `#b45309` / `#92400e` | `amber-700` / `amber-800` |
| Write tint | `#fffaf2`, border `#f0e2cd` | `bg-amber-50` |
| Negative delta | `#c2410c` | `orange-700` |
| Chart bar, inactive | `#c7cbd4` | `slate-300` |
| Chart bar, active | `#4f46e5` | `indigo-600` |
| Radius | 7px controls · 9–10px cards | `rounded-lg` / `rounded-xl` |
| Shadow | `0 1px 3px rgba(0,0,0,.07)` | `shadow-sm` |

Type: **IBM Plex Sans** for UI, **IBM Plex Mono** for all numbers, ids, tool names, JSON. Every figure on screen is mono — that is what makes the log and the KPI cards read as the same data. Sizes: 21px/600 KPI value, 14px/600 app title, 13px/600 card title, 12–12.5px/400 body, 11px mono meta, 10.5px uppercase `.04em` label.

Rule of thumb: indigo = the agent read something, amber = the agent changed something. No other accent colors.

---

## 2. Screens and states

### 2.1 Main dashboard — `1a` (chosen) / `1b` (alternative)

Layout `1a`: header bar, then a 2-column grid `1fr 328px` — content left, agent rail right (fixed, full height, `border-l`).

- **Header:** logo mark (26px, `#16181d`, letter S), "Sundae Metrics", muted "Glacé · 4 locations". Right side: WebMCP status pill (green dot + "WebMCP · 6 tools") and an Export CSV button (secondary; cut it if it isn't wired).
- **Store selector:** segmented pill group in a `#e8eaee` track, active option white with `shadow-sm`. Options: North / South / Central / West / All. This is `StoreSelector.tsx`.
- **Date range:** two native `<input type="month">` with a `→` between them, mono text. This is `DateRangePicker.tsx`. Default `2025-09 → 2026-08`.
- **KPI row:** 4 cards — Revenue (month), Units (month), Top flavor, Slow mover. Each: uppercase label, big value, delta line. Deltas come from `comparePeriods`, not from a separate calculation.
- **Chart card:** Recharts `<BarChart>`, 12 monthly bars, ~184px plot height, dashed gridlines at 0/50/100%. Bars in the selected comparison window are indigo with the exact value printed above; all others slate-300. This is `SalesChart.tsx`.
- **Flavor breakdown card:** 6 rows, grid `120px 1fr 78px 104px` — flavor name, proportional bar (indigo ramp `#4f46e5 → #dbd9f8`), units, revenue right-aligned.
- **Agent rail:** header ("Agent activity" + one-line explainer + read/write legend), scrollable call list, and a pinned footer line: "Reads never change what you see. Writes are marked and always visible."

`1b` is the same content with the log as a bottom strip: 4 horizontal cards with `border-top` accent instead of `border-left`, truncated to one line each, "expand ⌃". Build `1a`; keep `1b` only if the recording surface turns out to be short.

### 2.2 Agent acting live — `1c`

Trigger: `set_dashboard_view` executes.

- Amber toast, top-right of the content area: dot + "The agent changed your view → *South*" + Undo. `animation: pulseRing 2s ease-out infinite` (box-shadow ring, defined once).
- The affected store pill switches to the amber treatment (`bg-amber-50`, `border-amber-700`, amber text) instead of the normal white active state — for the duration of the highlight only, then it settles into the normal active state.
- The chart card gets `outline: 2px solid rgba(180,83,9,.35); outline-offset: 2px` and its active bar turns amber.
- Highlight decays after ~4s; the log entry and Undo persist.

### 2.3 AgentActivityLog in detail — `1d`

`AgentActivityLog.tsx`. Entry shape: `{ tool, input, output, readOnly, ts, ms, chars }`.

- Read entry: `border-left: 2.5px #4f46e5`, `bg-#fcfcfd`, indigo mono tool name, timestamp right, one or two mono lines `{input}` / `→ result`.
- Write entry: `border-left: 2.5px #b45309`, `bg-#fffaf2`, amber text, plus a `WRITE` chip and an `Undo` chip.
- Expanded entry (click to expand, latest expanded by default): inset `#f7f8fa` block with `input` / `output` JSON pretty-printed, a `READ`/`WRITE` chip, and an `N / 1500 chars` chip — that chip is the visible proof that the 1,500-char output ceiling is respected.
- Cap the list at 20; older entries collapse behind a dashed "Oldest calls collapse · keep 20" row.

### 2.4 No WebMCP — `1e`

Rendered in the rail's place when `document.modelContext` is undefined **or** `?webmcp=off` is present.

Amber "WebMCP unavailable" pill, heading "No agent connected", explanation that the 6 tools were not registered and the dashboard still works, a mono 3-step block (Chrome 149+ / `chrome://flags/#enable-webmcp-testing` / Enabled → relaunch), and two buttons: Copy flag URL (outlined indigo) + Recheck (outlined neutral). The dashboard itself renders normally — this state never blocks the page. Doubles as the video's "before" shot.

### 2.5 Flavor ranking — `1f`

Segmented control Best sellers / Slow movers, and — this is the point — **both columns visible at once**: left `order:"top"` in the indigo ramp, right `order:"bottom"` in a warm ramp on `#fffdfa`. Each row: rank + flavor, units right-aligned mono, proportional bar. Footer line explains the KPI provenance.

### 2.6 Period comparison — `1g`

Two period cards A → B (label, revenue, units), then two big delta cards (revenue %, units %) tinted for negative, then a mono "What the agent receives" block showing the literal tool JSON. Closing line states that the percentage is computed by the query layer.

---

## 3. Fixed demo data — use as the seed's expected values

Window `2025-09` → `2026-08`, southern-hemisphere seasonality (summer peak Dec–Feb), ARS.

**North, monthly revenue:** Sep 2,310,000 · Oct 2,980,000 · Nov 3,740,000 · Dec 4,620,000 · Jan 5,080,000 · **Feb 4,812,400** · **Mar 3,987,100** · Apr 2,870,000 · May 2,140,000 · Jun 1,680,000 · Jul 1,790,000 · Aug 1,950,000.

**North Feb 2026:** revenue 4,812,400 · units 14,668.
**North Mar 2026:** revenue 3,987,100 · units 12,410. Flavor split (units / revenue): dulce_de_leche 4,105 / 1,318,600 · chocolate 2,940 / 944,300 · pistachio 1,810 / 621,500 · strawberry 1,655 / 531,600 · lemon 1,120 / 359,800 · passion_fruit 780 / 211,300. Sums match exactly.

**compare_periods(north, 2026-02, 2026-03):** `revenueChangePct: -17.1`, `unitsChangePct: -15.4`.

**get_summary(2026-03-01, 2026-03-31):** total 13,841,300 — north 3,987,100 · central 4,512,800 · south 3,104,500 · west 2,236,900.

**South Mar 2026, top 3 units:** dulce_de_leche 3,240 · chocolate 2,415 · pistachio 1,380. **Bottom 3:** passion_fruit 410 · lemon 695 · strawberry 1,105.

**Demo question:** "How much did the North location change between February and March?" → **−17.1%**. Deliberately a decline: an agent guessing off a bar that visibly went *down* fails on camera in a way the viewer can see, which is a stronger "before" than a wrong growth number.

---

## 4. Mockup → file map

| Mockup | Files in the plan's structure |
|---|---|
| `1a` shell, header, grid | `src/App.tsx` |
| `1a` store pills | `src/components/StoreSelector.tsx` |
| `1a` month inputs | `src/components/DateRangePicker.tsx` |
| `1a` KPI row | `src/components/KpiRow.tsx` *(new — not in the brief's tree)* |
| `1a` chart, `1c` amber chart state | `src/components/SalesChart.tsx` |
| `1a` flavor breakdown | `src/components/FlavorBreakdown.tsx` *(new)* |
| `1a` rail, `1b` strip, `1d` entries | `src/components/AgentActivityLog.tsx` |
| `1c` toast + highlight | `src/components/AgentViewToast.tsx` *(new)*, driven by `src/lib/store.ts` |
| `1e` | `src/components/WebmcpStatus.tsx` *(new)*, gated in `main.tsx` |
| `1f` | `src/components/FlavorRanking.tsx` *(new)* |
| `1g` | `src/components/PeriodCompare.tsx` *(new)* |
| all numbers | `src/lib/queries.ts` — single source of truth |
| tool registration | `src/lib/webmcp-tools.ts` |

Five components beyond the brief's tree. All presentational, no new state and no new dependency.

---

## 5. UI stages to slot into PLAN.md

These replace stage 4 and refine stage 6; stages 0–3, 5 and 7–9 are unchanged.

**Stage 4a — shell + tokens.** Tailwind theme extended with the section 1 tokens, IBM Plex loaded, `App.tsx` header + 2-column grid, `store.ts` with `useSyncExternalStore`.
*Gate:* the empty shell matches `1a` at 1280px wide.

**Stage 4b — controls + KPI row.** `StoreSelector`, `DateRangePicker`, `KpiRow`, all reading `queries.ts`.
*Gate:* changing store or range updates all 4 KPI values; the deltas come from `comparePeriods`, not from inline arithmetic.

**Stage 4c — chart + breakdown.** `SalesChart` (Recharts) and `FlavorBreakdown`.
*Gate:* the Mar 2026 bar for North reads 3,987,100 — the same figure the KPI card shows.

**Stage 4d — secondary views.** `FlavorRanking` (`1f`) and `PeriodCompare` (`1g`).
*Gate:* `order:"bottom"` renders the slow-mover column with the same numbers `get_top_flavors` returns.

**Stage 6a — log.** `AgentActivityLog` with read/write treatment, expandable entries, the `N / 1500 chars` chip, 20-entry cap.
*Gate:* one agent question produces visible entries with no narration needed.

**Stage 6b — write feedback + fallback.** `AgentViewToast` and `WebmcpStatus` (`1c`, `1e`), including `?webmcp=off`.
*Gate:* `set_dashboard_view({store:"south"})` changes the screen, shows the toast, and leaves a write-marked entry; with the flag off the dashboard still renders and shows `1e`.

---

## 6. Out of scope (unchanged from the plan)

Hourly granularity, `channel` / `get_channel_mix`, stock, backend, auth, UI tests, responsive beyond looking right at the recording width. Also out: dark mode, and any animation beyond the write-toast pulse.

---

> **Nota de sincronización.** Este documento es el spec de diseño tal como salió del proyecto de Claude Design. `docs/UI-PLAN.md` es el plan de implementación y se aparta de él en tres puntos deliberados —gráfico con divs CSS en vez de Recharts (§2.1, §5 stage 4c), CSS con custom properties en vez de Tailwind (§1), y 8 componentes en vez de los 10 de §4—. Ante una diferencia, manda `docs/UI-PLAN.md`.
