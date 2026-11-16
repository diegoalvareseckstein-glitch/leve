import type { Store } from '../store'
import { isPremium } from '../store'
import { SITES, SYMPTOMS } from '../data'
import { adherence, bmi, fmtDate, fmtKg, sortByDate, diffDays } from '../utils'
import { WeightChart } from '../components/WeightChart'
import { Icon } from '../components/ui'

export function Report({ store, back, goPlans }: { store: Store; back: () => void; goPlans: () => void }) {
  const { data } = store
  const p = data.profile!
  const premium = isPremium(data)
  const weights = sortByDate(data.weights)
  const all = weights.length && weights[0].date <= p.startDate ? weights : [{ id: 's', date: p.startDate, kg: p.startWeight }, ...weights]
  const current = all.at(-1)!.kg
  const adh = adherence(p, data.doses)
  const doses = sortByDate(data.doses).reverse().slice(0, 12)
  const recent = data.symptoms.filter(s => diffDays(new Date(), new Date(s.date)) <= 30)
  const counts = new Map<string, { n: number; max: number }>()
  recent.forEach(l => l.items.forEach(i => { const c = counts.get(i.id) ?? { n: 0, max: 0 }; counts.set(i.id, { n: c.n + 1, max: Math.max(c.max, i.severity) }) }))

  if (!premium) {
    return (
      <div className="screen">
        <button className="link back" onClick={back}>‹ Voltar</button>
        <h1>Relatório para o médico</h1>
        <section className="card locked">
          <div className="report-preview" aria-hidden="true"><div /><div /><div /><div /></div>
          <p>Leve um resumo claro para a consulta: doses, local de aplicação, evolução de peso e medidas, e sintomas do último mês. Em uma página, pronto para imprimir ou enviar por WhatsApp.</p>
          <button className="btn accent block" onClick={goPlans}><Icon name="star" size={18} /> Liberar com o Premium</button>
        </section>
      </div>
    )
  }

  return (
    <div className="screen report">
      <div className="no-print title-row">
        <button className="link back" onClick={back}>‹ Voltar</button>
        <button className="btn primary small" onClick={() => window.print()}><Icon name="doc" size={18} /> Salvar PDF / imprimir</button>
      </div>
      <article className="report-doc">
        <header>
          <h1>Relatório de acompanhamento</h1>
          <p>{p.name} · gerado em {new Date().toLocaleDateString('pt-BR')} pelo app Leve</p>
        </header>
        <h2>Tratamento</h2>
        <table><tbody>
          <tr><th>Medicamento</th><td>{p.medication} · {p.doseLabel} · {p.frequency === 'weekly' ? 'semanal' : 'diário'}</td></tr>
          <tr><th>Início</th><td>{fmtDate(p.startDate, { day: '2-digit', month: '2-digit', year: 'numeric' })}</td></tr>
          <tr><th>Adesão</th><td>{adh.pct}% ({adh.taken} de {adh.expected} doses previstas)</td></tr>
        </tbody></table>
        <h2>Peso</h2>
        <table><tbody>
          <tr><th>Inicial</th><td>{fmtKg(p.startWeight)} kg (IMC {fmtKg(bmi(p.startWeight, p.heightCm))})</td></tr>
          <tr><th>Atual</th><td>{fmtKg(current)} kg (IMC {fmtKg(bmi(current, p.heightCm))})</td></tr>
          <tr><th>Variação</th><td>{fmtKg(current - p.startWeight)} kg ({fmtKg(((current - p.startWeight) / p.startWeight) * 100)}%)</td></tr>
          {weights.some(w => w.waistCm) && <tr><th>Cintura</th><td>{weights.filter(w => w.waistCm).map(w => `${fmtKg(w.waistCm!)} cm (${fmtDate(w.date)})`).join(' → ')}</td></tr>}
        </tbody></table>
        <WeightChart logs={all} goal={p.goalWeight} height={170} />
        <h2>Sintomas (últimos 30 dias)</h2>
        {counts.size === 0 ? <p>Nenhum sintoma registrado.</p> : (
          <table><thead><tr><th>Sintoma</th><th>Vezes</th><th>Maior intensidade</th></tr></thead><tbody>
            {[...counts.entries()].map(([id, c]) => <tr key={id}><td>{SYMPTOMS.find(s => s.id === id)?.label}</td><td>{c.n}</td><td>{['', 'leve', 'média', 'forte'][c.max]}</td></tr>)}
          </tbody></table>
        )}
        <h2>Últimas doses</h2>
        <table><thead><tr><th>Data</th><th>Dose</th><th>Local</th></tr></thead><tbody>
          {doses.map(d => <tr key={d.id}><td>{fmtDate(d.date, { day: '2-digit', month: '2-digit', year: '2-digit' })}</td><td>{d.doseLabel}</td><td>{SITES.find(s => s.id === d.site)?.short}</td></tr>)}
        </tbody></table>
        <p className="tiny">Dados registrados pelo próprio paciente. Não substitui avaliação médica.</p>
      </article>
    </div>
  )
}
