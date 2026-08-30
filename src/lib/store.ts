import { useSyncExternalStore } from 'react'
import { MONTHS, type StoreId } from '../data/stores.ts'
import { assertMonth, assertStore, monthOf } from './queries.ts'

export type Tab = 'overview' | 'flavors' | 'compare'
export type ViewStore = StoreId | 'all'

export type View = {
  store: ViewStore
  monthFrom: string
  monthTo: string
}

export type CallEntry = {
  id: number
  tool: string
  input: unknown
  output: string
  readOnly: boolean
  ts: number
  ms: number
  chars: number
}

export type DashboardState = {
  view: View
  tab: Tab
  calls: CallEntry[]
  previousView: View | null
  highlight: boolean
  webmcpReady: boolean
}

export type DashboardViewInput = {
  store?: ViewStore
  dateFrom?: string
  dateTo?: string
}

export const MAX_CALLS = 20
export const HIGHLIGHT_MS = 4000

const INITIAL: DashboardState = {
  view: { store: 'north', monthFrom: MONTHS[0], monthTo: MONTHS[MONTHS.length - 1] },
  tab: 'overview',
  calls: [],
  previousView: null,
  highlight: false,
  webmcpReady: false,
}

const listeners = new Set<() => void>()

let state = INITIAL
let nextCallId = 1
let highlightTimer: ReturnType<typeof setTimeout> | undefined

function setState(patch: Partial<DashboardState>): void {
  state = { ...state, ...patch }
  listeners.forEach((listener) => listener())
}

function viewMonth(date: string): string {
  const month = monthOf(date)
  assertMonth(month)
  return month
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getState(): DashboardState {
  return state
}

export function useDashboard(): DashboardState {
  return useSyncExternalStore(subscribe, getState)
}

export function storeParam(store: ViewStore): StoreId | undefined {
  return store === 'all' ? undefined : store
}

export function setView(patch: Partial<View>): void {
  clearTimeout(highlightTimer)
  setState({ view: { ...state.view, ...patch }, previousView: null, highlight: false })
}

export function setTab(tab: Tab): void {
  setState({ tab })
}

export function applyDashboardView(input: DashboardViewInput): View {
  const next = { ...state.view }

  if (input.store !== undefined) {
    if (input.store !== 'all') assertStore(input.store)
    next.store = input.store
  }
  if (input.dateFrom !== undefined) next.monthFrom = viewMonth(input.dateFrom)
  if (input.dateTo !== undefined) next.monthTo = viewMonth(input.dateTo)

  clearTimeout(highlightTimer)
  setState({ view: next, previousView: state.view, highlight: true })
  highlightTimer = setTimeout(() => setState({ highlight: false }), HIGHLIGHT_MS)

  return next
}

export function undoView(): void {
  if (!state.previousView) return
  clearTimeout(highlightTimer)
  setState({ view: state.previousView, previousView: null, highlight: false })
}

export function logCall(entry: Omit<CallEntry, 'id' | 'ts' | 'chars'>): void {
  const call = { ...entry, id: nextCallId++, ts: Date.now(), chars: entry.output.length }
  setState({ calls: [call, ...state.calls].slice(0, MAX_CALLS) })
}

export function setWebmcpReady(webmcpReady: boolean): void {
  setState({ webmcpReady })
}

export function resetDashboard(): void {
  clearTimeout(highlightTimer)
  nextCallId = 1
  setState(INITIAL)
}
