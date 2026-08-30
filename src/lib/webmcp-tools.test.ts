import { beforeEach, describe, expect, it } from 'vitest'
import { TOOLS } from './webmcp-tools.ts'
import { TOOL_TEXT_LIMIT } from './queries.ts'
import { getState, resetDashboard } from './store.ts'

const NAME_LIMIT = 30
const TOOL_DESCRIPTION_LIMIT = 500
const PARAM_DESCRIPTION_LIMIT = 150

const WRITE_TOOL = 'set_dashboard_view'

function toolNamed(name: string): WebMCP.ModelContextTool {
  const tool = TOOLS.find((t) => t.name === name)
  if (!tool) throw new Error(`No tool named "${name}"`)
  return tool
}

async function run(name: string, input: Record<string, unknown> = {}): Promise<string> {
  const result = await toolNamed(name).execute(input, { signal: new AbortController().signal })
  return (result as { content: { text: string }[] }).content[0].text
}

function paramDescriptions(tool: WebMCP.ModelContextTool): string[] {
  const schema = tool.inputSchema as { properties?: Record<string, { description?: string }> }
  return Object.values(schema?.properties ?? {})
    .map((param) => param.description)
    .filter((description): description is string => description !== undefined)
}

beforeEach(() => {
  resetDashboard()
})

describe('Chrome platform limits', () => {
  it('registers the 6 tools of §5', () => {
    expect(TOOLS.map((tool) => tool.name)).toEqual([
      'list_stores',
      'get_sales',
      'compare_periods',
      'get_top_flavors',
      'get_summary',
      WRITE_TOOL,
    ])
  })

  it.each(TOOLS.map((tool) => [tool.name, tool] as const))('%s fits the limits', (_name, tool) => {
    expect(tool.name.length).toBeLessThanOrEqual(NAME_LIMIT)
    expect(tool.description.length).toBeLessThanOrEqual(TOOL_DESCRIPTION_LIMIT)
    for (const description of paramDescriptions(tool)) {
      expect(description.length).toBeLessThanOrEqual(PARAM_DESCRIPTION_LIMIT)
    }
  })

  it('truncates every output to 1500 chars', async () => {
    const output = await run('get_summary', { dateFrom: '2025-09-01', dateTo: '2026-08-31' })
    expect(output.length).toBeLessThanOrEqual(TOOL_TEXT_LIMIT)
  })
})

describe('annotations', () => {
  it('marks only set_dashboard_view as a write', () => {
    for (const tool of TOOLS) {
      expect(tool.annotations?.readOnlyHint).toBe(tool.name !== WRITE_TOOL)
    }
  })

  it('declares no untrustedContentHint — every value comes from the seed', () => {
    for (const tool of TOOLS) {
      expect(tool.annotations?.untrustedContentHint).toBeUndefined()
    }
  })
})

describe('execute', () => {
  it('returns the §4 figures for north 2026-03', async () => {
    const output = await run('get_sales', { store: 'north', month: '2026-03' })
    expect(JSON.parse(output)).toMatchObject({ units: 12410, revenue: 39871 })
  })

  it('hands an invalid store back to the agent as text, and logs the call', async () => {
    const output = await run('get_sales', { store: 'norte', month: '2026-03' })
    expect(output).toBe('Unknown store "norte"')

    const [call] = getState().calls
    expect(call).toMatchObject({ tool: 'get_sales', output, readOnly: true })
  })

  it('logs every call with the chars of its truncated output', async () => {
    const output = await run('list_stores')
    expect(getState().calls[0]).toMatchObject({ chars: output.length, readOnly: true })
  })

  it('set_dashboard_view moves the dashboard and echoes what it applied', async () => {
    const output = await run(WRITE_TOOL, { store: 'south', dateFrom: '2026-02-15' })

    expect(JSON.parse(output)).toEqual({
      ok: true,
      applied: { store: 'south', monthFrom: '2026-02', monthTo: '2026-08' },
    })
    expect(getState().view.store).toBe('south')
    expect(getState().highlight).toBe(true)
    expect(getState().calls[0]).toMatchObject({ tool: WRITE_TOOL, readOnly: false })
  })

  it('leaves the view untouched when the write is invalid', async () => {
    const output = await run(WRITE_TOOL, { store: 'norte' })

    expect(output).toBe('Unknown store "norte"')
    expect(getState().view.store).toBe('north')
    expect(getState().previousView).toBeNull()
  })
})
