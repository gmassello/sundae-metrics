import salesData from '../data/sales.json'
import {
  FLAVORS,
  MONTHS,
  STORES,
  type Flavor,
  type SalesRecord,
  type Store,
  type StoreId,
} from '../data/stores.ts'

const SALES = salesData as SalesRecord[]

export const TOOL_TEXT_LIMIT = 1500

const MONTH_FORMAT = /^\d{4}-\d{2}$/
const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/

const FIRST_MONTH = MONTHS[0]
const LAST_MONTH = MONTHS[MONTHS.length - 1]

export type FlavorTotal = { flavor: Flavor; units: number; revenue: number }
export type Totals = { units: number; revenue: number }

export function assertStore(store: string): void {
  if (!STORES.some((s) => s.id === store)) throw new Error(`Unknown store "${store}"`)
}

export function assertMonth(month: string): void {
  if (!MONTH_FORMAT.test(month)) throw new Error(`Invalid month "${month}", expected YYYY-MM`)
  if (!MONTHS.includes(month)) {
    throw new Error(`No data for month "${month}", available ${FIRST_MONTH} to ${LAST_MONTH}`)
  }
}

function assertQuery(store?: string, month?: string): void {
  if (store !== undefined) assertStore(store)
  if (month !== undefined) assertMonth(month)
}

function assertDate(date: string): void {
  if (!DATE_FORMAT.test(date)) throw new Error(`Invalid date "${date}", expected YYYY-MM-DD`)
}

export function monthOf(date: string): string {
  assertDate(date)
  return date.slice(0, 7)
}

function recordsFor(store?: string, month?: string): SalesRecord[] {
  return SALES.filter((r) => (!store || r.store === store) && (!month || r.month === month))
}

function totals(rows: Totals[]): Totals {
  return rows.reduce(
    (acc, r) => ({ units: acc.units + r.units, revenue: acc.revenue + r.revenue }),
    { units: 0, revenue: 0 },
  )
}

export function changePct(from: number, to: number): number | null {
  if (from === 0) return null
  return Math.round(((to - from) / from) * 1000) / 10
}

export function listStores(): Store[] {
  return STORES
}

export function flavorBreakdown(store?: StoreId, month?: string): FlavorTotal[] {
  const records = recordsFor(store, month)
  return FLAVORS.map(({ id }) => ({
    flavor: id,
    ...totals(records.filter((r) => r.flavor === id)),
  })).sort((a, b) => b.units - a.units)
}

export function getSales({ store, month }: { store?: StoreId; month: string }) {
  assertQuery(store, month)
  const byFlavor = flavorBreakdown(store, month)
  return { ...totals(byFlavor), byFlavor }
}

export function comparePeriods({
  store,
  monthA,
  monthB,
}: {
  store?: StoreId
  monthA: string
  monthB: string
}) {
  assertQuery(store, monthA)
  assertMonth(monthB)
  const a = totals(recordsFor(store, monthA))
  const b = totals(recordsFor(store, monthB))
  return {
    revenueChangePct: changePct(a.revenue, b.revenue),
    unitsChangePct: changePct(a.units, b.units),
  }
}

export function getTopFlavors({
  store,
  month,
  limit,
  order = 'top',
}: {
  store?: StoreId
  month?: string
  limit: number
  order?: 'top' | 'bottom'
}): FlavorTotal[] {
  assertQuery(store, month)
  const ranked = flavorBreakdown(store, month)
  return (order === 'bottom' ? ranked.reverse() : ranked).slice(0, Math.max(0, limit))
}

export function getSummary({ dateFrom, dateTo }: { dateFrom: string; dateTo: string }) {
  const from = monthOf(dateFrom)
  const to = monthOf(dateTo)
  if (dateFrom > dateTo) throw new Error(`Range start "${dateFrom}" is after its end "${dateTo}"`)

  if (to < FIRST_MONTH || from > LAST_MONTH) {
    throw new Error(
      `No data between "${dateFrom}" and "${dateTo}", available ${FIRST_MONTH} to ${LAST_MONTH}`,
    )
  }

  const inRange = SALES.filter((r) => r.month >= from && r.month <= to)
  const byStore = STORES.map(({ id }) => ({
    store: id,
    revenue: totals(inRange.filter((r) => r.store === id)).revenue,
  })).sort((a, b) => b.revenue - a.revenue)

  return { totalRevenue: totals(inRange).revenue, byStore }
}

export function monthlyRevenue(store?: StoreId, from = FIRST_MONTH, to = LAST_MONTH) {
  const records = recordsFor(store)
  return MONTHS.filter((month) => month >= from && month <= to).map((month) => ({
    month,
    revenue: totals(records.filter((r) => r.month === month)).revenue,
  }))
}

export function toolText(value: unknown): string {
  const text = JSON.stringify(value)
  return text.length <= TOOL_TEXT_LIMIT ? text : `${text.slice(0, TOOL_TEXT_LIMIT - 1)}…`
}
