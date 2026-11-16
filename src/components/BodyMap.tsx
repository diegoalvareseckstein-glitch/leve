import type { SiteId } from '../types'
import { SITES } from '../data'

// Pontos no desenho (visão de frente; braço mostrado na lateral)
const POS: Record<SiteId, [number, number]> = {
  'braco-d': [60, 100], 'braco-e': [140, 100],
  'abd-d': [86, 128], 'abd-e': [114, 128],
  'coxa-d': [84, 196], 'coxa-e': [116, 196]
}

export function BodyMap({ selected, suggested, lastUsed, onSelect }:
  { selected?: SiteId; suggested?: SiteId; lastUsed?: SiteId; onSelect?: (s: SiteId) => void }) {
  return (
    <div className="bodymap">
      <svg viewBox="0 0 200 260" aria-hidden="true">
        <g fill="var(--body)" stroke="var(--body-line)" strokeWidth="1.5">
          <circle cx="100" cy="30" r="18" />
          <path d="M70 55 h60 q14 2 16 18 l10 60 q2 10-6 12 q-8 1-10-8 l-8-44 v52 q0 6 4 10 l-4 100 q-1 8-10 8 q-9 0-10-8 l-4-80 h-4 l-4 80 q-1 8-10 8 q-9 0-10-8 l-4-100 q4-4 4-10 v-52 l-8 44 q-2 9-10 8 q-8-2-6-12 l10-60 q2-16 16-18z" />
        </g>
      </svg>
      {SITES.map(s => {
        const [x, y] = POS[s.id]
        const cls = ['site', selected === s.id && 'sel', suggested === s.id && 'sug', lastUsed === s.id && 'last'].filter(Boolean).join(' ')
        return (
          <button key={s.id} className={cls} style={{ left: `${x / 2}%`, top: `${(y / 260) * 100}%` }}
            onClick={() => onSelect?.(s.id)} disabled={!onSelect} aria-pressed={selected === s.id}
            aria-label={`${s.label}${suggested === s.id ? ' (sugerido)' : ''}${lastUsed === s.id ? ' (último usado)' : ''}`}>
            <span />
          </button>
        )
      })}
    </div>
  )
}
