import { MONTHS } from '../data/stores.ts'
import { setView } from '../lib/store.ts'

const MIN = MONTHS[0]
const MAX = MONTHS[MONTHS.length - 1]

function pick(field: 'monthFrom' | 'monthTo', month: string): void {
  if (month) setView({ [field]: month })
}

export default function DateRangePicker({
  monthFrom,
  monthTo,
}: {
  monthFrom: string
  monthTo: string
}) {
  return (
    <div className="range">
      <input
        type="month"
        min={MIN}
        max={MAX}
        value={monthFrom}
        onChange={(e) => pick('monthFrom', e.target.value)}
      />
      <span>→</span>
      <input
        type="month"
        min={MIN}
        max={MAX}
        value={monthTo}
        onChange={(e) => pick('monthTo', e.target.value)}
      />
    </div>
  )
}
