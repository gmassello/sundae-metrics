# Project Brief — WebMCP Challenge

**Hackathon:** [The WebMCP Challenge](https://webmcp.devpost.com/) (Devpost) · [openai.com/webmcp-challenge](https://openai.com/webmcp-challenge/) · rules: [webmcp.devpost.com/rules](https://webmcp.devpost.com/rules) · deadline **Sep 3, 2026, 1:00 PM PT (5:00 PM ART)**.

**Chosen use case:** Sales dashboard for a multi-location business, with WebMCP tools that return exact data instead of forcing the agent to read charts.

**Project name: `sundae-metrics`.**

This document is the input for building the project in Claude Code. It contains the concept, the justification against the hackathon's judging criteria, the data model, the full list of tools to implement, the suggested technical structure, and the delivery checklist.

> **⚠️ Correction applied (Aug 27) — a real bug in the section 3 code.** The original example passed `readOnlyHint` as the second argument to `registerTool()`. Verified against the official types (`webmcp-types@0.1.5`, [unpkg.com/browse/webmcp-types@0.1.5/files/index.d.ts](https://app.unpkg.com/webmcp-types@0.1.5/files/index.d.ts)): **`annotations` is a property of the first object (the tool definition), not the second.** The second argument only accepts `signal` and `exposedTo`. Left as it was, `readOnlyHint` would have been silently ignored and none of the tools would have declared their security hints correctly — fixed below.

---

## 1. The concept

**Product:** *Sundae Metrics* — a sales dashboard for **Glacé**, a fictional chain of 4 artisanal ice cream shops. The owner has no data analyst: today everything gets exported to Excel to answer simple questions.

**The scene being demonstrated:** the owner (or the judge) types to the agent, looking at the same dashboard on screen:

> "How much did sales at the North location grow between February and March, in percentage terms?"

- **Without WebMCP**, the agent has to interpret a bar chart rendered in SVG/canvas: there's no way to precisely read the height of a bar, so it guesses or makes up a number.
- **With WebMCP**, the dashboard exposes a `get_sales({store, month})` tool that returns the exact number. The agent makes two calls and computes the change from real data.

This is the "before/after" contrast that the video captures. The full detail of that comparison (with code for both sides) is summarized in section 6.

**Why this case hits all 4 judging criteria directly** (equal weight, per the rules at [webmcp.devpost.com/rules](https://webmcp.devpost.com/rules)):

| Criterion | How this case covers it |
|---|---|
| WebMCP Leverage | The tools aren't decorative: without them, the task (reading an exact number off a chart) is literally impossible to solve well. |
| Execution | A dashboard with 3-4 views + 5-6 tools is a complete, demonstrable product within the hackathon timeframe. |
| Potential Impact | Concrete audience: SMBs with multiple locations and no data analyst. Real problem: today they export everything to Excel. |
| Creativity & Ambition | Not another checkout flow — avoids competing directly with the official e-commerce demos from Cloudflare/Vercel/OpenAI. |

### Real-world KPI language — where Glacé's vocabulary comes from

Before inventing ice cream shop metrics from scratch, I checked what the products that actually sell dashboards to real ice cream shops offer: HioPOS, Sipos, OmniPOS, Vendty, OrdenApp and bcnsoft in Argentina/Spain; Restroworks, GETPOS, MYR POS and Focus POS internationally. They all sell, under nearly identical names, the same handful of KPIs:

| Real category (this is what these products call it) | How it enters Sundae Metrics |
|---|---|
| Hourly sales / peak hours | `get_sales` at monthly granularity as the MVP; a natural extension to hourly granularity if time allows (see section 2) |
| Best-selling flavors **and slow movers** | `get_top_flavors` — extended to return both ends, not just the top ranking (see section 3) |
| Channel performance (counter / dine-in / delivery) | Out of scope for the 7-day MVP — documented as a product extension in section 3 |
| Stock control / waste reduction | Out of scope — the brief doesn't model inventory, and saying so plainly in the submission is more credible than faking it |
| Remote multi-location access | This is the whole dashboard: that's why Glacé has 4 locations, not 1 |

This isn't decoration: it gives the "Potential Impact" section of the pitch something better than "I think an ice cream shop owner would find this useful" — it gives it "this is literally what's already being sold to ice cream shop owners, with the difference that here the agent can ask directly instead of the owner staring at a chart." Worth a line like that in the submission description.

**Note on the judging process:** the rules mention a viability filter ("Stage One") before the four criteria above are evaluated ("Stage Two"). In practice: the dashboard working end-to-end — it loads, shows data, the tools respond — is the condition for everything else to score. It's not one more criterion, it's the floor.

**Why the `AgentActivityLog` (section 5) isn't a cosmetic detail:** prior research found that the security section of the WebMCP draft was empty for a while, and that the user/agent/site trust model is still unresolved in the standard ([issue #11](https://github.com/webmachinelearning/webmcp/issues/11)). A panel that shows, live and unambiguously, which tool the agent called and with what data is, quite simply, the product answer to that gap — and it's exactly what the "thoughtful use of WebMCP" criterion is looking for, without you having to explain it in the video.

---

## 2. Data model (mock, no real backend)

Everything can live in a static JSON file or an in-memory array — no database needed for the hackathon.

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
  revenue: number;        // ARS
  // channel?: "counter" | "dine_in" | "delivery";  // v2 — see note below, not for the 7-day MVP
};
```

**Generate 12 months × 4 locations × 6 flavors** with simple seasonality (more sales in summer, dulce de leche always on top, one flavor with a sharp drop in a specific month so the "why did it drop" question has an interesting answer). A `scripts/seed-data.ts` script that generates this JSON once is enough.

**Two extensions that match real KPIs from the industry (section 1) but are NOT for the MVP** — noted here so they aren't lost, not so they get built this week:

- **Hourly granularity** ("hourly sales, peak hours" is a KPI these products sell as a differentiator): swap `month` for a timestamp and generate 24 data points per day instead of 1 per month. Multiplies data volume by ~700x without adding value to the WebMCP pitch — the point of the project is the exact number, not the frequency at which it's measured. Leave it for a v2.
- **`channel`** (counter/dine-in/delivery, commented out above): only add it if the base dashboard + the 6 tools are done with room to spare. If you add it, add a `get_channel_mix({store, month})` tool and re-check that the output doesn't exceed the 1,500-character limit from section 3.

---

## 3. WebMCP tools to implement

Register all of them with `document.modelContext.registerTool()`. The security hints (`readOnlyHint`, `untrustedContentHint`) go **inside the tool object**, under `annotations` — not as a second argument (see correction above).

| Tool | What it does | Input | Output | `readOnlyHint` |
|---|---|---|---|---|
| `list_stores` | Lists the available locations | — | `[{id, name, city}]` | `true` |
| `get_sales` | Exact sales for one location in a given month | `{store, month}` | `{units, revenue, byFlavor: [...]}` | `true` |
| `compare_periods` | % change between two periods, already computed server-side (don't make the agent do the math) | `{store, monthA, monthB}` | `{revenueChangePct, unitsChangePct}` | `true` |
| `get_top_flavors` | Flavor ranking by sales, from the top **or the bottom** | `{store?, month?, limit, order?: "top" \| "bottom"}` | `[{flavor, units, revenue}]` | `true` |
| `get_summary` | Aggregate across all locations over a date range | `{dateFrom, dateTo}` | `{totalRevenue, byStore: [...]}` | `true` |
| `set_dashboard_view` | Changes what the user sees (active store + date range) | `{store?, dateFrom?, dateTo?}` | `{ok: true, applied: {...}}` | **`false`** |

`set_dashboard_view` is the only one that mutates state (what the user sees), which is why it's the only one with `readOnlyHint: false` — keep that explicit in the code even though `false` is the default; it shows a judge reading the repo that you understood the distinction, not that you forgot the hint. It's also the most important tool for the challenge's pitch: it's what makes visible, live and on screen, that the agent is acting *on the same interface* the user is looking at — the core point of OpenAI's message ("apps that get meaningfully better when people and their agents use them together").

**Why `order` on `get_top_flavors` isn't a whim:** the real KPI that HioPOS/Sipos/GETPOS sell isn't "flavor ranking" by itself, it's "which flavors are most popular **and which ones are slow movers**" — both ends together, because an ice cream shop owner uses that second half to decide what to drop from the menu. With `order: "bottom"` free in the same tool, the video's question can be "which flavor should the South location drop?" instead of just "what's the best seller?" — more interesting and truer to the real KPI, without adding a new tool.

**None of them need `untrustedContentHint: true`** — that hint is for when a tool's output includes content that came from an untrusted third party (text another user submitted, for example) that the agent shouldn't treat as instructions. Here all the data is generated by you in the seed script, there's no external user input. Worth stating explicitly in the submission description — it shows you know the hint exists and used it with judgment, not that you didn't know about it.

### Platform limits — don't skip these

Verified against [Chrome's security guide](https://developer.chrome.com/docs/ai/webmcp/secure-tools). Exceeding them doesn't throw an error: **the tool gets silently ignored.**

| Field | Limit |
|---|---|
| tool or parameter `name` | 30 characters |
| tool `description` | 500 characters |
| parameter `description` | 150 characters |
| tool output (`content`) | 1,500 characters |

The 6 tools in the table are comfortably within the name and description limits. The one to watch is the **output**: `get_summary` with many locations and `get_top_flavors` with a high `limit` are the ones most likely to exceed 1.5K if the JSON isn't trimmed. Truncate or paginate before sending it — never assume "4 locations × 6 flavors total" will never grow.

### Implementation example (corrected)

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
    content: [{ type: "text", text: JSON.stringify(getSalesFromState(store, month)) }]
  })
});
```

The one with both ends of the real-world KPI (best seller / slow mover):

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
    content: [{ type: "text", text: JSON.stringify(getTopFlavors({ store, month, limit, order })) }]
  })
});
```

And the only one that mutates state, with `readOnlyHint: false` explicit:

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
    applyDashboardView(input); // updates React/Zustand state
    return { content: [{ type: "text", text: `View updated: ${JSON.stringify(input)}` }] };
  }
});
```

---

## 4. Suggested technical stack

Built for speed in Claude Code and deployed on a challenge partner (Vercel is on the recommended hosting list).

- **Framework:** Vite + React + TypeScript (lightweight, without Next's SSR complications for a dashboard that runs 100% client-side — WebMCP needs the browser's JS to register the tools, so avoid server-only rendering for that part).
- **Charts:** Recharts (bars, lines) — keep the accessibility descriptions/tooltips, but *don't* rely on them as the agent's data source; that's the whole point of the project.
- **Styling:** Tailwind CSS.
- **State:** Zustand, or just `useState`/context — the dashboard is small.
- **Data:** Static JSON generated by the seed script, imported directly (no backend).
- **Deploy:** Vercel (free, from the challenge's partner list).
- **WebMCP testing:**
  - **Your Chrome already works** — verified today: version 151 on your Mac, well above the minimum (149). Just flip the flag: `chrome://flags/#enable-webmcp-testing` → Enabled → relaunch. With the flag on, `document.modelContext` stops returning `undefined`.
  - Install before writing code: the **[Model Context Tool Inspector](https://github.com/beaufortfrancois/model-context-tool-inspector)** extension — shows you which tools got registered and their schema, no guessing. There's also native debugging in Chrome DevTools.
  - **[WebMCP evals](https://developer.chrome.com/docs/ai/webmcp/evals)** (Google) — to test the tools before filming the video, instead of discovering a broken schema during the demo.
  - ChatGPT desktop's built-in browser (native support) — test there too, it's probably where the judges will look. **Important:** use **GPT-5.6 Sol or Terra** — **Luna has WebMCP disabled**, and if you test with Luna you'll think your code is broken when the problem is the model. It also doesn't work in Enterprise or Edu workspaces.
  - Lighthouse audit to list registered tools: https://developer.chrome.com/docs/lighthouse/agentic-browsing/registered-webmcp-tools

### Credits to claim today — first-come, first-served

You're already deploying to Vercel, so the first one is a direct hit:

| Sponsor | What | Cap |
|---|---|---|
| **Vercel** | US$30 in build credits with code **`OAIWEBMH-9E2F-MUT4`** | first 1,000 |
| **Render** | US$50 in credits, valid for 1 year | only **500** slots |
| **Netlify** | 3,000 credits (requires filling out a form) | first 1,000 |

They don't change the project's architecture, but it's free money with an expiration date — claim them before you start coding, not after.

---

## 5. Suggested folder structure

```
sundae-metrics/
├── src/
│   ├── data/
│   │   ├── seed-data.ts        # generates the mock JSON
│   │   └── sales.json
│   ├── lib/
│   │   ├── webmcp-tools.ts     # registers all the tools
│   │   └── queries.ts          # getSalesFromState, compare, etc.
│   ├── components/
│   │   ├── SalesChart.tsx
│   │   ├── StoreSelector.tsx
│   │   ├── DateRangePicker.tsx
│   │   └── AgentActivityLog.tsx   # shows live which tool the agent called (key for the demo)
│   ├── App.tsx
│   └── main.tsx
├── scripts/
│   └── seed-data.ts
├── README.md
└── package.json
```

**`AgentActivityLog.tsx`** is a strong recommendation: a small panel that shows "🔧 get_sales(north, 2026-03) → $412,300" as the agent calls tools. It makes visible in the video exactly what the judges need to see, without you having to narrate it.

Visually distinguish **reads vs. writes** in that log — a different icon or color for calls with `readOnlyHint: true` versus the one with `false` (`set_dashboard_view`). It's free to implement (you already have the data on each tool) and turns a security hint that would otherwise stay buried in the code into something the judges see on screen without you explaining it.

---

## 6. The before/after contrast (for the video script)

**Before (without WebMCP) — steps an agent limited to scraping/clicking would have to take:**

1. Screenshot the dashboard.
2. Find the store selector in the DOM (a `<select>`? a custom combobox?).
3. Simulate a click + synthetic event to pick "North."
4. Wait for the re-render with no clear signal that it finished.
5. Measure the height of February's bar in pixels. *(non-deterministic)*
6. Measure the height of March's bar in pixels. *(non-deterministic)*
7. Convert pixels to a sales value by eye. *(non-deterministic)*
8. Compute the % change on an already-uncertain number.

**After (with WebMCP):**

```js
await get_sales({ store: "north", month: "2026-02" });
await get_sales({ store: "north", month: "2026-03" });
// or directly:
await compare_periods({ store: "north", monthA: "2026-02", monthB: "2026-03" });
```

Two calls (or one), exact data, zero guessing.

**For the video:** film the "before" for real (you can simulate it with a browser-navigating agent like Claude in Chrome or Computer Use attempting the same question without the tools registered) — a staged contrast is far less convincing than a real one, and "Execution" is one of the four criteria. This session has access to a browser with Claude — once the dashboard is deployed, I can attempt the "before" question myself with no tools registered and record that part.

---

## 7. Delivery checklist (Devpost)

- [ ] Public repo (GitHub) with an open source license visible **in the repo's About section** — having the LICENSE file alone isn't enough, it has to be detectable there.
- [ ] Live URL, working in Chrome with WebMCP enabled or in ChatGPT's browser.
- [ ] Demo video, under 3 minutes, on YouTube, with audio explaining what's shown.
- [ ] Written description covering: why WebMCP fits this use case, what user and agent can do together that they couldn't before, and the technical implementation detail.
- [ ] **A README that assumes no one will run your code.** The challenge FAQ says, verbatim, that judges "may test your project, but they're not required to — they can judge based on your description and repo alone." Write the README as if that's the only read it's going to get.
- [ ] Register before **September 3rd, 2026, 1:00 PM PT** (5:00 PM ART).

### Rules that can wreck an otherwise good submission

- **One submission per person** — probably. The official rules contradict themselves (they say "no more than one Submission" and in the same sentence refer to "each of the Entrant's other Submissions"). Someone asked about it on the Devpost forum on August 26th and **it's still unanswered**. Don't build a second project "just in case" — assume it's one.
- **After September 3rd, 1:00 PM PT, nothing gets touched** — not the Devpost submission, not the repo, not the live site — until winners are announced on **September 23rd**. Touching any of the three during judging puts eligibility at risk. If you want to keep improving the project after submitting, fork the repo and work on the copy, leaving the submission untouched. This means **Vercel has to stay paid/live for those three weeks** — the free tier covers it, but don't tear it down thinking you've already shown it.

---

## 8. Next steps (to get started in Claude Code)

0. **Before writing any code:** flip on `chrome://flags/#enable-webmcp-testing`, install the Model Context Tool Inspector, and claim the Vercel/Render/Netlify credits from section 4 — first-come, first-served.
1. `npm create vite@latest sundae-metrics -- --template react-ts`
2. Build `scripts/seed-data.ts` and generate `src/data/sales.json`.
3. Build the base dashboard (chart + store selector + date range) *without* WebMCP yet — make it work well for a human first.
4. Register the 6 tools from section 3 in `src/lib/webmcp-tools.ts`, with `annotations` placed correctly (not as a second argument).
5. Add the `AgentActivityLog` to make every tool call visible, distinguishing reads from writes.
6. Test in Chrome with the flag enabled and in ChatGPT desktop's browser (Sol or Terra model, not Luna).
7. Record the "before" (agent without tools) and the "after" (agent with tools) for the video.
8. Deploy to Vercel, write the submission description, upload to Devpost — repo with the license visible in the About section.
