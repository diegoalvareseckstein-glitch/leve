import type { Store } from '../store'
import { adherence, dayKey, doseStatus, fmtKg, sortByDate, suggestSite, siteLabel, fmtDate } from '../utils'
import { Bar, Icon, Ring } from '../components/ui'
import type { Tab } from '../App'

export function Today({ store, go, openDose, openSymptom, openWeight }:
  { store: Store; go: (t: Tab) => void; openDose: () => void; openSymptom: () => void; openWeight: () => void }) {
  const { data, update } = store
  const p = data.profile!
  const st = doseStatus(p, data.doses)
  const site = suggestSite(data.doses)
  const adh = adherence(p, data.doses)
  const weights = sortByDate(data.weights)
  const current = weights.at(-1)?.kg ?? p.startWeight
  const lost = p.startWeight - current
  const toGoal = Math.max(0, p.startWeight - p.goalWeight)
  const goalPct = toGoal ? Math.max(0, Math.min(100, (lost / toGoal) * 100)) : 0
  const today = dayKey()
  const food = data.food[today] ?? { protein: 0, water: 0, items: [] }
  const hour = new Date().getHours()
  const hello = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  const doneToday = data.doses.some(d => d.date.slice(0, 10) === today)

  const addWater = (ml: number) => update(d => {
    const f = d.food[today] ?? { protein: 0, water: 0, items: [] }
    return { ...d, food: { ...d.food, [today]: { ...f, water: Math.max(0, f.water + ml) } } }
  })

  return (
    <div className="screen">
      <header className="greet">
        <p className="muted">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        <h1>{hello}, {p.name}</h1>
      </header>

      <section className={`card dose-card tone-${doneToday ? 'done' : st.tone}`} aria-labelledby="dose-h">
        <div className="dose-top">
          <div>
            <p className="eyebrow">{p.medication} · {p.doseLabel}</p>
            <h2 id="dose-h">{doneToday ? 'Dose de hoje registrada ✓' : st.label}</h2>
            {!doneToday && st.tone === 'ok' && <p className="muted">{fmtDate(dayKey(st.next), { weekday: 'long', day: 'numeric', month: 'short' })} às {p.doseTime}</p>}
          </div>
          <div className="pill"><Icon name="pen" size={18} /></div>
        </div>
        <div className="site-hint">
          <span className="dot" /><span>Próximo local sugerido: <b>{siteLabel(site)}</b></span>
        </div>
        {!doneToday && <button className="btn primary block" onClick={openDose}>Registrar dose</button>}
      </section>

      <div className="grid2">
        <button className="card tap" onClick={() => go('progresso')}>
          <p className="eyebrow">Perdidos</p>
          <div className="big">{lost > 0 ? fmtKg(lost) : '0'}<small> kg</small></div>
          <Bar value={goalPct} max={100} />
          <p className="muted small">{Math.round(goalPct)}% da meta de {fmtKg(p.goalWeight)} kg</p>
        </button>
        <button className="card tap" onClick={() => go('doses')}>
          <p className="eyebrow">Adesão</p>
          <div className="big">{adh.pct}<small>%</small></div>
          <Bar value={adh.pct} max={100} color="var(--accent)" />
          <p className="muted small">{adh.taken} de {adh.expected} doses no prazo</p>
        </button>
      </div>

      <section className="card" aria-labelledby="hoje-meta">
        <h3 id="hoje-meta">Metas de hoje</h3>
        <div className="today-goals">
          <button className="goal tap" onClick={() => go('comida')} aria-label={`Proteína: ${food.protein} de ${p.proteinGoal} gramas`}>
            <Ring value={food.protein} max={p.proteinGoal} size={104}>
              <b>{food.protein}</b><small>/{p.proteinGoal} g</small>
            </Ring>
            <span>Proteína</span>
          </button>
          <div className="goal">
            <Ring value={food.water} max={p.waterGoal} size={104} color="var(--water)">
              <b>{(food.water / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</b><small>/{(p.waterGoal / 1000).toLocaleString('pt-BR')} L</small>
            </Ring>
            <span>Água</span>
            <div className="mini-actions">
              <button className="btn small ghost" onClick={() => addWater(-250)} aria-label="Remover um copo de água">−</button>
              <button className="btn small water" onClick={() => addWater(250)}>+ copo</button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid2">
        <button className="card tap action" onClick={openSymptom}><span className="emoji">🤢</span>Como você está se sentindo?</button>
        <button className="card tap action" onClick={openWeight}><span className="emoji">⚖️</span>Registrar peso</button>
      </div>
    </div>
  )
}
