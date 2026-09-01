# Sundae Metrics

A sales dashboard for **Glacé**, a fictional chain of 4 artisanal ice cream shops, that hands an agent six tools instead of a picture of a chart. Built for [The WebMCP Challenge](https://webmcp.devpost.com/).

**Live:** [sundae-metrics.vercel.app](https://sundae-metrics.vercel.app) · open it in the ChatGPT desktop app's built-in browser, which supports WebMCP with no setup — or in Chrome 149+ with `chrome://flags/#enable-webmcp-testing` enabled ([details below](#trying-it)).

![Sundae Metrics with an agent reading and writing the dashboard](docs/screenshot.png)

## The problem

The owner of the chain asks an assistant, while looking at this same screen:

> "How much did sales at the North location change between February and March?"

Without WebMCP, an agent that can only screenshot and click has to: find the store selector in the DOM, synthesize a click, wait for a re-render with no signal that it finished, measure the height of the February bar in pixels, measure March, convert pixels to dollars by eye, and compute a percentage on an already-uncertain number. Three of those steps are guesses, and the answer comes back confident anyway.

With the tools registered, it is one call:

```js
await compare_periods({ store: "north", monthA: "2026-02", monthB: "2026-03" });
// {"revenueChangePct":-17.1,"unitsChangePct":-15.4}
```

The dataset carries a second case that pixels cannot reach at all. In January 2026 the North location's pistachio sales collapse from 2,099 units to 554 — a supply shortage. The month's total revenue is unchanged, so **the bar on the chart does not move**. Nothing on screen shows it. `get_top_flavors({ store: "north", month: "2026-01", limit: 3, order: "bottom" })` shows it immediately.

## The 6 tools

Registered with `document.modelContext.registerTool()` from [`src/lib/webmcp-tools.ts`](src/lib/webmcp-tools.ts).

| Tool | What it does | Input | Output | `readOnlyHint` |
|---|---|---|---|---|
| `list_stores` | Lists the locations on this dashboard | — | `[{id, name, city}]` | `true` |
| `get_sales` | Exact units and revenue for one location in one month | `{store, month}` | `{units, revenue, byFlavor: [...]}` | `true` |
| `compare_periods` | Percentage change between two months | `{store, monthA, monthB}` | `{revenueChangePct, unitsChangePct}` | `true` |
| `get_top_flavors` | Flavor ranking, best sellers **or slow movers** | `{store?, month?, limit, order?}` | `[{flavor, units, revenue}]` | `true` |
| `get_summary` | Revenue across every location over a date range | `{dateFrom, dateTo}` | `{totalRevenue, byStore: [...]}` | `true` |
| `set_dashboard_view` | Changes what the user is looking at | `{store?, dateFrom?, dateTo?}` | `{ok: true, applied: {...}}` | **`false`** |

Real calls and real responses, straight from the page:

```js
await get_sales({ store: "north", month: "2026-03" });
// {"units":12410,"revenue":39871,"byFlavor":[
//   {"flavor":"dulce_de_leche","units":4105,"revenue":13186},
//   {"flavor":"chocolate","units":2940,"revenue":9443},
//   {"flavor":"pistachio","units":1810,"revenue":6215}, ...]}

await get_top_flavors({ store: "south", month: "2026-03", limit: 3, order: "bottom" });
// [{"flavor":"passion_fruit","units":410,...},{"flavor":"lemon","units":695,...},
//  {"flavor":"strawberry","units":1105,...}]

await set_dashboard_view({ store: "north", dateFrom: "2026-02-01", dateTo: "2026-03-31" });
// {"ok":true,"applied":{"store":"north","monthFrom":"2026-02","monthTo":"2026-03"}}
```

`39,871` is the number `get_sales` returns, the number printed on the March bar, and the number in the KPI card — because [`src/lib/queries.ts`](src/lib/queries.ts) is the only place in the codebase that computes anything. The dashboard and the tools call the same pure functions, so a chart value and a tool value cannot drift apart.

`order: "bottom"` is not decoration. The KPI that HioPOS, Sipos and GETPOS actually sell to ice cream shops is "best sellers **and** slow movers", because owners use the second half to decide what to drop from the menu. It costs one parameter, not a seventh tool.

## Why WebMCP is what makes this work

**The tools are not a convenience layer.** Reading an exact figure off a rendered chart is not a hard problem for an agent — it is an unsolvable one. Pixels do not carry values. Six tools turn a picture into an API without asking the user to leave the page they are already on.

**`set_dashboard_view` runs the other way.** It is the only tool with `readOnlyHint: false`, declared explicitly even though `false` is the default. Ask for the South location and the screen changes in front of you: the agent acts on the same interface the human is looking at, rather than on a copy of the data somewhere else.

**The Agent activity rail is the security answer, not chrome.** The user/agent/site trust model is still open in the standard ([webmcp#11](https://github.com/webmachinelearning/webmcp/issues/11)). This dashboard's response is to make every call visible as it happens: tool name, input, output, elapsed time, output size against Chrome's 1,500-character ceiling, and an `Undo` on the one call that changed something. Indigo means the agent read; amber means the agent wrote. Nothing an agent does here is invisible.

**No tool carries `untrustedContentHint`,** and that is a decision, not an omission: every value comes from a committed seed file, so no tool output can carry third-party text the agent might read as instructions.

## Trying it

**In ChatGPT — nothing to enable in a browser.** Its [built-in browser supports WebMCP out of the box](https://learn.chatgpt.com/docs/webmcp).

1. The **desktop app** (not the web app, not mobile), on **GPT-5.6 Sol or Terra** — Luna has WebMCP disabled. Not available in Enterprise or Edu workspaces.
2. *Settings → Browser → Permissions → **Enable site tools***.
3. Open the live URL there. **Site tools** in the address bar lists all six under *Available site tools*, and every call shows up under *Recently used*.
4. Ask the February-to-March question and watch the rail fill up.

**In Chrome — one flag.**

1. Chrome 149+ (151 verified). Open `chrome://flags/#enable-webmcp-testing`, set it to **Enabled**, relaunch.
2. Open the live URL. The header badge should read **WebMCP · 6 tools**; the [Model Context Tool Inspector](https://github.com/beaufortfrancois/model-context-tool-inspector) lists all six with their schemas.
3. Ask your agent the February-to-March question and watch the rail fill up.

In a browser without WebMCP support, `document.modelContext` is `undefined`. The page detects that, says so in the rail, and keeps working as a plain dashboard — the human side never depends on the agent side. Adding `?webmcp=off` to the URL forces that same state on purpose: it is the "before" shot of the demo.

## Running it locally

```bash
npm install
npm run dev      # Vite dev server
npm test         # 56 tests, all pure logic
npm run build    # tsc -b && vite build
```

`src/data/sales.json` (288 records: 12 months × 4 locations × 6 flavors) is committed. It is generated by `node scripts/seed.ts` with no randomness at all — running the seed twice produces a byte-identical file, and `src/lib/queries.test.ts` is the only place in the repo where the expected figures are written by hand.

## Stack

Vite + React + TypeScript, client-side only, no backend. Plain CSS with custom properties, no Tailwind. The chart is twelve `div`s with percentage heights, no charting library. State is a module-level store exposed through `useSyncExternalStore` — mutable from outside React, which is exactly what `set_dashboard_view` needs. Two dev dependencies beyond the template: `vitest` and `webmcp-types`.

`docs/PLAN.md` is the full build plan: data model, the fixed dataset, the tool contracts and the design tokens.

## License

MIT — see [LICENSE](LICENSE).
