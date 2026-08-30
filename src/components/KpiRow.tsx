import type { ReactNode } from 'react'
import { comparePeriods, getSales } from '../lib/queries.ts'
import { count, flavorLabel, monthLabel, money } from '../lib/format.ts'
import { storeParam, type View } from '../lib/store.ts'

function Delta({ value, from }: { value: number | null; from: string }) {
  const tone = value === null ? '' : value < 0 ? 'down' : 'up'
  const text = value === null ? '—' : `${value < 0 ? '▼' : '▲'} ${Math.abs(value).toFixed(1)}%`
  return (
    <div className="kpi-delta">
      <span className={tone}>{text}</span> vs {monthLabel(from)}
    </div>
  )
}

function Kpi({
  label,
  value,
  text,
  children,
}: {
  label: string
  value: string
  text?: boolean
  children: ReactNode
}) {
  return (
    <section className="card">
      <div className="label">{label}</div>
      <div className={text ? 'kpi-value text' : 'kpi-value'}>{value}</div>
      {children}
    </section>
  )
}

export default function KpiRow({ view }: { view: View }) {
  const store = storeParam(view.store)
  const { monthFrom, monthTo } = view
  const sales = getSales({ store, month: monthTo })
  const delta = comparePeriods({ store, monthA: monthFrom, monthB: monthTo })
  const top = sales.byFlavor[0]
  const slow = sales.byFlavor[sales.byFlavor.length - 1]

  return (
    <div className="kpi-row">
      <Kpi label={`Revenue · ${monthLabel(monthTo)}`} value={money(sales.revenue)}>
        <Delta value={delta.revenueChangePct} from={monthFrom} />
      </Kpi>
      <Kpi label={`Units · ${monthLabel(monthTo)}`} value={count(sales.units)}>
        <Delta value={delta.unitsChangePct} from={monthFrom} />
      </Kpi>
      <Kpi label="Top flavor" value={flavorLabel(top.flavor)} text>
        <div className="kpi-delta">{count(top.units)} units</div>
      </Kpi>
      <Kpi label="Slow mover" value={flavorLabel(slow.flavor)} text>
        <div className="kpi-delta">{count(slow.units)} units</div>
      </Kpi>
    </div>
  )
}
