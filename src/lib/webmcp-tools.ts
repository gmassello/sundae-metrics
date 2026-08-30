/// <reference types="webmcp-types" />
import { STORE_IDS, type StoreId } from '../data/stores.ts'
import {
  comparePeriods,
  getSales,
  getSummary,
  getTopFlavors,
  listStores,
  toolText,
} from './queries.ts'
import { applyDashboardView, logCall, setWebmcpReady, type ViewStore } from './store.ts'

type ToolInput = Record<string, unknown>

const MONTH_DESC = 'Month in YYYY-MM format, e.g. 2026-03'

function define({
  name,
  description,
  inputSchema,
  readOnly,
  run,
}: {
  name: string
  description: string
  inputSchema?: object
  readOnly: boolean
  run: (input: ToolInput) => unknown
}): WebMCP.ModelContextTool {
  return {
    name,
    description,
    inputSchema,
    annotations: { readOnlyHint: readOnly },
    execute: (input) => {
      const started = performance.now()
      let output: string
      try {
        output = toolText(run(input))
      } catch (error) {
        output = error instanceof Error ? error.message : String(error)
      }
      logCall({
        tool: name,
        input,
        output,
        readOnly,
        ms: Math.round((performance.now() - started) * 100) / 100,
      })
      return { content: [{ type: 'text', text: output }] }
    },
  }
}

export const TOOLS: WebMCP.ModelContextTool[] = [
  define({
    name: 'list_stores',
    description: 'Lists the ice cream locations available on this dashboard, with id, name and city',
    readOnly: true,
    run: () => listStores(),
  }),

  define({
    name: 'get_sales',
    description: 'Exact sales (units and revenue) for one location in a given month',
    inputSchema: {
      type: 'object',
      properties: {
        store: { type: 'string', enum: STORE_IDS, description: 'Store id' },
        month: { type: 'string', description: MONTH_DESC },
      },
      required: ['store', 'month'],
    },
    readOnly: true,
    run: (i) => getSales({ store: i.store as StoreId, month: i.month as string }),
  }),

  define({
    name: 'compare_periods',
    description:
      'Percentage change in revenue and units between two months for one location. Returns null for a change from zero, which is undefined rather than flat',
    inputSchema: {
      type: 'object',
      properties: {
        store: { type: 'string', enum: STORE_IDS, description: 'Store id' },
        monthA: { type: 'string', description: `Earlier month. ${MONTH_DESC}` },
        monthB: { type: 'string', description: `Later month. ${MONTH_DESC}` },
      },
      required: ['store', 'monthA', 'monthB'],
    },
    readOnly: true,
    run: (i) =>
      comparePeriods({
        store: i.store as StoreId,
        monthA: i.monthA as string,
        monthB: i.monthB as string,
      }),
  }),

  define({
    name: 'get_top_flavors',
    description: 'Flavor ranking by units sold, best sellers first or slow movers first',
    inputSchema: {
      type: 'object',
      properties: {
        store: { type: 'string', enum: STORE_IDS, description: 'Store id. All locations if omitted' },
        month: { type: 'string', description: `${MONTH_DESC}. Whole range if omitted` },
        limit: { type: 'number', description: 'How many flavors to return' },
        order: {
          type: 'string',
          enum: ['top', 'bottom'],
          description: '"top" = best sellers, "bottom" = slow movers. Defaults to "top"',
        },
      },
      required: ['limit'],
    },
    readOnly: true,
    run: (i) =>
      getTopFlavors({
        store: i.store as StoreId | undefined,
        month: i.month as string | undefined,
        limit: i.limit as number,
        order: i.order as 'top' | 'bottom' | undefined,
      }),
  }),

  define({
    name: 'get_summary',
    description: 'Total revenue across every location over a date range, broken down by location',
    inputSchema: {
      type: 'object',
      properties: {
        dateFrom: { type: 'string', description: 'Range start in YYYY-MM-DD format' },
        dateTo: { type: 'string', description: 'Range end in YYYY-MM-DD format' },
      },
      required: ['dateFrom', 'dateTo'],
    },
    readOnly: true,
    run: (i) => getSummary({ dateFrom: i.dateFrom as string, dateTo: i.dateTo as string }),
  }),

  define({
    name: 'set_dashboard_view',
    description:
      'Changes the location and/or date range the user is looking at on the dashboard. Only the fields you pass are changed',
    inputSchema: {
      type: 'object',
      properties: {
        store: {
          type: 'string',
          enum: [...STORE_IDS, 'all'],
          description: 'Store id, or "all" for every location',
        },
        dateFrom: { type: 'string', description: 'Range start in YYYY-MM-DD format' },
        dateTo: { type: 'string', description: 'Range end in YYYY-MM-DD format' },
      },
    },
    readOnly: false,
    run: (i) => ({
      ok: true,
      applied: applyDashboardView({
        store: i.store as ViewStore | undefined,
        dateFrom: i.dateFrom as string | undefined,
        dateTo: i.dateTo as string | undefined,
      }),
    }),
  }),
]

export async function registerTools(): Promise<void> {
  const context = document.modelContext
  const off = new URLSearchParams(location.search).get('webmcp') === 'off'

  if (off || !context) {
    console.info(
      off
        ? '[webmcp] disabled by ?webmcp=off — the dashboard runs without agent tools'
        : '[webmcp] document.modelContext is undefined — enable chrome://flags/#enable-webmcp-testing',
    )
    setWebmcpReady(false)
    return
  }

  try {
    await Promise.all(TOOLS.map((tool) => context.registerTool(tool)))
    setWebmcpReady(true)

    const registered = new Set((await context.getTools()).map((tool) => tool.name))
    const missing = TOOLS.filter((tool) => !registered.has(tool.name)).map((tool) => tool.name)
    if (missing.length > 0) {
      console.error('[webmcp] Chrome silently rejected these tools, check the §5 limits:', missing)
    }
  } catch (error) {
    console.error('[webmcp] tool registration failed:', error)
  }
}
