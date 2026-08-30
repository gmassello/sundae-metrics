import { describe, expect, it } from 'vitest'
import {
  TOOL_TEXT_LIMIT,
  changePct,
  comparePeriods,
  flavorBreakdown,
  getSales,
  getSummary,
  getTopFlavors,
  listStores,
  monthlyRevenue,
  toolText,
} from './queries.ts'

describe('comparePeriods', () => {
  it('matches the anchored February to March decline for North', () => {
    expect(comparePeriods({ store: 'north', monthA: '2026-02', monthB: '2026-03' })).toEqual({
      revenueChangePct: -17.1,
      unitsChangePct: -15.4,
    })
  })

  it('reports growth as a positive percentage', () => {
    const { revenueChangePct } = comparePeriods({
      store: 'north',
      monthA: '2025-09',
      monthB: '2025-10',
    })
    expect(revenueChangePct).toBe(29)
  })

  it('returns null instead of a fabricated percentage when the first period is zero', () => {
    expect(changePct(0, 39871)).toBeNull()
    expect(changePct(0, 0)).toBeNull()
  })
})

describe('getSales', () => {
  it('returns the anchored North February totals', () => {
    expect(getSales({ store: 'north', month: '2026-02' })).toMatchObject({
      revenue: 48124,
      units: 14668,
    })
  })

  it('splits North March into six flavors that sum back to the anchored total', () => {
    const { units, revenue, byFlavor } = getSales({ store: 'north', month: '2026-03' })
    expect(revenue).toBe(39871)
    expect(units).toBe(12410)
    expect(byFlavor).toEqual([
      { flavor: 'dulce_de_leche', units: 4105, revenue: 13186 },
      { flavor: 'chocolate', units: 2940, revenue: 9443 },
      { flavor: 'pistachio', units: 1810, revenue: 6215 },
      { flavor: 'strawberry', units: 1655, revenue: 5316 },
      { flavor: 'lemon', units: 1120, revenue: 3598 },
      { flavor: 'passion_fruit', units: 780, revenue: 2113 },
    ])
  })

  it('aggregates every location when the store is omitted', () => {
    expect(getSales({ month: '2026-03' }).revenue).toBe(138413)
  })
})

describe('getSummary', () => {
  it('aggregates March across the four locations', () => {
    const { totalRevenue, byStore } = getSummary({ dateFrom: '2026-03-01', dateTo: '2026-03-31' })
    expect(totalRevenue).toBe(138413)
    expect(Object.fromEntries(byStore.map((s) => [s.store, s.revenue]))).toEqual({
      north: 39871,
      central: 45128,
      south: 31045,
      west: 22369,
    })
    expect(byStore.reduce((a, s) => a + s.revenue, 0)).toBe(totalRevenue)
  })
})

describe('getTopFlavors', () => {
  it('ranks the South March best sellers', () => {
    expect(getTopFlavors({ store: 'south', month: '2026-03', limit: 3 })).toMatchObject([
      { flavor: 'dulce_de_leche', units: 3240 },
      { flavor: 'chocolate', units: 2415 },
      { flavor: 'pistachio', units: 1380 },
    ])
  })

  it('ranks the South March slow movers from the bottom up', () => {
    expect(
      getTopFlavors({ store: 'south', month: '2026-03', limit: 3, order: 'bottom' }),
    ).toMatchObject([
      { flavor: 'passion_fruit', units: 410 },
      { flavor: 'lemon', units: 695 },
      { flavor: 'strawberry', units: 1105 },
    ])
  })
})

describe('the dashboard feeds', () => {
  it('gives the chart twelve months anchored to the North revenue curve', () => {
    expect(monthlyRevenue('north').map((m) => m.revenue)).toEqual([
      23100, 29800, 37400, 46200, 50800, 48124, 39871, 28700, 21400, 16800, 17900, 19500,
    ])
  })

  it('narrows the chart to the requested window', () => {
    expect(monthlyRevenue('north', '2026-02', '2026-03')).toEqual([
      { month: '2026-02', revenue: 48124 },
      { month: '2026-03', revenue: 39871 },
    ])
  })

  it('hides the January pistachio shortage behind an unchanged monthly total', () => {
    const units = (month: string) =>
      flavorBreakdown('north', month).find((f) => f.flavor === 'pistachio')?.units
    expect(units('2025-12')).toBe(2099)
    expect(units('2026-01')).toBe(554)
    expect(monthlyRevenue('north', '2026-01', '2026-01')[0].revenue).toBe(50800)
  })

  it('lists the four locations', () => {
    expect(listStores().map((s) => s.id)).toEqual(['north', 'south', 'central', 'west'])
  })
})

describe('toolText', () => {
  it('leaves a payload under the limit untouched', () => {
    expect(toolText({ revenue: 39871 })).toBe('{"revenue":39871}')
  })

  it('truncates an oversized payload to the platform ceiling', () => {
    const text = toolText({ note: 'x'.repeat(2000) })
    expect(text).toHaveLength(TOOL_TEXT_LIMIT)
    expect(text.endsWith('…')).toBe(true)
  })
})

describe('input validation', () => {
  it('rejects an unknown store instead of reporting zero sales', () => {
    expect(() => getSales({ store: 'norte' as never, month: '2026-03' })).toThrow(
      'Unknown store "norte"',
    )
  })

  it('rejects a misspelled month', () => {
    expect(() => getSales({ store: 'north', month: '03-2026' })).toThrow(
      'Invalid month "03-2026", expected YYYY-MM',
    )
  })

  it('rejects a well-formed month outside the dataset', () => {
    expect(() => getSales({ store: 'north', month: '2024-03' })).toThrow('No data for month')
  })

  it('rejects an inverted date range', () => {
    expect(() => getSummary({ dateFrom: '2026-03-31', dateTo: '2026-03-01' })).toThrow(
      'is after its end',
    )
  })

  it('rejects a summary range that misses the dataset instead of reporting zero', () => {
    expect(() => getSummary({ dateFrom: '2024-01-01', dateTo: '2024-12-31' })).toThrow(
      'No data between',
    )
  })

  it('accepts a range wider than the dataset', () => {
    expect(getSummary({ dateFrom: '2025-01-01', dateTo: '2026-12-31' }).totalRevenue).toBeGreaterThan(
      0,
    )
  })
})
