import type { Store } from '../store'
import { isPremium } from '../store'
import { RED_FLAGS, SYMPTOMS } from '../data'
import { diffDays, parseDay, sortByDate } from '../utils'
import { Icon } from '../components/ui'

export function Symptoms({ store, openSymptom, goPremium }: { store: Store; openSymptom: () => void; goPremium: () => void }) {
  const { data, update } = store
  const logs = [...data.symptoms].sort((a, b) => b.date.localeCompare(a.date))
  const recent = logs.filter(l => diffDays(new Date(), new Date(l.date)) <= 30)
  const counts = new Map<string, number>()
  recent.forEach(l => l.items.forEach(i => counts.set(i.id, (counts.get(i.id) ?? 0) + 1)))
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1])
  const premium = isPremium(data)

  // Em qual dia depois da dose os sintomas aparecem mais
  const doses = sortByDate(data.doses).map(d => parseDay(d.date))
  const byDay = Array(7).fill(0)
  logs.forEach(l => {
    if (!l.items.length) return
    const ld = new Date(l.date)
    const prev = [...doses].reverse().find(d => diffDays(ld, d) >= 0)
    if (prev) { const k = diffDays(ld, prev); if (k < 7) byDay[k] += l.items.length }
  })
  const maxDay = Math.max(...byDay)

  return (
    <div className="screen">
      <div className="title-row">
        <h1>Sintomas</h1>
        <button className="btn primary small" onClick={openSymptom}><Icon name="plus" size={18} /> Registrar</button>
      </div>

      <section className="card">
        <h3>Últimos 30 dias</h3>
        {top.length === 0 ? <p className="muted">Nenhum sintoma registrado. Registre como você se sente para receber dicas.</p> : (
          <div className="sym-summary">
            {top.map(([id, n]) => {
              const s = SYMPTOMS.find(x => x.id === id)!
              return (
                <details key={id} className="tip">
                  <summary><span className="emoji">{s.emoji}</span> <b>{s.label}</b> <span className="muted">{n}x</span></summary>
                  <p>{s.tip}</p>
                </details>
              )
            })}
          </div>
        )}
      </section>

      <section className={`card ${premium ? '' : 'locked'}`}>
        <h3>Quando os sintomas aparecem {!premium && <span className="badge">Premium</span>}</h3>
        {premium ? (maxDay === 0 ? <p className="muted">Registre doses e sintomas por alguns dias para ver o padrão.</p> : (
          <>
            <div className="days-bars" role="img" aria-label="Sintomas por dia após a dose">
              {byDay.map((v, i) => (
                <div key={i} className="db">
                  <div className="db-bar"><div style={{ height: `${maxDay ? (v / maxDay) * 100 : 0}%` }} /></div>
                  <small>{i === 0 ? 'Dia' : `+${i}`}</small>
                </div>
              ))}
            </div>
            <p className="muted small">Dias depois da aplicação. Use isso para planejar refeições mais leves nos dias mais difíceis.</p>
          </>
        )) : (
          <button className="locked-body" onClick={goPremium}><Icon name="lock" /> Descubra em quais dias depois da dose você sente mais efeitos.</button>
        )}
      </section>

      <section className="card danger">
        <h3><Icon name="alert" size={18} /> Procure um médico se tiver</h3>
        <ul className="bullets">{RED_FLAGS.map(r => <li key={r}>{r}</li>)}</ul>
        <p className="small">Em emergência, ligue <a href="tel:192"><b>192 (SAMU)</b></a>.</p>
      </section>

      <section className="card">
        <h3>Histórico</h3>
        <ul className="list">
          {logs.slice(0, 30).map(l => (
            <li key={l.id}>
              <div>
                <b>{new Date(l.date).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}</b>
                <div className="muted small">
                  {l.items.length ? l.items.map(i => SYMPTOMS.find(s => s.id === i.id)?.label + ['', '', ' (médio)', ' (forte)'][i.severity]).join(', ') : 'Sem sintomas 😊'}
                  {l.note ? ` · ${l.note}` : ''}
                </div>
              </div>
              <button className="icon-btn" aria-label="Apagar registro" onClick={() => update(d => ({ ...d, symptoms: d.symptoms.filter(s => s.id !== l.id) }))}><Icon name="trash" size={18} /></button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
