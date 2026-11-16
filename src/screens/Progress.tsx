import type { Store } from '../store'
import { isPremium } from '../store'
import { bmi, diffDays, fmtDate, fmtKg, parseDay, sortByDate } from '../utils'
import { WeightChart } from '../components/WeightChart'
import { Icon, Stat } from '../components/ui'

export function Progress({ store, openWeight, goPremium }: { store: Store; openWeight: () => void; goPremium: () => void }) {
  const { data, update } = store
  const p = data.profile!
  const logs = sortByDate(data.weights)
  const all = logs.length && logs[0].date <= p.startDate ? logs : [{ id: 'start', date: p.startDate, kg: p.startWeight }, ...logs]
  const current = all.at(-1)!.kg
  const lost = p.startWeight - current
  const pctBody = (lost / p.startWeight) * 100
  const premium = isPremium(data)

  // ritmo: kg/semana nas últimas ~4 semanas
  const last = all.at(-1)!
  const ref = [...all].reverse().find(l => diffDays(parseDay(last.date), parseDay(l.date)) >= 21) ?? all[0]
  const weeks = Math.max(1, diffDays(parseDay(last.date), parseDay(ref.date)) / 7)
  const pace = (ref.kg - last.kg) / weeks
  const remaining = current - p.goalWeight
  const etaWeeks = pace > 0.05 && remaining > 0 ? Math.ceil(remaining / pace) : null

  const milestones = [5, 10, 15]
  const waists = logs.filter(l => l.waistCm)

  return (
    <div className="screen">
      <div className="title-row">
        <h1>Progresso</h1>
        <button className="btn primary small" onClick={openWeight}><Icon name="plus" size={18} /> Peso</button>
      </div>

      <section className="card">
        <div className="stats3">
          <Stat label="Atual" value={<>{fmtKg(current)}<small> kg</small></>} />
          <Stat label="Perdido" value={<>{fmtKg(Math.max(0, lost))}<small> kg</small></>} hint={`${fmtKg(Math.max(0, pctBody))}% do peso`} />
          <Stat label="IMC" value={fmtKg(bmi(current, p.heightCm))} />
        </div>
        <WeightChart logs={all} goal={p.goalWeight} />
      </section>

      <section className="card">
        <h3>Marcos de saúde</h3>
        <p className="muted small">Perder 5% a 10% do peso já traz benefícios reais, como melhora da pressão, da glicose e das articulações.</p>
        <div className="milestones">
          {milestones.map(m => {
            const target = p.startWeight * (1 - m / 100)
            const hit = current <= target
            return (
              <div key={m} className={`milestone ${hit ? 'hit' : ''}`}>
                <span className="ms-icon">{hit ? '🏅' : '○'}</span>
                <b>{m}%</b><small>{fmtKg(target)} kg</small>
              </div>
            )
          })}
        </div>
      </section>

      <section className={`card ${premium ? '' : 'locked'}`}>
        <h3>Ritmo e previsão {!premium && <span className="badge">Premium</span>}</h3>
        {premium ? (
          <div className="stats3">
            <Stat label="Por semana" value={<>{pace > 0 ? '−' : ''}{fmtKg(Math.abs(pace))}<small> kg</small></>} hint="últimas semanas" />
            <Stat label="Faltam" value={<>{fmtKg(Math.max(0, remaining))}<small> kg</small></>} />
            <Stat label="Meta em" value={etaWeeks ? <>{etaWeeks}<small> sem.</small></> : '—'} hint={etaWeeks ? 'no ritmo atual' : 'registre mais pesos'} />
          </div>
        ) : (
          <button className="locked-body" onClick={goPremium}>
            <Icon name="lock" /> Veja quantos kg você perde por semana e quando deve chegar à meta.
          </button>
        )}
      </section>

      {waists.length > 0 && (
        <section className="card">
          <h3>Cintura</h3>
          <p className="big">{fmtKg(waists.at(-1)!.waistCm!)}<small> cm</small></p>
          {waists.length > 1 && <p className="delta">{fmtKg(waists[0].waistCm! - waists.at(-1)!.waistCm!)} cm a menos desde o primeiro registro</p>}
        </section>
      )}

      <section className="card">
        <h3>Registros</h3>
        {logs.length === 0 && <p className="muted">Ainda sem registros. Toque em "+ Peso" para começar.</p>}
        <ul className="list">
          {[...logs].reverse().map(l => (
            <li key={l.id}>
              <div><b>{fmtKg(l.kg)} kg</b> <span className="muted small">· {fmtDate(l.date, { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                {(l.waistCm || l.hipCm) && <div className="muted small">{l.waistCm ? `cintura ${l.waistCm} cm` : ''}{l.waistCm && l.hipCm ? ' · ' : ''}{l.hipCm ? `quadril ${l.hipCm} cm` : ''}</div>}
              </div>
              <button className="icon-btn" aria-label="Apagar registro" onClick={() => update(d => ({ ...d, weights: d.weights.filter(w => w.id !== l.id) }))}><Icon name="trash" size={18} /></button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
