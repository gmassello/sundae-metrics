import { useState } from 'react'
import { FLAVORS } from '../data/stores.ts'
import { getTopFlavors, type FlavorTotal } from '../lib/queries.ts'
import { FLAVOR_RAMP, count, flavorLabel, monthLabel, storeLabel } from '../lib/format.ts'
import { storeParam, type View } from '../lib/store.ts'

const WARM = ['#b45309', '#c26a12', '#d08425', '#dda153', '#e9c087', '#f4dfc2']

type Order = 'top' | 'bottom'

function Column({
  title,
  rows,
  ramp,
  max,
  className,
}: {
  title: string
  rows: FlavorTotal[]
  ramp: string[]
  max: number
  className: string
}) {
  return (
    <section className={className}>
      <h2 className="card-title">{title}</h2>
      <div style={{ marginTop: 8 }}>
        {rows.map((row, i) => (
          <div className="rank-row" key={row.flavor}>
            <span className="rank">{i + 1}</span>
            <div>
              <div className="rank-name">{flavorLabel(row.flavor)}</div>
              <div className="track" style={{ marginTop: 4 }}>
                <div
                  style={{ width: `${(row.units / max) * 100}%`, background: ramp[i] ?? ramp.at(-1) }}
                />
              </div>
            </div>
            <span className="num">{count(row.units)}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function FlavorRanking({ view }: { view: View }) {
  const [order, setOrder] = useState<Order>('top')
  const store = storeParam(view.store)
  const month = view.monthTo
  const top = getTopFlavors({ store, month, limit: FLAVORS.length })
  const bottom = getTopFlavors({ store, month, limit: FLAVORS.length, order: 'bottom' })
  const max = Math.max(...top.map((r) => r.units), 1)

  return (
    <>
      <div className="controls">
        <div className="segmented">
          <button className={order === 'top' ? 'active' : ''} onClick={() => setOrder('top')}>
            Best sellers
          </button>
          <button className={order === 'bottom' ? 'active' : ''} onClick={() => setOrder('bottom')}>
            Slow movers
          </button>
        </div>
        <div className="card-sub">
          {storeLabel(view.store)} · {monthLabel(month)}
        </div>
      </div>

      <div className="ranking-cols">
        <Column
          title="Best sellers"
          rows={top}
          ramp={FLAVOR_RAMP}
          max={max}
          className={order === 'top' ? 'card ranking-col' : 'card ranking-col dim'}
        />
        <Column
          title="Slow movers"
          rows={bottom}
          ramp={WARM}
          max={max}
          className={order === 'bottom' ? 'card ranking-col warm' : 'card ranking-col warm dim'}
        />
      </div>

      <p className="provenance">
        Both columns come from the same tool: <span className="mono">get_top_flavors</span> with{' '}
        <span className="mono">order: "top"</span> and <span className="mono">order: "bottom"</span>.
        Shop owners use the slow movers to decide what to drop from the menu.
      </p>
    </>
  )
}
