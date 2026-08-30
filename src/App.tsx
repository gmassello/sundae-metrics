import { MONTHS } from './data/stores.ts'
import AgentActivityLog from './components/AgentActivityLog.tsx'
import DateRangePicker from './components/DateRangePicker.tsx'
import FlavorBreakdown from './components/FlavorBreakdown.tsx'
import FlavorRanking from './components/FlavorRanking.tsx'
import KpiRow from './components/KpiRow.tsx'
import PeriodCompare from './components/PeriodCompare.tsx'
import SalesChart from './components/SalesChart.tsx'
import StoreSelector from './components/StoreSelector.tsx'
import { storeLabel } from './lib/format.ts'
import { setTab, undoView, useDashboard, type Tab } from './lib/store.ts'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'flavors', label: 'Flavor ranking' },
  { id: 'compare', label: 'Compare periods' },
]

export default function App() {
  const { view, tab, calls, previousView, highlight, webmcpReady } = useDashboard()
  const inRange = MONTHS.includes(view.monthFrom) && MONTHS.includes(view.monthTo)

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="logo">S</span>
          <div>
            <div className="brand-name">Sundae Metrics</div>
            <div className="brand-sub">Glacé · 4 locations</div>
          </div>
        </div>
        <div className={webmcpReady ? 'status-pill' : 'status-pill off'}>
          <span className="dot" />
          {webmcpReady ? 'WebMCP · 6 tools' : 'WebMCP · unavailable'}
        </div>
      </header>

      <div className="layout">
        <main className="content">
          {highlight && (
            <div className="toast">
              <span className="dot" />
              <span>
                The agent changed your view → <strong>{storeLabel(view.store)}</strong>
              </span>
              <button className="btn" onClick={undoView}>
                Undo
              </button>
            </div>
          )}

          <nav className="tabs">
            {TABS.map((t) => (
              <button
                key={t.id}
                className={t.id === tab ? 'tab active' : 'tab'}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </nav>

          <div className="controls">
            <StoreSelector store={view.store} highlight={highlight} />
            <DateRangePicker monthFrom={view.monthFrom} monthTo={view.monthTo} />
          </div>

          {!inRange && (
            <section className="card">
              <div className="empty">
                No data for this range. Pick two months between {MONTHS[0]} and{' '}
                {MONTHS[MONTHS.length - 1]}.
              </div>
            </section>
          )}
          {inRange && tab === 'overview' && (
            <>
              <KpiRow view={view} />
              <SalesChart view={view} highlight={highlight} />
              <FlavorBreakdown view={view} />
            </>
          )}
          {inRange && tab === 'flavors' && <FlavorRanking view={view} />}
          {inRange && tab === 'compare' && <PeriodCompare view={view} />}
        </main>

        <AgentActivityLog calls={calls} previousView={previousView} webmcpReady={webmcpReady} />
      </div>
    </div>
  )
}
