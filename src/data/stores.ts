export type StoreId = 'north' | 'south' | 'central' | 'west'

export type Store = {
  id: StoreId
  name: string
  city: string
}

export type Flavor =
  | 'chocolate'
  | 'strawberry'
  | 'dulce_de_leche'
  | 'lemon'
  | 'pistachio'
  | 'passion_fruit'

export type SalesRecord = {
  store: StoreId
  month: string
  flavor: Flavor
  units: number
  revenue: number
}

export const STORES: Store[] = [
  { id: 'north', name: 'Glacé North', city: 'Belgrano' },
  { id: 'south', name: 'Glacé South', city: 'San Telmo' },
  { id: 'central', name: 'Glacé Central', city: 'Recoleta' },
  { id: 'west', name: 'Glacé West', city: 'Caballito' },
]

export const FLAVORS: { id: Flavor; label: string }[] = [
  { id: 'dulce_de_leche', label: 'Dulce de leche' },
  { id: 'chocolate', label: 'Chocolate' },
  { id: 'pistachio', label: 'Pistachio' },
  { id: 'strawberry', label: 'Strawberry' },
  { id: 'lemon', label: 'Lemon' },
  { id: 'passion_fruit', label: 'Passion fruit' },
]

export const MONTHS: string[] = [
  '2025-09',
  '2025-10',
  '2025-11',
  '2025-12',
  '2026-01',
  '2026-02',
  '2026-03',
  '2026-04',
  '2026-05',
  '2026-06',
  '2026-07',
  '2026-08',
]
