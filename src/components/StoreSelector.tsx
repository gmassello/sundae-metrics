import { STORE_IDS } from '../data/stores.ts'
import { storeLabel } from '../lib/format.ts'
import { setView, type ViewStore } from '../lib/store.ts'

const OPTIONS: ViewStore[] = [...STORE_IDS, 'all']

export default function StoreSelector({
  store,
  highlight,
}: {
  store: ViewStore
  highlight: boolean
}) {
  return (
    <div className="segmented">
      {OPTIONS.map((id) => {
        const active = id === store
        return (
          <button
            key={id}
            className={active ? (highlight ? 'written' : 'active') : ''}
            onClick={() => setView({ store: id })}
          >
            {id === 'all' ? 'All' : storeLabel(id)}
          </button>
        )
      })}
    </div>
  )
}
