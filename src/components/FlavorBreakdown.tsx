import { flavorBreakdown } from '../lib/queries.ts'
import { FLAVOR_RAMP, count, flavorLabel, monthLabel, money } from '../lib/format.ts'
import { storeParam, type View } from '../lib/store.ts'

export default function FlavorBreakdown({ view }: { view: View }) {
  const rows = flavorBreakdown(storeParam(view.store), view.monthTo)
  const max = Math.max(...rows.map((r) => r.units), 1)
  const empty = rows.every((r) => r.units === 0)

  return (
    <section className="card">
      <h2 className="card-title">Flavor breakdown</h2>
      <div className="card-sub">{monthLabel(view.monthTo)} · units and revenue</div>

      {empty ? (
        <div className="empty">No sales recorded for this period.</div>
      ) : (
        <div style={{ marginTop: 10 }}>
          {rows.map((row, i) => (
            <div className="breakdown-row" key={row.flavor}>
              <span>{flavorLabel(row.flavor)}</span>
              <div className="track">
                <div
                  style={{ width: `${(row.units / max) * 100}%`, background: FLAVOR_RAMP[i] ?? FLAVOR_RAMP.at(-1) }}
                />
              </div>
              <span className="num">{count(row.units)}</span>
              <span className="num">{money(row.revenue)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
