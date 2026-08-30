import { monthlyRevenue } from '../lib/queries.ts'
import { count, monthLabel, storeLabel } from '../lib/format.ts'
import { storeParam, type View } from '../lib/store.ts'

const PLOT_FILL = 88

export default function SalesChart({ view, highlight }: { view: View; highlight: boolean }) {
  const rows = monthlyRevenue(storeParam(view.store))
  const max = Math.max(...rows.map((r) => r.revenue), 1)

  return (
    <section className={highlight ? 'card written' : 'card'}>
      <div className="chart-head">
        <div>
          <h2 className="card-title">Monthly revenue</h2>
          <div className="card-sub">{storeLabel(view.store)} · 12 months</div>
        </div>
        <div className="label">USD</div>
      </div>

      <div className="chart">
        <div className="gridline" style={{ top: 0 }} />
        <div className="gridline" style={{ top: '50%' }} />
        <div className="gridline" style={{ bottom: 0 }} />
        {rows.map((row) => {
          const active = row.month >= view.monthFrom && row.month <= view.monthTo
          const tone = active ? (highlight ? ' written' : ' active') : ''
          return (
            <div className="chart-col" key={row.month}>
              {active && <div className="bar-value">{count(row.revenue)}</div>}
              <div
                className={`bar${tone}`}
                style={{ height: `${(row.revenue / max) * PLOT_FILL}%` }}
              />
            </div>
          )
        })}
      </div>

      <div className="chart-axis">
        {rows.map((row) => (
          <span key={row.month}>{monthLabel(row.month).slice(0, 3)}</span>
        ))}
      </div>
    </section>
  )
}
