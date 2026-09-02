# Sundae Metrics — build plan

Single source of truth for the project. Supersedes the earlier `BRIEF.md`, `UI-SPEC.md` and `UI-PLAN.md` (folded in here; recoverable from git history). Where those documents disagreed, the decision is recorded in §6.

**Hackathon:** [The WebMCP Challenge](https://webmcp.devpost.com/) · deadline **Sep 3, 2026, 1:00 PM PT** (5:00 PM ART). All links in §14.

**Mockups:** `Sundae Metrics Mockups.dc.html`, screens `1a`–`1g` (a Claude Design project). It lives **outside this repo** — don't look for it in `docs/`. Everything it defines that the build needs is transcribed in §7 and §8.

---

## 1. The product

*Sundae Metrics* — a sales dashboard for **Glacé**, a fictional chain of 4 artisanal ice cream shops. The owner has no data analyst: today every question ends in an Excel export.

The scene the demo captures — the owner (or the judge) types to the agent while looking at the same dashboard on screen. **The question that ended up filmed** (§10, stage 8) is the January one, because it is the one the chart cannot answer:

> "For the North store, what happened to sales in January 2026? Compare the flavor breakdown against December and tell me if anything looks off."

The simpler February-to-March question survives as the query-layer example below and in the README.

**Before (no WebMCP)** — what an agent limited to the rendered page has to do:

1. Screenshot the dashboard.
2. Find the store selector in the DOM (a `<select>`? a custom combobox?).
3. Simulate a click + synthetic event to pick "North".
4. Wait for a re-render with no clear signal that it finished.
5. Set the month range, twice, through an `<input type="month">`.
6. Read the values back off the screen and do the arithmetic itself.

**After (with WebMCP)**:

```js
await get_sales({ store: "north", month: "2026-02" });
await get_sales({ store: "north", month: "2026-03" });
// or directly:
await compare_periods({ store: "north", monthA: "2026-02", monthB: "2026-03" });
```

Two calls (or one), exact data, no reconstruction. The answer is **−17.1%** (§4).

**Film the "before" for real** — the same agent, the same page, against `?webmcp=off` (§10, stage 8). A staged contrast is far less convincing than a real one, and Execution is one of the four judging criteria. **What the real one showed is that the honest claim is cost, not incapacity:** this chart prints its values as text, so the agent reads them and gets the right answer — in **4 min 38 s** instead of 36 s. That is a weaker headline and a much stronger argument, because it survives someone trying it.

---

## 2. Why it scores

Four criteria, equal weight, per the [rules](https://webmcp.devpost.com/rules):

| Criterion | How this case covers it |
|---|---|
| WebMCP Leverage | The tools aren't decorative, and the gap is measured rather than asserted: same model, same page, 4 min 38 s without them against 36 s with them (§10, stage 8). |
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

The security section of the WebMCP draft was empty for a while, and how much a site must reveal about what an agent did on it is still unresolved: [issue #11](https://github.com/webmachinelearning/webmcp/issues/11) is prompt injection, [#176](https://github.com/webmachinelearning/webmcp/issues/176) is hints for consequential actions, and neither is settled. A panel that shows, live and unambiguously, which tool the agent called and with what data is the product-level answer to that gap — and it's what the "thoughtful use of WebMCP" criterion is looking for, without narrating it in the video.

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
  revenue: number;       // USD
};
```

12 months × 4 stores × 6 flavors = **288 records**. Window `2025-09` → `2026-08`, southern-hemisphere seasonality (summer peak Dec–Feb), amounts in USD. Dulce de leche always on top; one flavor drops sharply in one month so "why did it drop?" has an interesting answer.

`src/data/stores.ts` holds the types, the 4 stores with `name`/`city`, and the 6 flavors with their UI labels (`dulce_de_leche` → "Dulce de leche").

---

## 4. Fixed dataset — non-negotiable

These are the numbers the mockups print on screen. The seed must produce exactly these, and `queries.test.ts` is the only place in the repo where they are written by hand — if the seed drifts, the test fails there.

**North, monthly revenue (USD):** Sep 23,100 · Oct 29,800 · Nov 37,400 · Dec 46,200 · Jan 50,800 · **Feb 48,124** · **Mar 39,871** · Apr 28,700 · May 21,400 · Jun 16,800 · Jul 17,900 · Aug 19,500.

**North Feb 2026:** revenue 48,124 · units 14,668.

**North Mar 2026:** revenue 39,871 · units 12,410. Flavor split (units / revenue): dulce_de_leche 4,105 / 13,186 · chocolate 2,940 / 9,443 · pistachio 1,810 / 6,215 · strawberry 1,655 / 5,316 · lemon 1,120 / 3,598 · passion_fruit 780 / 2,113. **Sums match exactly.** Implied price: US$ 3.21 per unit.

**compare_periods(north, 2026-02, 2026-03):** `revenueChangePct: -17.1`, `unitsChangePct: -15.4`.

**get_summary(2026-03-01, 2026-03-31):** total 138,413 — north 39,871 · central 45,128 · south 31,045 · west 22,369.

**South Mar 2026, top 3 by units:** dulce_de_leche 3,240 · chocolate 2,415 · pistachio 1,380. **Bottom 3:** passion_fruit 410 · lemon 695 · strawberry 1,105.

**How the seed reaches them** (§10, stage 2):

- **Anchored:** North's 12 monthly revenue values, verbatim.
- **Derived:** the other 3 stores come from North's seasonal shape scaled by a per-store factor **derived from the March figures above** (`march[store] / march.north`) times a fixed 12-value tilt vector whose March entry is exactly `1.0`. March therefore lands on its exact figure by construction — no overwrite, and no visible step in the curve at that month.
- **Flavor split:** fixed weight vector per store; the rounding remainder is charged to the top flavor so the sum closes exactly.
- **Literally overwritten:** North Feb 2026 (totals), North Mar 2026 (all 6 flavors, units and revenue) and South Mar 2026 (the 6 unit figures; revenue splits from the total) — the three months the mockups show data point by data point.
- **The sharp drop (§3):** North / `pistachio` / **2026-01**, weight cut to 0.035 and the delta spread across the other 5 flavors. January is the season's peak and its monthly total is anchored, so **the chart bar does not move** — pistachio going from 2,099 units in December to 554 in January is invisible on screen and only a tool call surfaces it. That is the project's pitch, sitting in the dataset.

**No randomness at all** — every figure comes from fixed vectors and arithmetic, so the byte-identical gate holds by construction and no jitter can break an anchored sum. `src/data/sales.json` is generated once and **committed**.

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
| `set_dashboard_view` | Changes what the user sees (active store + date range) | `{store?, dateFrom?, dateTo?}`, `store` also takes `"all"` | `{ok: true, applied: {...}}` | **`false`** |

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
      store: { type: "string", enum: ["north", "south", "central", "west", "all"] },
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

- Scaffold **into a temp directory** and copy the files in — never `npm create vite@latest .` over the repo. `create-vite` v9's `--overwrite` *removes existing files*, which on `.` means `.git/`, `docs/` and `LICENSE`; without the flag it opens an interactive prompt. Skip the template's `README.md`.
- Two dependencies, both dev: `vitest`, `webmcp-types@0.1.5`. No Tailwind, no Recharts, no router, no state library. The template's linter (Oxlint in v9) stays as-is.
- `vite.config.ts`: import `defineConfig` from `vitest/config` and add `test: { environment: 'node' }`. `package.json`: add `"test": "vitest run"`.
- Delete `src/App.css`, `src/assets/`, `public/icons.svg`, and the template content in `App.tsx` / `index.css`. Set the project name and `<title>` to Sundae Metrics.

**Gate:** `npm run build` and `npm run dev` come up.

### Stage 2 — Data

`src/data/stores.ts` per §3. `scripts/seed.ts` → `src/data/sales.json`, anchored to §4 by the four rules listed there. Run with `node scripts/seed.ts` (fallback `npx tsx`). Commit the JSON.

**Gate:** running the seed twice produces a byte-identical JSON.

### Stage 3 — Query layer

`src/lib/queries.ts` — pure functions, no React, no DOM. The single source of truth: dashboard and tools both consume it, so a number on the chart and a number from a tool cannot diverge.

`listStores()` · `getSales({store, month})` · `comparePeriods({store, monthA, monthB})` · `getTopFlavors({store?, month?, limit, order})` · `getSummary({dateFrom, dateTo})` · `monthlyRevenue(store, from, to)` (feeds the chart) · `flavorBreakdown(store, month)` (feeds the flavor card) · `toolText(obj)` (`JSON.stringify` **truncated to 1,500 chars**, §5).

The last two exist so the chart and the card don't recompute what the query layer already computes.

**Two behaviours this stage had left open:**

- **Zero divisor → `null`, not `0`.** `comparePeriods` returns `{ revenueChangePct: number | null, unitsChangePct: number | null }`. A percentage change from zero is undefined; a `0` would read to the agent as "it didn't change". The UI renders `—`.
- **Invalid input throws, at the tool-facing entry points only.** The four functions a tool calls — `getSales`, `comparePeriods`, `getTopFlavors`, `getSummary` — open with an `assertQuery`/`assertMonth`/`assertDate` line and raise an `Error` with a legible message (`Unknown store "norte"`, `Invalid month "03-2026", expected YYYY-MM`, `No data between ...`). Every `execute` in stage 6 catches it and hands the text back to the agent, so a typo is distinguishable from a real month with no sales instead of being reported as US$ 0. This is the trust boundary: the input comes from an agent.

  The two feeds the UI calls directly — `flavorBreakdown` and `monthlyRevenue` — deliberately **do not** validate: they are driven by the `<input type="month">` of §8.1 and must degrade to an empty card, never throw inside a React render. `recordsFor` is a plain filter so the divide stays by consumer and not by which parameter a function happens to pass. Keep the split: a new query goes into one group or the other, on purpose.
- `store` omitted means **all locations** — one convention across the whole API, `getSales` and `comparePeriods` included (the `All` pill of §8.1 needs the KPI row and its deltas to come from the query layer rather than from arithmetic in the component). The 4-value `enum` in the tools' `inputSchema` is unchanged: the tools always pass a store.
- `getSales` derives its totals **from** `byFlavor` rather than summing the records a second time, so a total can never disagree with the breakdown printed beside it.
- `tsconfig.app.json` needs `"resolveJsonModule": true` for `tsc -b` to accept the `sales.json` import.

**Gate — `src/lib/queries.test.ts` (Vitest), asserting §4:**
- `comparePeriods(north, 2026-02, 2026-03)` → **−17.1%**, plus a growth case and a zero-divisor case.
- `getSummary(2026-03-01, 2026-03-31)` → March total and the 4 per-store figures.
- `getTopFlavors(south, 2026-03, 3)` in `top` and `bottom` → both trios.
- `getSales(north, 2026-03)` → revenue and units, and the flavor split sums exactly.
- `toolText` truncating an oversized payload.

### Stage 4 — State

`src/lib/store.ts` — ~30-line module-level store exposed via `useSyncExternalStore`. Mutable from outside React, which is exactly what `set_dashboard_view` needs in stage 6.

- State: `{ view: { store, monthFrom, monthTo }, tab }`. The view is **nested, and monthly** — `undoView` restores it in one assignment instead of three, and the two `<input type="month">` of §8.1 plus `monthlyRevenue`/`flavorBreakdown` all speak months. `set_dashboard_view` receives `YYYY-MM-DD` per §5 and converts at the boundary, inside `applyDashboardView`; the field names carry the granularity so the two never get confused.
- `calls`: agent call log, cap 20, newest first. Entry shape is §8.3's plus an `id`: two calls inside the same millisecond share a `ts`, and React needs a stable key.
- `previousView` + `highlight`: the Undo of `1c` / `1d` and the ~4s amber decay of §8.2. The decay is a `setTimeout` **in the store**, restarted by a second write inside the window — a `useEffect` wouldn't exist at the moment the mutation arrives from a tool's `execute`.
- `webmcpReady`: drives the `1e` state. `store.ts` stays DOM-free — reading `document.modelContext` and `?webmcp=off` belongs to stage 6 — which is what lets it be tested under the `environment: 'node'` already configured.
- `applyDashboardView(input)` validates with the same `assertStore`/`assertMonth` the query layer uses (exported for this), applies **only the fields present**, saves the previous view and returns the applied one for the tool to echo in `{ok: true, applied}`. Invalid input throws and leaves the state untouched. `undoView()` restores and spends the snapshot.

**Two behaviours this stage had left open:**

- **Undo is single-level.** One `previousView`, exactly as this stage says: only the most recent write is reversible, and the `Undo` chip of an older write entry renders disabled in stage 5. That is what the video needs — one write, one visible Undo — and it keeps "undo" meaning a step back rather than a jump to an arbitrary old state.
- **`'all'` joins the `enum` of `set_dashboard_view`** (5 values). The agent can drive the screen to any state the human reaches with the mouse, the All view included, so no corner of the UI is unreachable to it. `store` omitted still means "leave it alone": this is a partial-update tool, which is why the sentinel is needed at all.

### Stage 5 — Styles and components

`src/index.css` with the §7 tokens, fonts and `pulseRing`. Then the 8 components of §9 and `App.tsx` wiring the header, the `1fr 328px` grid, the tab bar and the amber toast inline.

**Gate:** the empty shell matches `1a` at 1280px. Changing store or range updates all 4 KPIs, the chart and the breakdown. North's March bar reads 39,871 — the same figure as the KPI card.

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

**Reopened and closed (Aug 31) — the no-flag path was missing.** The rules name it *first*: "Open your deployed app in ChatGPT's in-app browser, which supports WebMCP out of the box. To test in Google Chrome, enable WebMCP using `chrome://flags/#enable-webmcp-testing`." Both the README and the `1e` state inside the app documented only the Chrome flag, which put a setup chore in front of the person scoring the entry. Two edits, both done:

- `README.md` — line 5 now names both paths, and `## Trying it` is split into **In ChatGPT — nothing to enable in a browser** (desktop app, GPT-5.6 Sol or Terra, *Enable site tools*, *Site tools* in the address bar) followed by **In Chrome — one flag**. The closing paragraph no longer says "without the flag": it says "in a browser without WebMCP support", which is what `?webmcp=off` actually simulates.
- `src/components/AgentActivityLog.tsx`, the `NoWebmcp` component — two labelled `<ol>` blocks, ChatGPT first and Chrome second, reusing the existing `.nomcp p` / `.nomcp ol` rules: no new CSS, no §7 tokens touched. `Copy flag URL` and `Recheck` unchanged — the flag URL stays the only one of the two paths with anything to copy.

Redeployed with `npx vercel --prod` from local — the GitHub repo is **not** connected, so a push does not redeploy. This edit invalidated the Chrome "before" take that had already been filmed; both takes were reshot in the ChatGPT app on Sep 1 (stage 8).

### Stage 8 — Before/after video (<3 min, YouTube, with audio)

Assembled from a written script with a synthetic voice track, not a live voiceover: a wording change
rebuilds in seconds and the caption timings are exact by construction. Pipeline and its three
scripts → the `personal-record-video` skill.

**Done:**

- `video/narration.tsv` — 8 beats, 36 lines. `video/out/narration.wav` — **2:32.3**,
  `HARD CAP 3:00 — OK`, drift 0.000, voice `Ava (Premium)`.
- `video/chatgpt-run.md` — the app setup and the exact prompts. `video/shotlist.md` — both takes.
- `.gitignore` — `video/out/`, `video/*.mov`.
- Both takes shot in the ChatGPT app on Sep 1. The earlier "before", filmed in Chrome with a
  browser-driving agent, was discarded: the Stage 7 reopen put a different `1e` panel on camera and
  the whole contrast moved to the ChatGPT app.

**Every number in the script was verified against the production bundle**, not the repo — the alias
points at the last prod deploy, which may lag the working tree. `sundae-metrics.vercel.app` serves
288 records, north 2026-01 = 50,800 with pistachio 554 units / US$ 1,778, december 2,099 / 7,202,
and all 6 tool names present in the deployed JS.

**The honest contrast is cost, not incapacity.** Without the tools the agent still gets there — the
chart prints its values as text, so it reads them. What it cannot do is get there cheaply. That is
what the two runs below measure, and it is a stronger claim than "the agent guesses", because it
survives someone trying it.

**Both takes were shot in the ChatGPT desktop app's built-in browser** — the environment the judges
actually use. The requirements, all of them blocking:

- Desktop app only. Not mobile, not the web app.
- **GPT-5.6 Sol or Terra.** Luna has WebMCP disabled.
- Not available in Enterprise or Edu workspaces; also gated on rollout.
- **Enable site tools** — Settings → the built-in browser pane (its subtitle reads "Manage the
  built-in browser…") → *Permissions*. `settings.browserUse.webMcp`. It is **not** in *General*, and
  the ChatGPT docs' "Settings → Browser" wording points at the same pane by a different name.
- The composer's **Chat ↔ Work** toggle on **Work**. The built-in browser does not exist on the Chat
  side; asked from there, the model answers that it cannot open a browser.

**Two gates, both passed before filming (Aug 31):**

1. **Passed (Aug 31).** All 6 tools listed, and `compare_periods(north, 2026-02, 2026-03)` came back
   **−17.1% / −15.4%** — the §4 figures. Three things had to line up first, none of them the
   identifiers above: the app is the Codex-flavoured desktop build (`com.openai.codex`,
   `/Applications/ChatGPT.app`, 26.825.51511), the model is `gpt-5.6-terra` with
   `[plugins."browser@openai-bundled"] enabled = true` in `~/.codex/config.toml`, the toggle is
   `settings.browserUse.webMcp.label` = "Enable site tools", and the composer's mode switch is
   `composer.home.modeToggle`. The fallback, unused: Model Context Tool Inspector + Gemini, which
   needs `npm install` in the extension's directory to build `js-genai.js` (without it `sidebar.js`
   dies on its import and every button silently does nothing).
2. **Passed (Aug 31).** Under `?webmcp=off` the agent still reaches the number — it reads the values
   printed on the bars — so before and after are filmed in **the same environment, changing only the
   URL parameter**. Same model, same question, same page.

**Filmed (Sep 1), and the contrast is 7.7×.** The January question — "For the North store, what
happened to sales in January 2026? Compare the flavor breakdown against December and tell me if
anything looks off." — asked twice in the ChatGPT app, same model, same page, changing only
`?webmcp=off`:

| | Without tools (`?webmcp=off`) | With the tools |
|---|---|---|
| Time | **4 min 38 s** | **36 s** |
| Work | navigated the UI month by month; asked to download the page's JS data file (denied) | **5 tool calls** |
| Result | Dec/Jan table, pistachio 2,099 → 554 (−74%) | same, "fell from third-best seller to last" |

Both are right. The one without tools took **longer than the finished video**, and midway it asked
permission to download the dashboard's data file — i.e. to stop reading the screen. That was denied
on camera, on purpose: bypassing the rendered page is exactly what the video says an agent cannot do,
and in a real app with a backend that file would not be sitting there.

**The wording of question 1 had to change, and that is a finding, not a detail.** The original —
"Look at the flavor breakdown and tell me if anything looks off" — made the tool-driven agent fail
**twice in a row**: it fetched January only (`get_sales` + `get_top_flavors` + `compare_periods`) and
concluded the anomaly was *passion fruit*, the cheapest flavor per unit. With only one month of
flavor data, pistachio's 554 units is not remarkable. The agent without tools got it right precisely
because navigating the UI forced it through December as well. Asking for the comparison explicitly
fixes it without naming pistachio, and it is a question an owner would ask anyway.

**Agents are not deterministic, and the takes prove it.** Across five runs of the same question the
figures never moved — 15,826 units, $50,800, pistachio 554 against 2,099 — but the conclusion did:
"an anomaly specific to pistachio", "a sharp discontinuity", "a stock-out or an anomalous figure"
(that one in Spanish, from a run before the language fix), and twice
the wrong flavor entirely. Film what it says and rewrite the line.

**The narration was rewritten against the filmed runs and rebuilt: 2:32.3, drift 0.000, `HARD CAP
3:00 — OK`.** `Two minutes thirty-one seconds` → `Four minutes thirty-eight seconds`; `Three calls.
Eight seconds.` → `Five calls. Thirty-six seconds.`; the February cross-check dropped (this run
compared against December, not February) in favour of `Every other flavor rose about 24%` and
`It fell from third best seller, to last`, both of which the agent said on camera; and one new beat
covers the download attempt.

**Assembled.** `video/raw-before.mov` (6:27) and `video/raw-after.mov` (3:23) concatenated to
`video/raw.mov`, then:

```bash
VIDEO_DIR=$PWD/video python3 ~/.claude/skills/personal-record-video/scripts/fit-to-audio.py video/raw.mov \
  --beats 0,15,293,387,442,478,484,505 --max-speed 20
VIDEO_DIR=$PWD/video OUTRO="$PWD/video/endcard.png:4" \
  bash ~/.claude/skills/personal-record-video/scripts/build-video.sh video/out/raw-fitted.mov
```

→ `video/out/demo.mp4`, **1920×1080, 2:36.3**, plus `video/out/demo.en.srt`.

**No title slide, one end card.** `SLIDE_DUR` has to equal beat 1's full length (12.6 s), and beat 1
narrates the dashboard — a title card there would replace the thing being described. The outro is
`video/endcard.png`, 4 s appended (`OUTRO_REPLACE=0`, so it extends rather than covering narration):
logo mark, name, live URL in indigo mono, repo, `MIT · The WebMCP Challenge`. Rendered from
`video/endcard.html` through headless Chrome so it picks up the real IBM Plex faces and the §7 tokens; no
amber anywhere, since amber means the agent wrote something. The live URL is also visible in the
built-in browser's address bar for the whole video. The `--max-speed 20`
is needed for beat 2: 278 s of the agent grinding through the UI compressed into 21 s of narration.
The marks came from reading the app's own `Working for Xm Ys` timer off a probe frame — at t=150 s
it read `2m 15s`, so the question was sent at t=15 s.

`video/chatgpt-run.md` has the setup and the exact prompts; `video/shotlist.md` has both takes.

**Environment, verified and used (Sep 1):** the four requirements above all met, model
`5.6 Terra`, sidebar collapsed so no project names reach the frame. Claude drove the app through computer-use for both takes; the human only pressed
`Cmd+Shift+5`.

**The language fix is not where it looks, and deleting the line is not enough.** Settings → General
→ *Language* is already English. Removing the literal line `- Responder siempre en español` from
*Personalization → Custom instructions* still produced Spanish answers, because the rest of that document is written in
Spanish and the model mirrors it. What worked was adding an explicit **`- Always answer in English.`**
line. Restore both after the shoot — it applies to every chat on the machine.

**Pipeline trap:** `build-audio.sh` wipes `video/out/` entirely. After any narration edit, redo the
fit as well, not just `build-video.sh`.

**Gate: met (Sep 1).** https://youtu.be/dK6HtZhCsRE — public, 2:36, with the narration track and `demo.en.srt` uploaded as
the English caption track. Title, description, live URL and repo link all set on the video.

### Stage 9 — Devpost submission

**Submitted (Sep 1) → https://devpost.com/software/sundae-metrics.** `docs/devpost.md` records the
entry as submitted — the description body plus the six form fields that live nowhere else in the
repo (testing instructions for judges, agents tested with, AI tools used, submitter type, country,
app status). Edits stay open until Sep 3, 1:00 PM PT; the §12 freeze starts after that, not now.

What the entry carries beyond the plan's list: the measured 4m 38s vs 36 s / 5 tool calls table; why
question 1 had to be reworded (a tool that answers one month invites a one-month answer); the silent
Chrome limits; and testing instructions for judges with both prompts verbatim, the site-tools toggle
path for each browser, and `?webmcp=off` as the built-in A/B.

Three parts of the flow needed the human, and no amount of automation removes them: the hackathon
registration (personal data plus two "I have read and agree" boxes), a reCAPTCHA on *Start project*,
and the Terms & Conditions checkbox on the final Submit.

**Description edited after submitting (Sep 1, still inside the window).** A documentation audit found
two things wrong in the text that had been sent: the "pixels do not carry values / unsolvable"
framing, which the filmed measurement contradicts, and `webmcp#11` cited as the trust model when it
is titled "Prompt injection". Both fixed on the entry, and the same fixes propagated to `README.md`,
§1–§2 here and `docs/devpost.md`. Two empty Devpost template headings that had been left at the top
and bottom of the description were also removed. **Typing into the textarea is the only reliable way
to edit it** — setting the field's value programmatically looked right on screen and saved nothing.

The description covers what the stage asked for — why WebMCP fits this use case, what user and
agent can do together that they couldn't before, the technical detail — and all three free wins: the
KPI vocabulary borrowed from products already sold to real ice cream shops (§2), `order: "bottom"`
answering the slow-mover KPI with one parameter instead of a seventh tool, and no tool carrying
`untrustedContentHint` with the reason stated.

**Gate: met (Sep 1).** https://devpost.com/software/sundae-metrics — public repo, live URL and the video all attached.

---

## 11. End-to-end verification — **run and passed (Sep 1)**

```bash
npm test && npm run build && npm run preview
```

**Both agent paths have to be checked, and the ChatGPT one comes first** — it is the environment the
judges use, and stage 7 was reopened precisely because the docs only covered the flag.

**A. ChatGPT desktop app**, built-in browser, requirements per §10 stage 8 (desktop app · Sol or
Terra · *Enable site tools* · composer on **Work**):

1. "List the site tools this page exposes" returns all 6 names.
2. `compare_periods(north, 2026-02, 2026-03)` comes back **−17.1% / −15.4%** — the §4 figures.
3. The January question fills the rail with 5 entries and no more; question 0 leaves none.

**B. Chrome** with `chrome://flags/#enable-webmcp-testing` on, against the preview:

1. The Tool Inspector lists all 6 tools with their schemas (the extension needs Chrome 150+).
2. `get_sales({store:"north", month:"2026-03"})` returns 39,871 — **the same number the March bar and the KPI card show**.
3. `compare_periods({store:"north", monthA:"2026-02", monthB:"2026-03"})` returns `-17.1`.
4. `set_dashboard_view({store:"south"})` changes the screen, shows the amber toast, and leaves a `WRITE`-marked entry in the log.
5. `?webmcp=off`: the dashboard renders identically and the rail shows the `1e` state.

---

## 12. Delivery checklist

- [x] Public GitHub repo with an open source license visible **in the About section** — the `LICENSE` file alone isn't enough, it has to be detectable there.
- [x] Live URL — https://sundae-metrics.vercel.app — working in Chrome with WebMCP enabled.
- [x] Demo video, under 3 minutes, on YouTube, with audio — https://youtu.be/dK6HtZhCsRE (2:36, public).
- [x] Written description (§10, stage 9) — https://devpost.com/software/sundae-metrics
- [x] README that assumes nobody runs the code (§10, stage 7).
- [x] **The no-flag path documented** in the README and in the app's `1e` state (§10, stage 7).
- [x] Submitted **Sep 1, 2026** — two days early. Devpost confirms edits stay open until Sep 3, 4:00 PM EDT.

### No client, no agent — checked, settled (Aug 30)

**The challenge does not ask for one.** The required components are a working live URL, a text
description, a public repo with the license visible in About, and a demo video under 3 minutes. The
agent is supplied by the judge: *"Provide a working live URL that judges can access using ChatGPT's
in-app browser or Google Chrome with WebMCP enabled."* The brief is to build the page that exposes
the tools, not the software that consumes them — which is what this is. None of the four judging
criteria mentions a client either.

The four criteria, equally weighted:

- **WebMCP Leverage** — thorough, skilled, non-trivial use of the standard
- **Execution** — a complete, coherent product, past proof-of-concept
- **Potential Impact** — credibly solves a real problem for a real audience
- **Creativity & Ambition** — a novel concept, not a restatement of existing solutions

### Rules that can wreck an otherwise good submission

- **One submission per person** — probably. The official rules contradict themselves ("no more than one Submission" vs. "each of the Entrant's other Submissions" in the same sentence); a Devpost forum question from Aug 26 went unanswered. Don't build a second project just in case — assume it's one.
- **After Sep 3, 1:00 PM PT, nothing gets touched** — not the Devpost entry, not the repo, not the live site — until winners are announced on **Sep 23**. Touching any of the three during judging risks eligibility. To keep improving, fork and work on the copy. This also means **Vercel has to stay live for those three weeks** — the free tier covers it, but don't tear it down thinking the demo is over.

---

## 13. Out of scope

Hourly granularity (a real KPI, but it multiplies data volume ~700× without strengthening the WebMCP pitch — the point is the exact number, not the sampling rate). `channel` (counter / dine-in / delivery) and `get_channel_mix` — only if the base dashboard and the 6 tools are done with room to spare, and then re-check the 1,500-char output ceiling. Stock control, backend, auth, UI tests, dark mode, animation beyond the write-toast pulse, and responsive beyond looking right at 1280px (the recording width).

---

## 14. Reference links

**Delivered**
- [youtu.be/dK6HtZhCsRE](https://youtu.be/dK6HtZhCsRE) — the demo video, 2:36, public, captioned
- [devpost.com/software/sundae-metrics](https://devpost.com/software/sundae-metrics) — the submitted entry
- [sundae-metrics.vercel.app](https://sundae-metrics.vercel.app) — the live URL the judges open
- [github.com/gmassello/sundae-metrics](https://github.com/gmassello/sundae-metrics) — the public repo

**Hackathon**
- [webmcp.devpost.com](https://webmcp.devpost.com/) — the submission page
- [openai.com/webmcp-challenge](https://openai.com/webmcp-challenge/) — the announcement and framing
- [webmcp.devpost.com/rules](https://webmcp.devpost.com/rules) — judging criteria and the eligibility rules in §12
- Deadline: **Sep 3, 2026, 1:00 PM PT** · winners **Sep 23**

**Standard and types**
- [`webmcp-types@0.1.5` index.d.ts](https://app.unpkg.com/webmcp-types@0.1.5/files/index.d.ts) — the source that settles where `annotations` goes (§5, rule 1)
- [webmachinelearning/webmcp issue #11](https://github.com/webmachinelearning/webmcp/issues/11) — "Prompt injection", open
- [webmachinelearning/webmcp issue #176](https://github.com/webmachinelearning/webmcp/issues/176) — "Hint for reversible or consequential actions", open. Together with #11 these are the gap the AgentActivityLog answers at product level (§2)

**Chrome and testing**
- [Site tools in ChatGPT](https://learn.chatgpt.com/docs/webmcp) — the no-flag path, and its exact requirements: desktop app's built-in browser only (no mobile, no web), **GPT-5.6 Sol or Terra** (Luna has WebMCP disabled), not available in Enterprise or Edu workspaces, the *Settings → Browser → Permissions → Enable site tools* toggle, **and the composer's Chat ↔ Work toggle on Work** — the built-in browser does not exist on the Chat side, and the model just answers that it cannot open a browser. Its UI is **Site tools** in the address bar, with *Available site tools* and *Recently used*
- [Secure WebMCP tools](https://developer.chrome.com/docs/ai/webmcp/secure-tools) — the character limits in §5
- `chrome://flags/#enable-webmcp-testing` — the flag; without it `document.modelContext` is `undefined`
- [Model Context Tool Inspector](https://github.com/beaufortfrancois/model-context-tool-inspector) — lists registered tools and their schemas
- [WebMCP evals](https://developer.chrome.com/docs/ai/webmcp/evals) — test tools before filming
- [Lighthouse: registered WebMCP tools](https://developer.chrome.com/docs/lighthouse/agentic-browsing/registered-webmcp-tools)

**Sponsor credits (stage 0 — closed)**
- **Vercel:** US$30 in build credits, code `OAIWEBMH-9E2F-MUT4` — first 1,000
- **Render:** US$50 in credits, valid 1 year — only 500 slots
- **Netlify:** 3,000 credits, requires a form — first 1,000

None claimed; the project deployed on Vercel's free tier and never needed them. Kept as a record of
what was on the table.

---

## 15. In plain language

Today, if you ask an AI assistant about a number on a chart, it has to work the screen like a person would: click around, wait for things to load, and piece the answer together. It usually gets there. What it costs is time — filmed side by side, the same question took four minutes and thirty-eight seconds that way, and thirty-six seconds when the page just hands over the number.

This builds a sales page for an ice cream chain with four locations, where the assistant doesn't have to look at anything: the page itself offers it six "questions it can ask" and answers with the exact number. One of those six runs the other way — the assistant changes what *you* are seeing, so if you say "show me the South location", the screen changes in front of you.

On the side there's a panel logging every query the assistant made, color-coded by whether it only read data or actually changed something. Nothing is hidden: you watch, live, what it asked and what it got back.
