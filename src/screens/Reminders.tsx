import type { Store } from '../store'
import { isPremium } from '../store'
import type { Reminders as R, Profile } from '../types'
import { buildIcs, dayKey, doseStatus, downloadFile } from '../utils'
import { buildPlan } from '../workouts'
import { hasBodyProfile } from '../fitness'
import { Icon } from '../components/ui'
import { t } from '../i18n'

export const defaultReminders = (): R => ({
  water: { on: true, start: '08:00', end: '20:00', every: 2 },
  meals: { on: true, times: ['07:30', '10:00', '12:30', '16:00', '19:30'] },
  sleep: { on: true, bed: '22:30', wake: '06:30' },
  gym: { on: true, time: '18:00' }
})

const pad = (n: number) => String(n).padStart(2, '0')
const toMin = (hhmm: string) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m }
const fromMin = (m: number) => `${pad(Math.floor(((m % 1440) + 1440) % 1440 / 60))}:${pad(((m % 60) + 60) % 60)}`

/** Lista de todos os lembretes do dia: [horário, título, dias da semana (vazio = todo dia)]. */
export function reminderEvents(r: R, p: Profile, kg: number): [string, string, number[]][] {
  const ev: [string, string, number[]][] = []
  if (r.water.on) for (let m = toMin(r.water.start); m <= toMin(r.water.end); m += r.water.every * 60) ev.push([fromMin(m), t('💧 Hora de beber água', '💧 Time to drink water'), []])
  if (r.meals.on) {
    const names = [t('Café da manhã', 'Breakfast'), t('Lanche da manhã', 'Morning snack'), t('Almoço', 'Lunch'), t('Lanche da tarde', 'Afternoon snack'), t('Jantar', 'Dinner')]
    r.meals.times.forEach((tm, i) => ev.push([tm, `🍽️ ${names[i]}: ${t('comece pela proteína', 'start with protein')}`, []]))
  }
  if (r.sleep.on) {
    ev.push([fromMin(toMin(r.sleep.bed) - 30), t('🌙 Desacelere: telas de lado, luz baixa', '🌙 Wind down: screens off, lights low'), []])
    ev.push([r.sleep.bed, t('😴 Hora de dormir', '😴 Time for bed'), []])
  }
  if (r.gym.on && hasBodyProfile(p)) ev.push([r.gym.time, t('🏋️ Hoje tem treino', '🏋️ Workout day'), buildPlan(p, kg).weekdays])
  return ev.sort((a, b) => a[0].localeCompare(b[0]))
}

/** Arquivo de calendário com todos os lembretes recorrentes (funcionam com o app fechado). */
function buildAllIcs(events: [string, string, number[]][]) {
  const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']
  const d = dayKey().replace(/-/g, '')
  const body = events.map(([tm, title, wd], i) => [
    'BEGIN:VEVENT', `UID:leve-${i}-${Date.now()}@leve.app`, `DTSTAMP:${d}T000000`, `DTSTART:${d}T${tm.replace(':', '')}00`, 'DURATION:PT5M',
    `RRULE:${wd.length ? `FREQ=WEEKLY;BYDAY=${wd.map(x => days[x]).join(',')}` : 'FREQ=DAILY'}`, `SUMMARY:${title}`,
    'BEGIN:VALARM', 'TRIGGER:PT0M', 'ACTION:DISPLAY', `DESCRIPTION:${title}`, 'END:VALARM', 'END:VEVENT'
  ].join('\r\n'))
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Leve//Leve', 'CALSCALE:GREGORIAN', ...body, 'END:VCALENDAR'].join('\r\n')
}

export function Reminders({ store, toast, back, goPremium, kg }: { store: Store; toast: (m: string) => void; back: () => void; goPremium: () => void; kg: number }) {
  const { data, update } = store
  const p = data.profile!
  const r = data.reminders ?? defaultReminders()
  const premium = isPremium(data)
  const set = (fn: (r: R) => R) => update(d => ({ ...d, reminders: fn(d.reminders ?? defaultReminders()) }))
  const events = reminderEvents(r, p, kg)
  const sleepH = ((toMin(r.sleep.wake) - toMin(r.sleep.bed) + 1440) % 1440) / 60
  const mealNames = [t('Café', 'Breakfast'), t('Lanche', 'Snack'), t('Almoço', 'Lunch'), t('Lanche', 'Snack'), t('Jantar', 'Dinner')]

  async function enable() {
    if ('Notification' in window) await Notification.requestPermission()
    toast(t('Avisos ativados enquanto o app estiver aberto.', 'Alerts enabled while the app is open.'))
  }

  return (
    <div className="screen">
      <button className="link back" onClick={back}>‹ {t('Voltar', 'Back')}</button>
      <h1>{t('Lembretes e alarmes', 'Reminders & alarms')}</h1>

      <section className="card">
        <h3>💉 {t('Dose', 'Dose')}</h3>
        <p className="muted small">{t('Lembrete da sua dose no dia e horário certos. Grátis para todos.', 'Reminder for your dose on the right day and time. Free for everyone.')}</p>
        <button className="btn secondary block" onClick={() => { downloadFile('leve-dose.ics', buildIcs(p, doseStatus(p, data.doses).next), 'text/calendar'); toast(t('Abra o arquivo para salvar no calendário.', 'Open the file to add it to your calendar.')) }}>📅 {t('Adicionar lembrete da dose', 'Add dose reminder')}</button>
      </section>

      {!premium && (
        <section className="card locked">
          <h3>{t('Alarmes de água, comida, sono e treino', 'Water, meal, sleep and workout alarms')} <span className="badge">Premium</span></h3>
          <p className="muted small">{t('Com a caneta, a fome e a sede diminuem. Os alarmes garantem que você coma e beba o suficiente, durma bem e não perca treinos.', 'GLP-1s blunt hunger and thirst. Alarms make sure you eat and drink enough, sleep well and never miss a workout.')}</p>
          <button className="btn accent block" onClick={goPremium}><Icon name="star" size={18} /> {t('Liberar alarmes', 'Unlock alarms')}</button>
        </section>
      )}

      {premium && (
        <>
          <section className="card">
            <label className="toggle"><span>💧 {t('Beber água', 'Drink water')}</span><input type="checkbox" checked={r.water.on} onChange={e => set(x => ({ ...x, water: { ...x.water, on: e.target.checked } }))} /></label>
            {r.water.on && (
              <div className="row3 even">
                <label className="field">{t('De', 'From')}<input type="time" value={r.water.start} onChange={e => set(x => ({ ...x, water: { ...x.water, start: e.target.value } }))} /></label>
                <label className="field">{t('Até', 'To')}<input type="time" value={r.water.end} onChange={e => set(x => ({ ...x, water: { ...x.water, end: e.target.value } }))} /></label>
                <label className="field">{t('A cada', 'Every')}
                  <select value={r.water.every} onChange={e => set(x => ({ ...x, water: { ...x.water, every: Number(e.target.value) } }))}>
                    {[1, 2, 3].map(n => <option key={n} value={n}>{n}h</option>)}
                  </select></label>
              </div>
            )}
          </section>

          <section className="card">
            <label className="toggle"><span>🍽️ {t('Refeições', 'Meals')}</span><input type="checkbox" checked={r.meals.on} onChange={e => set(x => ({ ...x, meals: { ...x.meals, on: e.target.checked } }))} /></label>
            {r.meals.on && (
              <div className="meal-times">
                {r.meals.times.map((tm, i) => (
                  <label key={i} className="field">{mealNames[i]}
                    <input type="time" value={tm} onChange={e => set(x => ({ ...x, meals: { ...x.meals, times: x.meals.times.map((v, j) => j === i ? e.target.value : v) } }))} /></label>
                ))}
              </div>
            )}
          </section>

          <section className="card">
            <label className="toggle"><span>😴 {t('Sono', 'Sleep')}</span><input type="checkbox" checked={r.sleep.on} onChange={e => set(x => ({ ...x, sleep: { ...x.sleep, on: e.target.checked } }))} /></label>
            {r.sleep.on && (
              <>
                <div className="row2">
                  <label className="field">{t('Dormir às', 'Bedtime')}<input type="time" value={r.sleep.bed} onChange={e => set(x => ({ ...x, sleep: { ...x.sleep, bed: e.target.value } }))} /></label>
                  <label className="field">{t('Acordar às', 'Wake up')}<input type="time" value={r.sleep.wake} onChange={e => set(x => ({ ...x, sleep: { ...x.sleep, wake: e.target.value } }))} /></label>
                </div>
                <p className={sleepH < 7 ? 'warn-text small' : 'muted small'}>{t(`${sleepH.toLocaleString('pt-BR')} horas de sono.`, `${sleepH} hours of sleep.`)} {sleepH < 7 ? t('Adultos precisam de 7 a 9 horas. Dormir pouco aumenta a fome e dificulta emagrecer.', 'Adults need 7–9 hours. Short sleep raises hunger and slows weight loss.') : t('Ótimo, dentro das 7 a 9 horas recomendadas.', 'Great, within the recommended 7–9 hours.')}</p>
              </>
            )}
          </section>

          <section className="card">
            <label className="toggle"><span>🏋️ {t('Treino', 'Workout')}</span><input type="checkbox" checked={r.gym.on} onChange={e => set(x => ({ ...x, gym: { ...x.gym, on: e.target.checked } }))} /></label>
            {r.gym.on && (hasBodyProfile(p)
              ? <label className="field">{t('Horário do treino', 'Workout time')}<input type="time" value={r.gym.time} onChange={e => set(x => ({ ...x, gym: { ...x.gym, time: e.target.value } }))} /></label>
              : <p className="muted small">{t('Monte seu treino na aba Treino para ativar este alarme nos dias certos.', 'Build your plan in the Workout tab to schedule this alarm on the right days.')}</p>)}
          </section>

          <section className="card">
            <h3>{t(`Seu dia: ${events.length} lembretes`, `Your day: ${events.length} reminders`)}</h3>
            <ul className="list compact">{events.map(([tm, title, wd], i) => <li key={i}><span><b>{tm}</b> {title}</span>{wd.length > 0 && <small className="muted">{t('dias de treino', 'training days')}</small>}</li>)}</ul>
            <div className="stack">
              <button className="btn primary block" onClick={() => { downloadFile('leve-alarmes.ics', buildAllIcs(events), 'text/calendar'); toast(t('Abra o arquivo para salvar todos os alarmes no calendário.', 'Open the file to add all alarms to your calendar.')) }}>📅 {t('Salvar todos os alarmes no celular', 'Save all alarms to my phone')}</button>
              <button className="btn ghost block" onClick={enable}>{t('Ativar avisos do app', 'Turn on app alerts')}</button>
            </div>
            <p className="tiny muted">{t('Os alarmes do calendário tocam mesmo com o app fechado. Os avisos do app aparecem enquanto ele estiver aberto.', 'Calendar alarms ring even when the app is closed. App alerts show while the app is open.')}</p>
          </section>
        </>
      )}
    </div>
  )
}
