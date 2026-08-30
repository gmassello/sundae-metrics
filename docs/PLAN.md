# Sundae Metrics — build plan

Single source of truth for the project. Supersedes the earlier `BRIEF.md`, `UI-SPEC.md` and `UI-PLAN.md` (folded in here; recoverable from git history). Where those documents disagreed, the decision is recorded in §6.

**Hackathon:** [The WebMCP Challenge](https://webmcp.devpost.com/) · deadline **Sep 3, 2026, 1:00 PM PT** (5:00 PM ART). All links in §14.

**Mockups:** `Sundae Metrics Mockups.dc.html`, screens `1a`–`1g` (a Claude Design project). It lives **outside this repo** — don't look for it in `docs/`. Everything it defines that the build needs is transcribed in §7 and §8.

---

## 1. The product

*Sundae Metrics* — a sales dashboard for **Glacé**, a fictional chain of 4 artisanal ice cream shops. The owner has no data analyst: today every question ends in an Excel export.

The scene the demo captures — the owner (or the judge) types to the agent while looking at the same dashboard on screen:

> "How much did sales at the North location change between February and March?"

**Before (no WebMCP)** — what an agent limited to scraping and clicking has to do:

1. Screenshot the dashboard.
2. Find the store selector in the DOM (a `<select>`? a custom combobox?).
3. Simulate a click + synthetic event to pick "North".
4. Wait for a re-render with no clear signal that it finished.
5. Measure the height of February's bar in pixels. *(non-deterministic)*
6. Measure the height of March's bar in pixels. *(non-deterministic)*
7. Convert pixels to a sales value by eye. *(non-deterministic)*
8. Compute the % change on an already-uncertain number.

**After (with WebMCP)**:

```js
await get_sales({ store: "north", month: "2026-02" });
await get_sales({ store: "north", month: "2026-03" });
// or directly:
await compare_periods({ store: "north", monthA: "2026-02", monthB: "2026-03" });
```

Two calls (or one), exact data, zero guessing. The answer is **−17.1%** (§4).

**Film the "before" for real** — a browser-driving agent attempting the same question against `?webmcp=off` (§10, stage 8). A staged contrast is far less convincing than a real one, and Execution is one of the four judging criteria. The decline is deliberate: an agent guessing off a bar that visibly went *down* fails on camera in a way the viewer can see.

---

## 2. Why it scores

Four criteria, equal weight, per the [rules](https://webmcp.devpost.com/rules):

| Criterion | How this case covers it |
|---|---|
| WebMCP Leverage | The tools aren't decorative: without them, reading an exact number off a chart is literally impossible to do well. |
| Execution | A dashboard with 3–4 views + 6 tools is a complete, demonstrable product within the hackathon timeframe. |
| Potential Impact | Concrete audience: SMBs with multiple locations and no data analyst. Real problem: today they export everything to Excel. |
| Creativity & Ambition | Not another checkout flow — avoids competing head-on with the official e-commerce demos from Cloudflare/Vercel/OpenAI. |

There is also a viability filter ("Stage One") before those four are scored ("Stage Two"). In practice: the dashboard working end to end — it loads, shows data, the tools respond — is the condition for everything else to count. It's not a fifth criterion, it's the floor.

### The KPI vocabulary is borrowed from real products

Before inventing ice cream shop metrics, the check was what products that actually sell dashboards to real ice cream shops offer: HioPOS, Sipos, OmniPOS, Vendty, OrdenApp and bcnsoft in Argentina/Spain; Restroworks, GETPOS, MYR POS and Focus POS internationally. They all sell, under nearly identical names, the same handful of KPIs:

| Real category (their own naming) | How it enters Sundae Metrics |
|---|---|
| Hourly sales / peak hours | `get_sales` at monthly granularity for the MVP; hourly is a documented v2 (§13) |
| Best-selling flavors **and slow movers** | `get_top_flavors` with `order: "top" \| "bottom"` — both ends, not just the ranking |
| Channel performance (counter / dine-in / delivery) | Out of scope (§13) |
| Stock control / waste reduction | Out of scope — the model has no inventory, and saying so plainly is more credible than faking it |
| Remote multi-location access | This is the whole dashboard: that's why Glacé has 4 locations, not 1 |

This gives the Potential Impact pitch something better than "I think an owner would find this useful": *this is literally what's already being sold to ice cream shop owners, except here the agent can ask directly instead of the owner staring at a chart.* Worth a line in the submission description.

### The AgentActivityLog is not cosmetic

The security section of the WebMCP draft was empty for a while, and the user/agent/site trust model is still unresolved in the standard ([issue #11](https://github.com/webmachinelearning/webmcp/issues/11)). A panel that shows, live and unambiguously, which tool the agent called and with what data is the product-level answer to that gap — and it's what the "thoughtful use of WebMCP" criterion is looking for, without narrating it in the video.

---

## 3. Data model

Mock data, no backend. A static JSON file is enough.

```ts
type Store = {
  id: "north" | "south" | "central" | "west";
  name: string;          // "Glacé North"
  city: string;
};

type Flavor =
  | "chocolate" | "strawberry" | "dulce_de_leche" | "lemon" | "pistachio" | "passion_fruit";

type SalesRecord = {
  store: Store["id"];
  month: string;         // "2026-03"
  flavor: Flavor;
  units: number;
  revenue: number;       // ARS
};
```

12 months × 4 stores × 6 flavors = **288 records**. Window `2025-09` → `2026-08`, southern-hemisphere seasonality (summer peak Dec–Feb), amounts in ARS. Dulce de leche always on top; one flavor drops sharply in one month so "why did it drop?" has an interesting answer.

`src/data/stores.ts` holds the types, the 4 stores with `name`/`city`, and the 6 flavors with their UI labels (`dulce_de_leche` → "Dulce de leche").

---

## 4. Fixed dataset — non-negotiable

These are the numbers the mockups print on screen. The seed must produce exactly these, and `queries.test.ts` is the only place in the repo where they are written by hand — if the seed drifts, the test fails there.

**North, monthly revenue:** Sep 2,310,000 · Oct 2,980,000 · Nov 3,740,000 · Dec 4,620,000 · Jan 5,080,000 · **Feb 4,812,400** · **Mar 3,987,100** · Apr 2,870,000 · May 2,140,000 · Jun 1,680,000 · Jul 1,790,000 · Aug 1,950,000.

**North Feb 2026:** revenue 4,812,400 · units 14,668.

**North Mar 2026:** revenue 3,987,100 · units 12,410. Flavor split (units / revenue): dulce_de_leche 4,105 / 1,318,600 · chocolate 2,940 / 944,300 · pistachio 1,810 / 621,500 · strawberry 1,655 / 531,600 · lemon 1,120 / 359,800 · passion_fruit 780 / 211,300. **Sums match exactly.**

**compare_periods(north, 2026-02, 2026-03):** `revenueChangePct: -17.1`, `unitsChangePct: -15.4`.

**get_summary(2026-03-01, 2026-03-31):** total 13,841,300 — north 3,987,100 · central 4,512,800 · south 3,104,500 · west 2,236,900.

**South Mar 2026, top 3 by units:** dulce_de_leche 3,240 · chocolate 2,415 · pistachio 1,380. **Bottom 3:** passion_fruit 410 · lemon 695 · strawberry 1,105.

**How the seed reaches them** (§10, stage 2):

- **Anchored:** North's 12 monthly revenue values, verbatim.
- **Derived:** the other 3 stores come from the same seasonal shape scaled by a fixed per-store factor, with March 2026 overwritten to the exact figures above so `get_summary` closes on its total.
- **Flavor split:** fixed weight vector per store; the rounding remainder is charged to the top flavor so the sum closes exactly.
- **Literally overwritten:** North Feb 2026, North Mar 2026 (all 6 flavors, units and revenue) and South Mar 2026 — the three months the mockups show data point by data point.

Deterministic PRNG with a fixed seed, no free `Math.random`. `src/data/sales.json` is generated once and **committed**.

---

## 5. The 6 WebMCP tools

Registered with `document.modelContext.registerTool()`.

| Tool | What it does | Input | Output | `readOnlyHint` |
|---|---|---|---|---|
| `list_stores` | Lists the available locations | — | `[{id, name, city}]` | `true` |
| `get_sales` | Exact sales for one location in a given month | `{store, month}` | `{units, revenue, byFlavor: [...]}` | `true` |
| `compare_periods` | % change between two periods, computed in the query layer (don't make the agent do the math) | `{store, monthA, monthB}` | `{revenueChangePct, unitsChangePct}` | `true` |
| `get_top_flavors` | Flavor ranking, from the top **or the bottom** | `{store?, month?, limit, order?: "top" \| "bottom"}` | `[{flavor, units, revenue}]` | `true` |
| `get_summary` | Aggregate across all locations over a date range | `{dateFrom, dateTo}` | `{totalRevenue, byStore: [...]}` | `true` |
| `set_dashboard_view` | Changes what the user sees (active store + date range) | `{store?, dateFrom?, dateTo?}` | `{ok: true, applied: {...}}` | **`false`** |

### Three rules that are easy to get wrong

1. **`annotations` goes inside the tool object, not as a second argument.** Verified against the official types ([`webmcp-types@0.1.5`](https://app.unpkg.com/webmcp-types@0.1.5/files/index.d.ts)): the second argument only accepts `signal` and `exposedTo`. A `readOnlyHint` placed there is **silently ignored** and no tool declares its security hint.
2. **`set_dashboard_view` is the only one with `readOnlyHint: false`, stated explicitly** even though `false` is the default. It shows a judge reading the repo that the distinction was understood, not forgotten. It's also the most important tool for the pitch: it's what makes visible, live and on screen, that the agent is acting *on the same interface the user is looking at* — the core of OpenAI's framing ("apps that get meaningfully better when people and their agents use them together").
3. **No tool carries `untrustedContentHint: true`.** That hint is for output containing third-party content the agent shouldn't treat as instructions. Here all data comes from the seed; there is no external input. Worth stating in the submission description — it shows the hint was used with judgment, not overlooked.

`order` on `get_top_flavors` is not a whim: the KPI HioPOS/Sipos/GETPOS actually sell is "which flavors are most popular **and which are slow movers**", because owners use the second half to decide what to drop from the menu. With `order: "bottom"` free in the same tool, the video's question can be "which flavor should the South location drop?" — truer to the real KPI, no extra tool.

### Platform limits — do not skip

Per [Chrome's security guide](https://developer.chrome.com/docs/ai/webmcp/secure-tools). Exceeding them **throws no error: the tool is silently ignored.**

| Field | Limit |
|---|---|
| tool or parameter `name` | 30 characters |
| tool `description` | 500 characters |
| parameter `description` | 150 characters |
| tool output (`content`) | 1,500 characters |

The 6 tools sit comfortably inside the name and description limits. The one to watch is **output**: `get_summary` over many locations and `get_top_flavors` with a high `limit` are the ones that can cross 1.5K. That's what `toolText()` (§10, stage 3) is for — one helper, used by all six.

### Implementation examples

```js
document.modelContext.registerTool({
  name: "get_sales",
  description: "Exact sales (units and revenue) for one location in a given month",
  inputSchema: {
    type: "object",
    properties: {
      store: { type: "string", enum: ["north", "south", "central", "west"], description: "Store id" },
      month: { type: "string", description: "Month in YYYY-MM format, e.g. 2026-03" }
    },
    required: ["store", "month"]
  },
  annotations: { readOnlyHint: true },
  execute: async ({ store, month }) => ({
    content: [{ type: "text", text: toolText(getSales({ store, month })) }]
  })
});
```

Both ends of the real KPI:

```js
document.modelContext.registerTool({
  name: "get_top_flavors",
  description: "Flavor ranking by sales, highest to lowest or the reverse",
  inputSchema: {
    type: "object",
    properties: {
      store: { type: "string", enum: ["north", "south", "central", "west"], description: "Store id (optional, all stores if omitted)" },
      month: { type: "string", description: "Month in YYYY-MM format (optional, full range if omitted)" },
      limit: { type: "number", description: "How many flavors to return" },
      order: { type: "string", enum: ["top", "bottom"], description: "\"top\" = best sellers, \"bottom\" = slow movers" }
    },
    required: ["limit"]
  },
  annotations: { readOnlyHint: true },
  execute: async ({ store, month, limit, order = "top" }) => ({
    content: [{ type: "text", text: toolText(getTopFlavors({ store, month, limit, order })) }]
  })
});
```

The only one that mutates state:

```js
document.modelContext.registerTool({
  name: "set_dashboard_view",
  description: "Changes the store and/or date range the user sees on the dashboard",
  inputSchema: {
    type: "object",
    properties: {
      store: { type: "string", enum: ["north", "south", "central", "west"] },
      dateFrom: { type: "string", description: "YYYY-MM-DD" },
      dateTo: { type: "string", description: "YYYY-MM-DD" }
    }
  },
  annotations: { readOnlyHint: false },
  execute: async (input) => {
    applyDashboardView(input);
    return { content: [{ type: "text", text: `View updated: ${JSON.stringify(input)}` }] };
  }
});
```

Every `execute` delegates to `queries.ts`, serializes with `toolText`, and pushes `{ tool, input, output, readOnly, ts, ms, chars }` to the log before returning.

---

## 6. Stack and decisions

- **Framework:** Vite + React + TypeScript. Client-side only — WebMCP needs browser JS to register the tools, so no server-only rendering.
- **Charts:** **CSS divs**, not Recharts.
- **Styling:** **plain CSS with custom properties**, not Tailwind.
- **State:** module-level store exposed via `useSyncExternalStore`, no Zustand.
- **Data:** static JSON from the seed, imported directly. No backend.
- **Deploy:** Vercel (challenge partner list).
- **Dependencies:** `vitest` (dev) and `webmcp-types@0.1.5` (dev). Nothing else.

Three deliberate departures from what an earlier draft of this plan specified:

| Topic | Rejected option | Chosen | Why |
|---|---|---|---|
| Chart | Recharts | **CSS divs** | The mockup already draws it that way: 12 bars with `%` heights, ~25 lines against a ~100KB dependency you then fight with `Cell`/`LabelList`/`CartesianGrid` to make it match. `queries.ts` doesn't change if it's migrated later. |
| Styles | Tailwind v4 | **Plain CSS + custom properties** | The mockup's values (`12.5px`, `#e3e6ea`, radius 9px) fall outside Tailwind's scale: they'd end up as arbitrary values in every class. An `index.css` with the §7 tokens as variables takes them as-is. |
| Seed runner | `npx tsx scripts/seed.ts` | **`node scripts/seed.ts`** | Node 24 strips types by default. Fall back to `npx tsx` if it fails. |

Two more the mockup doesn't decide:

- **Screens `1f` and `1g` are tabs** in the content column (`Overview · Flavor ranking · Compare periods`). A 10-line tab bar avoids adding a router.
- **8 components, not 10**: `WebmcpStatus` folds into `AgentActivityLog` (same panel, empty state) and `AgentViewToast` into `App.tsx` (15 lines, one consumer).

### WebMCP testing setup

- **Chrome 149+** (151 verified working). Flip `chrome://flags/#enable-webmcp-testing` → Enabled → relaunch. With the flag on, `document.modelContext` stops returning `undefined`.
- **[Model Context Tool Inspector](https://github.com/beaufortfrancois/model-context-tool-inspector)** — install before writing code; it shows which tools registered and their schema, no guessing. Native DevTools debugging also exists.
- **[WebMCP evals](https://developer.chrome.com/docs/ai/webmcp/evals)** — test the tools before filming, instead of discovering a broken schema mid-demo.
- **ChatGPT desktop's built-in browser** — test there too, it's probably where judges look. Use **GPT-5.6 Sol or Terra**: **Luna has WebMCP disabled**, and testing with Luna makes working code look broken. Doesn't work in Enterprise or Edu workspaces either.
- **[Lighthouse: registered WebMCP tools](https://developer.chrome.com/docs/lighthouse/agentic-browsing/registered-webmcp-tools)** — audit that lists what's registered.

---

## 7. Design tokens

Light neutral dashboard. UI copy in English. The 14 rows below become custom properties in `src/index.css`, one per row.

| Role | Value | Variable |
|---|---|---|
| Page ground | `#f6f7f9` | `--ground` |
| Surface / card | `#ffffff` | `--surface` |
| Border | `#e3e6ea` | `--border` |
| Border (subtle, inside cards) | `#eef0f3` | `--border-soft` |
| Text primary | `#16181d` | `--ink` |
| Text secondary | `#3d424b` | `--ink-2` |
| Text muted | `#8b919b` | `--muted` |
| Accent / read | `#4f46e5` | `--accent` |
| Accent deep (labels on tint) | `#3730a3` | `--accent-deep` |
| Write / agent mutation | `#b45309` | `--write` |
| Write deep | `#92400e` | `--write-deep` |
| Write tint | `#fffaf2`, border `#f0e2cd` | `--write-tint` |
| Negative delta | `#c2410c` | `--negative` |
| Chart bar, inactive | `#c7cbd4` | `--bar-idle` |

Chart bar active = `--accent`. Radius: 7px controls, 9–10px cards. Shadow: `0 1px 3px rgba(0,0,0,.07)`.

**Type:** IBM Plex Sans for UI, IBM Plex Mono for **every** number, id, tool name and JSON blob — that's what makes the log and the KPI cards read as the same data. Sizes: 21px/600 KPI value, 14px/600 app title, 13px/600 card title, 12–12.5px/400 body, 11px mono meta, 10.5px uppercase `.04em` label. Loaded from Google Fonts.

**The rule that governs all color: indigo = the agent read something · amber = the agent changed something.** No other accents.

`@keyframes pulseRing` is defined once, in `index.css`.

---

## 8. Screens

### 8.1 Main dashboard — `1a`

Header bar, then a 2-column grid `1fr 328px`: content left, agent rail right (fixed, full height, `border-l`).

- **Header:** logo mark (26px, `#16181d`, letter S), "Sundae Metrics", muted "Glacé · 4 locations". Right side: WebMCP status pill (green dot + "WebMCP · 6 tools") and an Export CSV button (secondary; cut it if it isn't wired).
- **Tab bar:** `Overview · Flavor ranking · Compare periods`.
- **Store selector:** segmented pills in a `#e8eaee` track, active option white with `shadow-sm`. North / South / Central / West / All.
- **Date range:** two native `<input type="month">` with a `→` between them, mono text. Default `2025-09 → 2026-08`.
- **KPI row:** 4 cards — Revenue (month), Units (month), Top flavor, Slow mover. Each: uppercase label, big value, delta line. Deltas come from `comparePeriods`, never from inline arithmetic.
- **Chart card:** 12 monthly bars as CSS divs, ~184px plot height, dashed gridlines at 0/50/100%. Bars in the comparison window are indigo with the exact value printed above; the rest `--bar-idle`.
- **Flavor breakdown card:** 6 rows, grid `120px 1fr 78px 104px` — flavor name, proportional bar (indigo ramp `#4f46e5 → #dbd9f8`), units, revenue right-aligned.
- **Agent rail:** header ("Agent activity" + one-line explainer + read/write legend), scrollable call list, pinned footer: "Reads never change what you see. Writes are marked and always visible."

*(`1b` — the log as a bottom strip of 4 horizontal cards — is the rejected alternative. Keep it in mind only if the recording surface turns out to be short.)*

### 8.2 Agent acting live — `1c`

Trigger: `set_dashboard_view` executes.

- Amber toast, top-right of the content area: dot + "The agent changed your view → *South*" + Undo. `animation: pulseRing 2s ease-out infinite`.
- The affected store pill switches to amber treatment (`--write-tint` bg, `--write` border and text) instead of the normal white active state, for the highlight duration only, then settles into the normal active state.
- The chart card gets `outline: 2px solid rgba(180,83,9,.35); outline-offset: 2px` and its active bar turns amber.
- Highlight decays after ~4s; the log entry and Undo persist.

### 8.3 AgentActivityLog — `1d`

Entry shape: `{ tool, input, output, readOnly, ts, ms, chars }`.

- **Read entry:** `border-left: 2.5px var(--accent)`, `bg #fcfcfd`, indigo mono tool name, timestamp right, one or two mono lines `{input}` / `→ result`.
- **Write entry:** `border-left: 2.5px var(--write)`, `bg var(--write-tint)`, amber text, plus a `WRITE` chip and an `Undo` chip.
- **Expanded** (click to expand, latest expanded by default): inset `#f7f8fa` block with `input` / `output` pretty-printed, a `READ`/`WRITE` chip, and an `N / 1500 chars` chip — the visible proof that the output ceiling from §5 is respected. Not decoration.
- Cap at 20 entries; older ones collapse behind a dashed "Oldest calls collapse · keep 20" row.

### 8.4 No WebMCP — `1e`

Rendered in the rail's place when `document.modelContext` is undefined **or** `?webmcp=off` is in the URL.

Amber "WebMCP unavailable" pill, heading "No agent connected", an explanation that the 6 tools were not registered and the dashboard still works, a mono 3-step block (Chrome 149+ / `chrome://flags/#enable-webmcp-testing` / Enabled → relaunch), and two buttons: Copy flag URL (outlined indigo) + Recheck (outlined neutral). The dashboard itself renders normally — this state never blocks the page. Doubles as the video's "before" shot.

### 8.5 Flavor ranking — `1f`

Segmented control Best sellers / Slow movers, and — this is the point — **both columns visible at once**: left `order:"top"` in the indigo ramp, right `order:"bottom"` in a warm ramp on `#fffdfa`. Each row: rank + flavor, units right-aligned mono, proportional bar. Footer line explains the KPI provenance (§2).

### 8.6 Period comparison — `1g`

Two period cards A → B (label, revenue, units), then two big delta cards (revenue %, units %) tinted with `--negative` when negative, then a mono "What the agent receives" block showing the literal tool JSON. Closing line states the percentage is computed by the query layer.

---

## 9. File map

```
sundae-metrics/
├── docs/
│   └── PLAN.md                       # this file
├── scripts/
│   └── seed.ts                       # generates sales.json, run once
├── src/
│   ├── data/
│   │   ├── stores.ts                 # types, 4 stores, 6 flavors + labels
│   │   └── sales.json                # 288 records, committed
│   ├── lib/
│   │   ├── queries.ts                # single source of truth for every number
│   │   ├── queries.test.ts           # asserts against §4
│   │   ├── store.ts                  # useSyncExternalStore, mutable from outside React
│   │   └── webmcp-tools.ts           # registerTools()
│   ├── components/
│   │   ├── StoreSelector.tsx
│   │   ├── DateRangePicker.tsx
│   │   ├── KpiRow.tsx
│   │   ├── SalesChart.tsx
│   │   ├── FlavorBreakdown.tsx
│   │   ├── AgentActivityLog.tsx
│   │   ├── FlavorRanking.tsx
│   │   └── PeriodCompare.tsx
│   ├── App.tsx                       # header, grid, tab bar, amber toast inline
│   ├── index.css                     # §7 tokens, IBM Plex, pulseRing
│   └── main.tsx                      # calls registerTools()
├── README.md
└── LICENSE
```

| Component | Source screen |
|---|---|
| `StoreSelector.tsx` | `1a` pills + the `1c` amber state |
| `DateRangePicker.tsx` | `1a` month inputs |
| `KpiRow.tsx` | `1a` KPI row |
| `SalesChart.tsx` | `1a` CSS bars + the `1c` amber state |
| `FlavorBreakdown.tsx` | `1a` flavor card |
| `AgentActivityLog.tsx` | `1a` rail + `1d` entries **and** the `1e` state, same branch |
| `FlavorRanking.tsx` | `1f` |
| `PeriodCompare.tsx` | `1g` |
| `App.tsx` | `1a` shell + `1c` toast |

---

## 10. Stages

### Stage 0 — Pre-flight (manual, before any code)

1. `chrome://flags/#enable-webmcp-testing` → Enabled → relaunch Chrome.
2. Install the [Model Context Tool Inspector](https://github.com/beaufortfrancois/model-context-tool-inspector).
3. Claim the sponsor credits (§14) — first come, first served, and they expire.
4. Register on Devpost.

**Gate:** in the Chrome console, `document.modelContext` is not `undefined`.

### Stage 1 — Scaffold

- `npm create vite@latest . -- --template react-ts` over the existing directory (don't create a nested `sundae-metrics/`).
- Two dependencies, both dev: `vitest`, `webmcp-types@0.1.5`. No Tailwind, no Recharts, no router, no state library.
- `vite.config.ts`: add `test: { environment: 'node' }`.
- Delete `src/App.css`, `src/assets/`, and the template content in `App.tsx` / `index.css`.

**Gate:** `npm run build` and `npm run dev` come up.

### Stage 2 — Data

`src/data/stores.ts` per §3. `scripts/seed.ts` → `src/data/sales.json`, anchored to §4 by the four rules listed there. Run with `node scripts/seed.ts` (fallback `npx tsx`). Commit the JSON.

**Gate:** running the seed twice produces a byte-identical JSON.

### Stage 3 — Query layer

`src/lib/queries.ts` — pure functions, no React, no DOM. The single source of truth: dashboard and tools both consume it, so a number on the chart and a number from a tool cannot diverge.

`listStores()` · `getSales({store, month})` · `comparePeriods({store, monthA, monthB})` · `getTopFlavors({store?, month?, limit, order})` · `getSummary({dateFrom, dateTo})` · `monthlyRevenue(store, from, to)` (feeds the chart) · `flavorBreakdown(store, month)` (feeds the flavor card) · `toolText(obj)` (`JSON.stringify` **truncated to 1,500 chars**, §5).

The last two exist so the chart and the card don't recompute what the query layer already computes.

**Gate — `src/lib/queries.test.ts` (Vitest), asserting §4:**
- `comparePeriods(north, 2026-02, 2026-03)` → **−17.1%**, plus a growth case and a zero-divisor case.
- `getSummary(2026-03-01, 2026-03-31)` → March total and the 4 per-store figures.
- `getTopFlavors(south, 2026-03, 3)` in `top` and `bottom` → both trios.
- `getSales(north, 2026-03)` → revenue and units, and the flavor split sums exactly.
- `toolText` truncating an oversized payload.

### Stage 4 — State

`src/lib/store.ts` — ~30-line module-level store exposed via `useSyncExternalStore`. Mutable from outside React, which is exactly what `set_dashboard_view` needs in stage 6.

- State: `{ store, dateFrom, dateTo, tab }`.
- `calls`: agent call log, cap 20.
- `toast`: holds the previous view, for the Undo in `1c` / `1d`.
- `webmcpReady`: drives the `1e` state.
- `applyDashboardView(input)` saves the previous view before mutating; `undoView()` restores it.

### Stage 5 — Styles and components

`src/index.css` with the §7 tokens, fonts and `pulseRing`. Then the 8 components of §9 and `App.tsx` wiring the header, the `1fr 328px` grid, the tab bar and the amber toast inline.

**Gate:** the empty shell matches `1a` at 1280px. Changing store or range updates all 4 KPIs, the chart and the breakdown. North's March bar reads 3,987,100 — the same figure as the KPI card.

### Stage 6 — The 6 WebMCP tools

`src/lib/webmcp-tools.ts`, `registerTools()` called from `main.tsx`.

**Guard:** if `document.modelContext` is `undefined` **or** the URL has `?webmcp=off`, log to console, leave `webmcpReady = false` (which renders `1e`) and carry on. The human dashboard never breaks — and `?webmcp=off` is the video's "before" shot.

The six from §5, with the three rules stated there.

**Gate:** the Tool Inspector lists all 6 with their schemas; one agent question leaves visible entries in the rail with no narration needed.

### Stage 7 — Deploy + README

- Vercel, new project from the GitHub repo. Vite preset, no environment variables.
- `README.md` rewritten **assuming nobody will run the code**: what it is, screenshot, the 6 tools with input/output, how to enable the Chrome flag, and why WebMCP is what makes the case possible. The challenge FAQ says judges "may test your project, but they're not required to — they can judge based on your description and repo alone."
- License visible in the **repo's About section** on GitHub, not just the `LICENSE` file.

**Gate:** open the Vercel URL in Chrome with the flag on, from a clean window, and all 6 tools respond.

### Stage 8 — Before/after video (<3 min, YouTube, with audio)

- **Before, real and unstaged:** a browser-driving agent, same question, against `?webmcp=off`. It has to estimate the bar height. Film the real failure.
- **After:** same question, tools live, two calls, exact number, AgentActivityLog showing them.
- **Close on `set_dashboard_view`:** the agent changes what you are looking at.

**Gate:** under 3 minutes, has audio, uploaded to YouTube as public or unlisted.

### Stage 9 — Devpost submission

Written description covering: why WebMCP fits this use case, what user and agent can do together that they couldn't before, and the technical detail. Include the three free wins: the KPI vocabulary comes from products already sold to real ice cream shops (§2); `order: "bottom"` answers the slow-mover KPI; no tool carries `untrustedContentHint` and there's a stated reason why.

**Gate:** submitted before Sep 3, 1:00 PM PT, with a public repo, a live URL and the video.

---

## 11. End-to-end verification

```bash
npm test && npm run build && npm run preview
```

Against the preview, in Chrome with `chrome://flags/#enable-webmcp-testing` on:

1. The Tool Inspector lists all 6 tools with their schemas.
2. `get_sales({store:"north", month:"2026-03"})` returns 3,987,100 — **the same number the March bar and the KPI card show**.
3. `compare_periods({store:"north", monthA:"2026-02", monthB:"2026-03"})` returns `-17.1`.
4. `set_dashboard_view({store:"south"})` changes the screen, shows the amber toast, and leaves a `WRITE`-marked entry in the log.
5. `?webmcp=off`: the dashboard renders identically and the rail shows the `1e` state.

---

## 12. Delivery checklist

- [ ] Public GitHub repo with an open source license visible **in the About section** — the `LICENSE` file alone isn't enough, it has to be detectable there.
- [ ] Live URL, working in Chrome with WebMCP enabled or in ChatGPT's browser.
- [ ] Demo video, under 3 minutes, on YouTube, with audio.
- [ ] Written description (§10, stage 9).
- [ ] README that assumes nobody runs the code (§10, stage 7).
- [ ] Submitted before **Sep 3, 2026, 1:00 PM PT** (5:00 PM ART).

### Rules that can wreck an otherwise good submission

- **One submission per person** — probably. The official rules contradict themselves ("no more than one Submission" vs. "each of the Entrant's other Submissions" in the same sentence); a Devpost forum question from Aug 26 went unanswered. Don't build a second project just in case — assume it's one.
- **After Sep 3, 1:00 PM PT, nothing gets touched** — not the Devpost entry, not the repo, not the live site — until winners are announced on **Sep 23**. Touching any of the three during judging risks eligibility. To keep improving, fork and work on the copy. This also means **Vercel has to stay live for those three weeks** — the free tier covers it, but don't tear it down thinking the demo is over.

---

## 13. Out of scope

Hourly granularity (a real KPI, but it multiplies data volume ~700× without strengthening the WebMCP pitch — the point is the exact number, not the sampling rate). `channel` (counter / dine-in / delivery) and `get_channel_mix` — only if the base dashboard and the 6 tools are done with room to spare, and then re-check the 1,500-char output ceiling. Stock control, backend, auth, UI tests, dark mode, animation beyond the write-toast pulse, and responsive beyond looking right at 1280px (the recording width).

---

## 14. Reference links

**Hackathon**
- [webmcp.devpost.com](https://webmcp.devpost.com/) — the submission page
- [openai.com/webmcp-challenge](https://openai.com/webmcp-challenge/) — the announcement and framing
- [webmcp.devpost.com/rules](https://webmcp.devpost.com/rules) — judging criteria and the eligibility rules in §12
- Deadline: **Sep 3, 2026, 1:00 PM PT** · winners **Sep 23**

**Standard and types**
- [`webmcp-types@0.1.5` index.d.ts](https://app.unpkg.com/webmcp-types@0.1.5/files/index.d.ts) — the source that settles where `annotations` goes (§5, rule 1)
- [webmachinelearning/webmcp issue #11](https://github.com/webmachinelearning/webmcp/issues/11) — the unresolved trust model that the AgentActivityLog answers (§2)

**Chrome and testing**
- [Secure WebMCP tools](https://developer.chrome.com/docs/ai/webmcp/secure-tools) — the character limits in §5
- `chrome://flags/#enable-webmcp-testing` — the flag; without it `document.modelContext` is `undefined`
- [Model Context Tool Inspector](https://github.com/beaufortfrancois/model-context-tool-inspector) — lists registered tools and their schemas
- [WebMCP evals](https://developer.chrome.com/docs/ai/webmcp/evals) — test tools before filming
- [Lighthouse: registered WebMCP tools](https://developer.chrome.com/docs/lighthouse/agentic-browsing/registered-webmcp-tools)

**Sponsor credits — first come, first served (stage 0)**
- **Vercel:** US$30 in build credits, code `OAIWEBMH-9E2F-MUT4` — first 1,000
- **Render:** US$50 in credits, valid 1 year — only 500 slots
- **Netlify:** 3,000 credits, requires a form — first 1,000

They don't change the architecture, but it's free money with an expiration date. Claim before coding, not after.

---

## 15. In plain language

Today, if you ask an AI assistant to read a number off a chart on screen, it has to look at the picture and eyeball how tall the bar is. It gets it wrong — and worse, it gets it wrong confidently.

This builds a sales page for an ice cream chain with four locations, where the assistant doesn't have to look at anything: the page itself offers it six "questions it can ask" and answers with the exact number. One of those six runs the other way — the assistant changes what *you* are seeing, so if you say "show me the South location", the screen changes in front of you.

On the side there's a panel logging every query the assistant made, color-coded by whether it only read data or actually changed something. Nothing is hidden: you watch, live, what it asked and what it got back.
