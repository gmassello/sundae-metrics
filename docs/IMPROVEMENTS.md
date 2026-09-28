# Improvements after the WebMCP Challenge

The challenge closed with 10 winners out of ~2,473 entries. Sundae Metrics was not among them. This document compares our entry with the winning ones and lists what we would change. Nothing here has been applied yet; it is the backlog for a later iteration.

## What the winners had in common

| Project | What it does | Stack | Tools |
|---|---|---|---|
| [MASIL](https://devpost.com/software/masil-reconnecting-korean-elders-to-creative-life) | Calligraphy and Janggi for Korean elders | Next.js, WebGPU, ONNX Runtime Web | Measured eval: 6/30 without WebMCP → 28/30 with it |
| [Alza](https://devpost.com/software/alza) | Floor-plan photo → 2D editor → walkable 3D | React, Three.js, Zustand, Playwright | 31 + 1 contextual, cross-origin tools |
| [ArchMorph](https://devpost.com/software/archmorph) | Residential architecture studio, 2D/3D/walk mode | Next.js, React, Three.js | 57 |
| [Aisle](https://devpost.com/software/aisle-ai-wedding-seating) | Wedding seating planner | React, Vite, shadcn, Zustand | 41, some registered by state |
| [Roque Nights](https://devpost.com/software/roque-nights-plan-the-sky-with-your-agent) | Astronomy observing planner | React 19, Zustand, astronomy-engine | 15 + 1 declarative form |
| [Observatory](https://devpost.com/software/observatory-vtphg9) | Local-first fantasy map builder | Vue 3, Pinia, PixiJS, IndexedDB | Revision guards, idempotent ops, approval tokens |
| [Bouquet Studio](https://devpost.com/software/bouquet-studio) | Flower shop: describe the feeling, shape the bouquet | React, Cloudflare Workers, OpenAI Images | Shared editor with undo and versions |
| [JupyterLite WebMCP](https://devpost.com/software/jupyterlite-webmcp) | JupyterLab extension exposing the live notebook | TS, JupyterLab, Pyodide | 22, hash-guarded writes, Propose mode |
| [Faraday](https://devpost.com/software/faraday-3n1zdh) | In-browser CT/MRI reading room | React, NiiVue (WebGPU), Bun | 5, export gated by human approval |
| [Mandate](https://devpost.com/software/mandate-ix29ek) | Scoped, expiring delegation on a CRM | React, Hono, Redis | Schemas compiled from the granted mandate |

Patterns that repeat across the winners:

1. **One shared state.** Human and agent act through the same store, the same undo history, the same visible result.
2. **Dynamic tools.** Tools register and unregister as the app state changes (Aisle, Alza, Roque Nights). The tool list itself tells the agent what is possible right now.
3. **Human in the loop inside the tool call.** Propose → accept/reject, with the tool call waiting for the decision. Seven of the ten do this.
4. **Errors written for the agent.** Structured, recoverable messages; Alza and JupyterLite show the agent correcting itself from the error text.
5. **An explicit "why WebMCP" argument.** No backend exists that a classic MCP server could wrap.
6. **Stack.** React + Vite + TypeScript, Zustand, Playwright for E2E. Half used Codex and tested in ChatGPT's browser.
7. **Scale.** Most exposed 15–57 tools; Faraday proves 5 is enough when the case is strong.

## Where Sundae stands

Devpost page against the 10 winners ([full benchmark](competitors/benchmark.md)):

| Signal | Sundae | Winners' median | Percentile |
|---|---|---|---|
| Words in description | 1,451 | 1,171 | 70 |
| Screenshots | **2** | 9 | 10 |
| "Built With" tags | 9 | 10 | 30 |
| Video / public repo | yes | 10/10 · 9/10 | — |

Coverage of the judging criteria ([`judging.tsv`](judging.tsv), four criteria at 25% each):

| Signal | Sundae | Winners |
|---|---|---|
| Human approval inside the tool | **no** | 70% |
| Dynamic tool registration | **no** | 40% |
| Concrete real audience | **no** | 30% |
| Shared state + undo | yes | 50% |
| Tests / live demo | yes | 70% / 80% |
| Measured before/after | **yes** | 20% |

Deep review of four winners' repos (same probes on both sides, nothing executed):

| Competitor | Competitor score | Sundae score | Report |
|---|---|---|---|
| Roque Nights | 9 | 6 | [md](competitors/competidores-webmcp-roque-nights.md) · [html](competitors/competidores-webmcp-roque-nights.html) |
| Aisle | 8 | 7 | [md](competitors/competidores-webmcp-aisle.md) · [html](competitors/competidores-webmcp-aisle.html) |
| Alza | 8 | 6 | [md](competitors/competidores-webmcp-alza.md) · [html](competitors/competidores-webmcp-alza.html) |
| Mandate | 8 | 6 | [md](competitors/competidores-webmcp-mandate.md) · [html](competitors/competidores-webmcp-mandate.html) |

What we already had going for us: the measured with/without comparison (4m 38s vs 36s). Only 2 of the 10 winners published a number like that.

## Improvements to apply

Ordered by how much each one moves a judging criterion. All four deep reviews converged on items 1–4.

| # | Change | Criterion | Effort | Where |
|---|---|---|---|---|
| 1 | **Human approval before `set_dashboard_view` writes.** The tool proposes the new view, the page shows accept/reject, and the call resolves with the decision. Today the write applies immediately and is only reversible afterwards through Undo. | WebMCP Leverage | medium | `src/lib/webmcp-tools.ts`, `src/lib/store.ts`, `src/components/AgentActivityLog.tsx` |
| 2 | **Dynamic tool registration.** For example, an `undo_dashboard_view` tool that only exists while there is a write to undo, unregistered through its `AbortSignal` when consumed. | WebMCP Leverage | medium | `src/lib/webmcp-tools.ts`, `src/main.tsx` |
| 3 | **Publish the with/without measurement up front.** Put the numbers (4m 38s vs 36s, the `?webmcp=off` take) at the top of the README and the Devpost page, with how it was measured. | Potential Impact | low | `README.md`, `docs/devpost.md` |
| 4 | **CI.** GitHub Actions workflow running `npm test` and `npm run build`. None of the reviewed winners had one. | Execution | low | `.github/workflows/ci.yml` |
| 5 | **Browser E2E tests.** Playwright over the six tools, invoking them through `document.modelContext` in a real Chromium. | Execution | medium | new `e2e/` + `playwright.config.ts` |
| 6 | **More screenshots on Devpost.** We had 2; the winners' median was 9. | Presentation | low | Devpost page |
| 7 | Stars, topics, README length. No criterion weighs these. | — | low | cosmetic |

## Caveats

- The competitor repos were read, never executed. Tool behavior and approval flows were judged from code and README.
- Test counts in the reports (50 for Sundae) only count `it(`/`test(` lines; the suite actually has 56.
- The Alza report was regenerated from the reviewer's context after being overwritten; its probes were not rerun.
- The Roque Nights report marks its video as missing because it resolved the wrong Devpost slug; the real page has one.
- The "criteria coverage" table matches regexes over each Devpost description, so a "no" can mean "not described with those words" rather than "not built".
