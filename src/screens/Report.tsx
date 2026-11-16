import type { Store } from '../store'
import { isPremium } from '../store'
import { SITES, SYMPTOMS } from '../data'
import { adherence, bmi, fmtDate, sortByDate, diffDays } from '../utils'
import { fmtL, fmtNum, fmtW, lUnit, locale, t, wUnit } from '../i18n'
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
        <button className="link back" onClick={back}>‹ {t('Voltar', 'Back')}</button>
        <h1>{t('Relatório para o médico', 'Doctor visit report')}</h1>
        <section className="card locked">
          <div className="report-preview" aria-hidden="true"><div /><div /><div /><div /></div>
          <p>{t('Leve um resumo claro para a consulta: doses, local de aplicação, evolução de peso e medidas, e sintomas do último mês. Em uma página, pronto para imprimir ou enviar por WhatsApp.', 'Bring a clear one-page summary to your appointment: doses, injection sites, weight and measurements, and last month\'s side effects. Ready to print or share.')}</p>
          <button className="btn accent block" onClick={goPlans}><Icon name="star" size={18} /> {t('Liberar com o Premium', 'Unlock with Premium')}</button>
        </section>
      </div>
    )
  }

  return (
    <div className="screen report">
      <div className="no-print title-row">
        <button className="link back" onClick={back}>‹ {t('Voltar', 'Back')}</button>
        <button className="btn primary small" onClick={() => window.print()}><Icon name="doc" size={18} /> {t('Salvar PDF / imprimir', 'Save PDF / print')}</button>
      </div>
      <article className="report-doc">
        <header>
          <h1>{t('Relatório de acompanhamento', 'Treatment progress report')}</h1>
          <p>{p.name} · {t('gerado em', 'generated on')} {new Date().toLocaleDateString(locale())} {t('pelo app Leve', 'by the Leve app')}</p>
        </header>
        <h2>{t('Tratamento', 'Treatment')}</h2>
        <table><tbody>
          <tr><th>{t('Medicamento', 'Medication')}</th><td>{p.medication} · {p.doseLabel} · {p.frequency === 'weekly' ? t('semanal', 'weekly') : t('diário', 'daily')}</td></tr>
          <tr><th>{t('Início', 'Started')}</th><td>{fmtDate(p.startDate, { day: '2-digit', month: '2-digit', year: 'numeric' })}</td></tr>
          <tr><th>{t('Adesão', 'Adherence')}</th><td>{adh.pct}% ({t(`${adh.taken} de ${adh.expected} doses previstas`, `${adh.taken} of ${adh.expected} scheduled doses`)})</td></tr>
        </tbody></table>
        <h2>{t('Peso', 'Weight')}</h2>
        <table><tbody>
          <tr><th>{t('Inicial', 'Starting')}</th><td>{fmtW(p.startWeight)} {wUnit()} ({t('IMC', 'BMI')} {fmtNum(bmi(p.startWeight, p.heightCm))})</td></tr>
          <tr><th>{t('Atual', 'Current')}</th><td>{fmtW(current)} {wUnit()} ({t('IMC', 'BMI')} {fmtNum(bmi(current, p.heightCm))})</td></tr>
          <tr><th>{t('Variação', 'Change')}</th><td>{fmtW(current - p.startWeight)} {wUnit()} ({fmtNum(((current - p.startWeight) / p.startWeight) * 100)}%)</td></tr>
          {weights.some(w => w.waistCm) && <tr><th>{t('Cintura', 'Waist')}</th><td>{weights.filter(w => w.waistCm).map(w => `${fmtL(w.waistCm!)} ${lUnit()} (${fmtDate(w.date)})`).join(' → ')}</td></tr>}
        </tbody></table>
        <WeightChart logs={all} goal={p.goalWeight} height={170} />
        <h2>{t('Sintomas (últimos 30 dias)', 'Side effects (last 30 days)')}</h2>
        {counts.size === 0 ? <p>{t('Nenhum sintoma registrado.', 'No side effects logged.')}</p> : (
          <table><thead><tr><th>{t('Sintoma', 'Symptom')}</th><th>{t('Vezes', 'Times')}</th><th>{t('Maior intensidade', 'Worst severity')}</th></tr></thead><tbody>
            {[...counts.entries()].map(([id, c]) => <tr key={id}><td>{SYMPTOMS().find(s => s.id === id)?.label}</td><td>{c.n}</td><td>{['', t('leve', 'mild'), t('média', 'moderate'), t('forte', 'severe')][c.max]}</td></tr>)}
          </tbody></table>
        )}
        <h2>{t('Últimas doses', 'Recent doses')}</h2>
        <table><thead><tr><th>{t('Data', 'Date')}</th><th>{t('Dose', 'Dose')}</th><th>{t('Local', 'Site')}</th></tr></thead><tbody>
          {doses.map(d => <tr key={d.id}><td>{fmtDate(d.date, { day: '2-digit', month: '2-digit', year: '2-digit' })}</td><td>{d.doseLabel}</td><td>{SITES().find(s => s.id === d.site)?.short}</td></tr>)}
        </tbody></table>
        <p className="tiny">{t('Dados registrados pelo próprio paciente. Não substitui avaliação médica.', 'Patient-reported data. Not a substitute for medical evaluation.')}</p>
      </article>
    </div>
  )
}
