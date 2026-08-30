import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  HIGHLIGHT_MS,
  MAX_CALLS,
  applyDashboardView,
  getState,
  logCall,
  resetDashboard,
  setTab,
  setView,
  setWebmcpReady,
  subscribe,
  undoView,
} from './store.ts'

const call = (tool: string, readOnly = true) => ({
  tool,
  input: {},
  output: '{}',
  readOnly,
  ms: 1,
})

beforeEach(() => {
  resetDashboard()
})

describe('the initial view', () => {
  it('opens on North across the full window', () => {
    expect(getState().view).toEqual({
      store: 'north',
      monthFrom: '2025-09',
      monthTo: '2026-08',
    })
    expect(getState().tab).toBe('overview')
  })
})

describe('applyDashboardView', () => {
  it('changes only the fields the agent sent', () => {
    applyDashboardView({ dateFrom: '2026-02-01' })
    expect(getState().view).toEqual({
      store: 'north',
      monthFrom: '2026-02',
      monthTo: '2026-08',
    })
  })

  it('narrows a YYYY-MM-DD range down to its months', () => {
    applyDashboardView({ store: 'south', dateFrom: '2026-02-14', dateTo: '2026-03-28' })
    expect(getState().view).toEqual({
      store: 'south',
      monthFrom: '2026-02',
      monthTo: '2026-03',
    })
  })

  it('accepts the all-locations view', () => {
    applyDashboardView({ store: 'all' })
    expect(getState().view.store).toBe('all')
  })

  it('returns the view it applied, for the tool to echo back', () => {
    expect(applyDashboardView({ store: 'west' })).toEqual(getState().view)
  })

  it('leaves the view untouched when part of the input is invalid', () => {
    const before = getState().view
    expect(() => applyDashboardView({ store: 'west', dateFrom: '03-2026' })).toThrow(
      'Invalid date "03-2026", expected YYYY-MM-DD',
    )
    expect(() => applyDashboardView({ store: 'norte' as never })).toThrow('Unknown store "norte"')
    expect(() => applyDashboardView({ dateFrom: '2024-03-01' })).toThrow('No data for month')
    expect(getState().view).toEqual(before)
    expect(getState().previousView).toBeNull()
  })
})

describe('undoView', () => {
  it('undoes one level: two writes in a row roll back to the state before the second', () => {
    applyDashboardView({ store: 'south' })
    applyDashboardView({ store: 'west' })
    undoView()
    expect(getState().view.store).toBe('south')
  })

  it('spends the snapshot, so a second undo does nothing', () => {
    applyDashboardView({ store: 'south' })
    undoView()
    undoView()
    expect(getState().view.store).toBe('north')
    expect(getState().previousView).toBeNull()
  })

  it('ignores a view the user changed by hand', () => {
    setView({ store: 'west' })
    undoView()
    expect(getState().view.store).toBe('west')
  })

  it('drops the snapshot when the user takes over, so undo cannot discard their change', () => {
    applyDashboardView({ store: 'south' })
    setView({ store: 'west' })
    expect(getState().previousView).toBeNull()

    undoView()
    expect(getState().view.store).toBe('west')
  })
})

describe('the write highlight', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('decays on its own but leaves the undo available', () => {
    applyDashboardView({ store: 'south' })
    expect(getState().highlight).toBe(true)

    vi.advanceTimersByTime(HIGHLIGHT_MS)
    expect(getState().highlight).toBe(false)
    expect(getState().previousView).not.toBeNull()
  })

  it('restarts its window when a second write lands inside it', () => {
    applyDashboardView({ store: 'south' })
    vi.advanceTimersByTime(HIGHLIGHT_MS - 100)
    applyDashboardView({ store: 'west' })

    vi.advanceTimersByTime(200)
    expect(getState().highlight).toBe(true)

    vi.advanceTimersByTime(HIGHLIGHT_MS)
    expect(getState().highlight).toBe(false)
  })

  it('clears immediately on undo', () => {
    applyDashboardView({ store: 'south' })
    undoView()
    expect(getState().highlight).toBe(false)
  })

  it('clears when the user changes the view by hand', () => {
    applyDashboardView({ store: 'south' })
    setView({ monthFrom: '2026-01' })
    expect(getState().highlight).toBe(false)
  })
})

describe('the agent call log', () => {
  it('keeps the newest call first', () => {
    logCall(call('list_stores'))
    logCall(call('get_sales'))
    expect(getState().calls.map((c) => c.tool)).toEqual(['get_sales', 'list_stores'])
  })

  it('caps at twenty and drops the oldest', () => {
    for (let i = 0; i < MAX_CALLS + 5; i++) logCall(call(`tool_${i}`))
    const { calls } = getState()
    expect(calls).toHaveLength(MAX_CALLS)
    expect(calls[0].tool).toBe(`tool_${MAX_CALLS + 4}`)
    expect(calls.at(-1)?.tool).toBe('tool_5')
  })

  it('gives every entry a distinct id, since two calls can share a timestamp', () => {
    logCall(call('get_sales'))
    logCall(call('get_sales'))
    const ids = getState().calls.map((c) => c.id)
    expect(new Set(ids).size).toBe(2)
  })

  it('marks writes apart from reads', () => {
    logCall(call('set_dashboard_view', false))
    expect(getState().calls[0].readOnly).toBe(false)
  })

  it('measures chars off the output it was handed, so the N / 1500 chip cannot lie', () => {
    logCall({ ...call('get_summary'), output: 'x'.repeat(742) })
    expect(getState().calls[0].chars).toBe(742)
    expect(getState().calls[0].ts).toBeGreaterThan(0)
  })
})

describe('subscribers', () => {
  it('are notified on every mutation and stop after unsubscribing', () => {
    const listener = vi.fn()
    const unsubscribe = subscribe(listener)
    const before = getState()

    setTab('flavors')
    setWebmcpReady(true)
    expect(listener).toHaveBeenCalledTimes(2)
    expect(getState()).not.toBe(before)

    unsubscribe()
    setTab('compare')
    expect(listener).toHaveBeenCalledTimes(2)
  })
})
