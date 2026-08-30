import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { FLAVORS, MONTHS, STORES, type SalesRecord, type StoreId } from '../src/data/stores.ts'

const NORTH_REVENUE = [
  23100, 29800, 37400, 46200, 50800, 48124, 39871, 28700, 21400, 16800, 17900, 19500,
]

const MARCH_REVENUE: Record<StoreId, number> = {
  north: 39871,
  central: 45128,
  south: 31045,
  west: 22369,
}

const TILT: Record<StoreId, number[]> = {
  north: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  south: [1.05, 1.03, 0.98, 0.95, 0.97, 1.02, 1, 1.04, 1.07, 1.06, 0.99, 0.96],
  central: [0.96, 1.02, 1.05, 1.07, 1.04, 0.98, 1, 0.97, 0.93, 0.95, 1.01, 1.04],
  west: [0.98, 0.95, 1.04, 1.06, 1.08, 1.03, 1, 0.96, 0.94, 0.97, 1.02, 1.05],
}

const AVG_PRICE: Record<StoreId, number> = {
  north: 3.21,
  south: 3.36,
  central: 3.35,
  west: 3.12,
}

const UNITS_WEIGHTS: Record<StoreId, number[]> = {
  north: [0.33078, 0.23691, 0.14585, 0.13336, 0.09025, 0.06285],
  south: [0.35046, 0.26122, 0.14927, 0.11952, 0.07517, 0.04436],
  central: [0.32, 0.245, 0.155, 0.13, 0.095, 0.055],
  west: [0.345, 0.25, 0.135, 0.125, 0.09, 0.055],
}

const REVENUE_WEIGHTS: Record<StoreId, number[]> = {
  north: [0.33071, 0.23684, 0.15588, 0.13333, 0.09024, 0.053],
  south: [0.344, 0.2564, 0.16, 0.1173, 0.0738, 0.0485],
  central: [0.318, 0.243, 0.168, 0.128, 0.094, 0.049],
  west: [0.343, 0.248, 0.147, 0.124, 0.089, 0.049],
}

const UNITS_TOTAL_OVERRIDE: Record<string, number> = {
  'north:2026-02': 14668,
}

const FLAVOR_OVERRIDE: Record<string, { units: number; revenue?: number }[]> = {
  'north:2026-03': [
    { units: 4105, revenue: 13186 },
    { units: 2940, revenue: 9443 },
    { units: 1810, revenue: 6215 },
    { units: 1655, revenue: 5316 },
    { units: 1120, revenue: 3598 },
    { units: 780, revenue: 2113 },
  ],
  'south:2026-03': [
    { units: 3240 },
    { units: 2415 },
    { units: 1380 },
    { units: 1105 },
    { units: 695 },
    { units: 410 },
  ],
}

const SUPPLY_SHORTAGE = {
  key: 'north:2026-01',
  flavor: FLAVORS.findIndex((f) => f.id === 'pistachio'),
  weight: 0.035,
}

function shortWeights(weights: number[], flavor: number, target: number): number[] {
  const scale = (1 - target) / (1 - weights[flavor])
  return weights.map((w, i) => (i === flavor ? target : w * scale))
}

function split(total: number, weights: number[]): number[] {
  const parts = weights.map((w) => Math.round(total * w))
  parts[0] += total - parts.reduce((a, b) => a + b, 0)
  return parts
}

function monthTotals(store: StoreId, monthIndex: number, key: string) {
  const factor = MARCH_REVENUE[store] / MARCH_REVENUE.north
  const revenue = Math.round(NORTH_REVENUE[monthIndex] * factor * TILT[store][monthIndex])
  const units = UNITS_TOTAL_OVERRIDE[key] ?? Math.round(revenue / AVG_PRICE[store])
  return { revenue, units }
}

function buildMonth(store: StoreId, monthIndex: number): SalesRecord[] {
  const month = MONTHS[monthIndex]
  const key = `${store}:${month}`
  const { revenue, units } = monthTotals(store, monthIndex, key)

  const short = SUPPLY_SHORTAGE.key === key
  const weights = (w: number[]) =>
    short ? shortWeights(w, SUPPLY_SHORTAGE.flavor, SUPPLY_SHORTAGE.weight) : w

  const unitsSplit = split(units, weights(UNITS_WEIGHTS[store]))
  const revenueSplit = split(revenue, weights(REVENUE_WEIGHTS[store]))
  const override = FLAVOR_OVERRIDE[key]

  return FLAVORS.map((flavor, i) => ({
    store,
    month,
    flavor: flavor.id,
    units: override?.[i].units ?? unitsSplit[i],
    revenue: override?.[i].revenue ?? revenueSplit[i],
  }))
}

const records: SalesRecord[] = STORES.flatMap((store) =>
  MONTHS.flatMap((_, monthIndex) => buildMonth(store.id, monthIndex)),
)

const out = join(import.meta.dirname, '../src/data/sales.json')
writeFileSync(out, `${JSON.stringify(records, null, 2)}\n`)
console.log(`${records.length} records → ${out}`)
