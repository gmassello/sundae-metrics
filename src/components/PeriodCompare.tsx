import { comparePeriods, getSales, toolText } from '../lib/queries.ts'
import { count, monthLabel, money, pct, storeLabel } from '../lib/format.ts'
import { storeParam, type View } from '../lib/store.ts'

function PeriodCard({ month, store }: { month: string; store: View['store'] }) {
  const sales = getSales({ store: storeParam(store), month })
  return (
    <section className="card">
      <div className="label">{monthLabel(month)}</div>
      <div className="kpi-value">{money(sales.revenue)}</div>
      <div className="kpi-delta">{count(sales.units)} units</div>
    </section>
  )
}

function DeltaCard({ label, value }: { label: string; value: number | null }) {
  const negative = value !== null && value < 0
  return (
    <section className="card">
      <div className="label">{label}</div>
      <div className={negative ? 'delta-value negative' : 'delta-value'}>{pct(value)}</div>
    </section>
  )
}

export default function PeriodCompare({ view }: { view: View }) {
  const { store, monthFrom, monthTo } = view
  const input = { store: storeParam(store), monthA: monthFrom, monthB: monthTo }
  const result = comparePeriods(input)

  return (
    <>
      <div className="card-sub">
        {storeLabel(store)} · {monthLabel(monthFrom)} → {monthLabel(monthTo)}
      </div>

      <div className="compare-periods">
        <PeriodCard month={monthFrom} store={store} />
        <div className="compare-arrow">→</div>
        <PeriodCard month={monthTo} store={store} />
      </div>

      <div className="delta-row">
        <DeltaCard label="Revenue change" value={result.revenueChangePct} />
        <DeltaCard label="Units change" value={result.unitsChangePct} />
      </div>

      <section className="card">
        <h2 className="card-title">What the agent receives</h2>
        <div className="card-sub">The literal payload of the compare_periods tool.</div>
        <pre className="json-block">
          {`compare_periods(${toolText(input)})\n→ ${toolText(result)}`}
        </pre>
      </section>

      <p className="provenance">
        The percentage is computed in the query layer, not by the agent — the same{' '}
        <span className="mono">comparePeriods</span> call feeds these cards and the tool output
        above.
      </p>
    </>
  )
}
