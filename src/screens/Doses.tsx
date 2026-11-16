import { useState } from 'react'
import type { Store } from '../store'
import { adherence, buildIcs, diffDays, dayKey, doseStatus, downloadFile, fmtDate, parseDay, siteLabel, sortByDate, suggestSite, uid } from '../utils'
import { BodyMap } from '../components/BodyMap'
import { Icon, Ring } from '../components/ui'
import { WEEKDAYS } from '../data'
import { t } from '../i18n'
import type { AppData } from '../types'

/** Doses que ainda restam no estoque e para quantos dias dá. */
export function supplyStatus(d: AppData) {
  if (!d.supply || !d.profile) return null
  const used = d.doses.filter(x => x.date >= d.supply!.setAt).length
  const left = Math.max(0, d.supply.dosesInStock - used)
  const days = left * (d.profile.frequency === 'weekly' ? 7 : 1)
  return { left, days }
}

/** Passo atual e próximo do plano de doses que o médico passou. */
export function titrationStatus(d: AppData) {
  const steps = [...(d.titration ?? [])].sort((a, b) => a.date.localeCompare(b.date))
  const today = dayKey()
  const current = [...steps].reverse().find(s => s.date <= today)
  const next = steps.find(s => s.date > today)
  return { steps, current, next, daysToNext: next ? diffDays(parseDay(next.date), new Date()) : null }
}

export function Doses({ store, openDose, toast }: { store: Store; openDose: () => void; toast: (m: string) => void }) {
  const { data, update } = store
  const p = data.profile!
  const doses = sortByDate(data.doses).reverse()
  const st = doseStatus(p, data.doses)
  const adh = adherence(p, data.doses)
  const sug = suggestSite(data.doses)
  const sup = supplyStatus(data)
  const tit = titrationStatus(data)
  const [stock, setStock] = useState('')
  const [stepDate, setStepDate] = useState('')
  const [stepDose, setStepDose] = useState('')

  async function enableNotifications() {
    if (!('Notification' in window)) return toast(t('Seu navegador não suporta notificações. Use o lembrete no calendário.', 'Your browser does not support notifications. Use the calendar reminder.'))
    const r = await Notification.requestPermission()
    toast(r === 'granted' ? t('Pronto! Vamos avisar quando abrir o app no dia da dose.', 'Done! We will remind you when you open the app on dose day.') : t('Notificações bloqueadas. Use o lembrete no calendário.', 'Notifications blocked. Use the calendar reminder.'))
  }

  return (
    <div className="screen">
      <h1>{t('Doses', 'Doses')}</h1>
      <section className="card dose-summary">
        <Ring value={adh.pct} max={100} size={112} color="var(--accent)">
          <b>{adh.pct}%</b><small>{t('adesão', 'on time')}</small>
        </Ring>
        <div>
          <h2>{st.label}</h2>
          <p className="muted">{p.medication} {p.doseLabel} · {p.frequency === 'weekly' ? t(`toda ${WEEKDAYS()[p.doseWeekday]}`, `every ${WEEKDAYS()[p.doseWeekday]}`) : t('todo dia', 'every day')} {t('às', 'at')} {p.doseTime}</p>
          <p className="muted small">{t(`Quem mantém as doses em dia costuma ter resultados melhores. Você registrou ${adh.taken} de ${adh.expected} doses previstas.`, `Staying on schedule usually means better results. You logged ${adh.taken} of ${adh.expected} scheduled doses.`)}</p>
        </div>
      </section>

      <section className={`card ${sup && sup.days <= 10 ? 'warn' : ''}`}>
        <h3>💉 {t('Estoque da caneta', 'Medication supply')}</h3>
        {sup ? (
          <>
            <p className="big">{sup.left}<small> {t(sup.left === 1 ? 'dose restante' : 'doses restantes', sup.left === 1 ? 'dose left' : 'doses left')}</small></p>
            <p className={sup.days <= 10 ? 'warn-text' : 'muted small'}>
              {sup.days <= 10
                ? t(`Acaba em cerca de ${sup.days} dias. Compre ou peça a receita agora para não ficar sem.`, `Runs out in about ${sup.days} days. Refill now so you don't miss a dose.`)
                : t(`Dá para cerca de ${sup.days} dias. Avisaremos quando faltarem 10 dias.`, `Enough for about ${sup.days} days. We'll warn you 10 days before it runs out.`)}
            </p>
          </>
        ) : <p className="muted small">{t('Diga quantas doses você tem em casa e o Leve avisa antes de acabar. Ficar sem remédio atrasa o tratamento.', 'Tell Leve how many doses you have at home and it will warn you before you run out. Running out sets your progress back.')}</p>}
        <form className="inline-form" onSubmit={e => {
          e.preventDefault(); const n = Number(stock); if (!(n >= 0)) return
          update(d => ({ ...d, supply: { dosesInStock: n, setAt: dayKey() } })); setStock(''); toast(t('Estoque atualizado', 'Supply updated'))
        }}>
          <input inputMode="numeric" value={stock} onChange={e => setStock(e.target.value)} placeholder={t('Doses que tenho agora', 'Doses I have now')} aria-label={t('Doses que tenho agora', 'Doses I have now')} />
          <button className="btn secondary" type="submit">{t('Salvar', 'Save')}</button>
        </form>
      </section>

      <section className="card">
        <h3>📈 {t('Plano de doses do médico', "Your doctor's dose plan")}</h3>
        <p className="muted small">{t('Anote as próximas doses que seu médico combinou com você. O Leve só lembra, não sugere doses.', 'Write down the dose steps your doctor planned. Leve only reminds you; it never suggests doses.')}</p>
        {tit.next && <p className="pill-note">{t(`Sua dose muda para ${tit.next.dose} em ${tit.daysToNext} dias`, `Your dose changes to ${tit.next.dose} in ${tit.daysToNext} days`)}</p>}
        {tit.steps.length > 0 && (
          <ol className="timeline">
            {tit.steps.map(s => (
              <li key={s.id} className={s === tit.current ? 'now' : s.date < dayKey() ? 'past' : ''}>
                <b>{s.dose}</b> <span className="muted small">{t('a partir de', 'from')} {fmtDate(s.date, { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                <button className="icon-btn" aria-label={t('Apagar etapa', 'Delete step')} onClick={() => update(d => ({ ...d, titration: (d.titration ?? []).filter(x => x.id !== s.id) }))}><Icon name="trash" size={16} /></button>
              </li>
            ))}
          </ol>
        )}
        <form className="row3" onSubmit={e => {
          e.preventDefault(); if (!stepDate || !stepDose.trim()) return
          update(d => ({ ...d, titration: [...(d.titration ?? []), { id: uid(), date: stepDate, dose: stepDose.trim() }] })); setStepDate(''); setStepDose('')
        }}>
          <input type="date" value={stepDate} onChange={e => setStepDate(e.target.value)} aria-label={t('Data', 'Date')} />
          <input value={stepDose} onChange={e => setStepDose(e.target.value)} placeholder={t('Dose', 'Dose')} aria-label={t('Dose', 'Dose')} />
          <button className="btn secondary" type="submit" aria-label={t('Adicionar etapa', 'Add step')}><Icon name="plus" size={18} /></button>
        </form>
      </section>

      <section className="card">
        <h3>{t('Rodízio do local de aplicação', 'Injection site rotation')}</h3>
        <p className="muted small">{t('Trocar de lugar a cada dose evita caroços e irritação na pele. Sugestão de agora:', 'Rotating sites helps prevent lumps and skin irritation. Suggested now:')} <b>{siteLabel(sug)}</b>.</p>
        <BodyMap suggested={sug} lastUsed={doses[0]?.site} />
        <button className="btn primary block" onClick={openDose}>{t('Registrar dose', 'Log dose')}</button>
      </section>

      <section className="card">
        <h3><Icon name="bell" size={18} /> {t('Lembretes', 'Reminders')}</h3>
        <p className="muted small">{t('O jeito mais confiável é adicionar ao calendário do celular. Ele avisa mesmo com o app fechado.', 'The most reliable way is your phone calendar. It reminds you even when the app is closed.')}</p>
        <div className="stack">
          <button className="btn secondary block" onClick={() => { downloadFile('leve-dose-reminder.ics', buildIcs(p, st.next), 'text/calendar'); toast(t('Abra o arquivo baixado para salvar no calendário.', 'Open the downloaded file to add it to your calendar.')) }}>
            📅 {t('Adicionar lembrete ao calendário', 'Add reminder to calendar')}
          </button>
          <button className="btn ghost block" onClick={enableNotifications}>{t('Ativar avisos do app', 'Turn on app notifications')}</button>
        </div>
      </section>

      <section className="card">
        <h3>{t('Histórico', 'History')}</h3>
        {doses.length === 0 && <p className="muted">{t('Nenhuma dose registrada ainda.', 'No doses logged yet.')}</p>}
        <ul className="list">
          {doses.map(d => (
            <li key={d.id}>
              <div>
                <b>{fmtDate(d.date, { weekday: 'short', day: '2-digit', month: 'short' })}</b> · {d.doseLabel}
                <div className="muted small">{siteLabel(d.site)}{d.note ? ` · ${d.note}` : ''}</div>
              </div>
              <button className="icon-btn" aria-label={t(`Apagar dose de ${fmtDate(d.date)}`, `Delete dose from ${fmtDate(d.date)}`)}
                onClick={() => update(x => ({ ...x, doses: x.doses.filter(y => y.id !== d.id) }))}><Icon name="trash" size={18} /></button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
