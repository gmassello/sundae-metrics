import { FLAVORS, STORES, type Flavor } from '../data/stores.ts'
import type { ViewStore } from './store.ts'

export const FLAVOR_RAMP = ['#4f46e5', '#635bea', '#7b74ee', '#9a94f1', '#bbb6f5', '#dbd9f8']

const NUMBER = new Intl.NumberFormat('en-US')
const MONTH = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })

export function count(value: number): string {
  return NUMBER.format(value)
}

export function money(value: number): string {
  return `US$ ${NUMBER.format(Math.round(value))}`
}

export function monthLabel(month: string): string {
  return MONTH.format(new Date(`${month}-01T00:00:00Z`))
}

export function flavorLabel(flavor: Flavor): string {
  return FLAVORS.find((f) => f.id === flavor)?.label ?? flavor
}

export function storeLabel(store: ViewStore): string {
  if (store === 'all') return 'All locations'
  return STORES.find((s) => s.id === store)?.name.replace('Glacé ', '') ?? store
}

export function pct(value: number | null): string {
  if (value === null) return '—'
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
}
