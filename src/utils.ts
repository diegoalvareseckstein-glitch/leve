import type { DoseLog, Profile, SiteId } from './types'
import { SITES } from './data'
import { locale, t } from './i18n'

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

export function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}
export function parseDay(key: string): Date {
  const [y, m, d] = key.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d)
}
export function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x }
export function diffDays(a: Date, b: Date) {
  const A = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime()
  const B = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime()
  return Math.round((A - B) / 86400000)
}
export const fmtDate = (key: string, opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' }) =>
  parseDay(key).toLocaleDateString(locale(), opts).replace('.', '')
export const siteLabel = (id: SiteId) => SITES().find(s => s.id === id)?.label ?? id
export const sortByDate = <T extends { date: string }>(arr: T[]) => [...arr].sort((a, b) => a.date.localeCompare(b.date))

/** Próxima data prevista da dose. */
export function nextDoseDate(profile: Profile, doses: DoseLog[], today = new Date()): Date {
  const sorted = sortByDate(doses)
  const last = sorted.at(-1)
  if (profile.frequency === 'daily') {
    if (!last) return today
    const lastD = parseDay(last.date)
    return diffDays(today, lastD) >= 1 ? today : addDays(lastD, 1)
  }
  // semanal: próximo dia da semana marcado, pelo menos 4 dias depois da última dose
  let start = last ? addDays(parseDay(last.date), 4) : addDays(today, 0)
  if (!last && diffDays(today, parseDay(profile.startDate)) < 0) start = parseDay(profile.startDate)
  let d = new Date(start)
  for (let i = 0; i < 8; i++) {
    if (d.getDay() === profile.doseWeekday) return d
    d = addDays(d, 1)
  }
  return d
}

/** Status textual da dose em relação a hoje. */
export function doseStatus(profile: Profile, doses: DoseLog[], today = new Date()) {
  const next = nextDoseDate(profile, doses, today)
  const days = diffDays(next, today)
  if (days === 0) return { next, days, label: t('Hoje é dia de dose', 'Dose day is today'), tone: 'due' as const }
  if (days < 0) return { next, days, label: t(`Dose atrasada há ${-days} dia${-days > 1 ? 's' : ''}`, `Dose is ${-days} day${-days > 1 ? 's' : ''} late`), tone: 'late' as const }
  return { next, days, label: days === 1 ? t('Próxima dose amanhã', 'Next dose tomorrow') : t(`Próxima dose em ${days} dias`, `Next dose in ${days} days`), tone: 'ok' as const }
}

/** Sugere o local menos usado recentemente, nunca o último. */
export function suggestSite(doses: DoseLog[]): SiteId {
  const sorted = sortByDate(doses)
  const lastUse = new Map<SiteId, number>()
  sorted.forEach((d, i) => lastUse.set(d.site, i))
  let best = SITES()[0].id, bestScore = Infinity
  for (const s of SITES()) {
    const score = lastUse.has(s.id) ? lastUse.get(s.id)! : -1
    if (score < bestScore) { bestScore = score; best = s.id }
  }
  return best
}

/** Adesão: % das doses previstas (desde o início, até 12 semanas) que foram registradas. */
export function adherence(profile: Profile, doses: DoseLog[], today = new Date()) {
  const start = parseDay(profile.startDate)
  const windowStart = addDays(today, profile.frequency === 'weekly' ? -84 : -30)
  const from = start > windowStart ? start : windowStart
  const tolerance = profile.frequency === 'weekly' ? 2 : 0
  const doseDays = doses.map(d => parseDay(d.date))
  let expected = 0, taken = 0
  for (let d = new Date(from); diffDays(today, d) >= 0; d = addDays(d, 1)) {
    const scheduled = profile.frequency === 'daily' || d.getDay() === profile.doseWeekday
    if (!scheduled) continue
    const ok = doseDays.some(x => Math.abs(diffDays(x, d)) <= tolerance)
    if (!ok && diffDays(today, d) <= tolerance) continue // ainda dentro do prazo: não conta como falha
    expected++
    if (ok) taken++
  }
  return { expected, taken, pct: expected ? Math.round((taken / expected) * 100) : 100 }
}

export function bmi(kg: number, heightCm: number) { const h = heightCm / 100; return h ? kg / (h * h) : 0 }

export function downloadFile(name: string, content: string, type = 'text/plain') {
  const blob = new Blob([content], { type })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob); a.download = name
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

/** Arquivo de calendário com lembrete recorrente: funciona em iPhone, Android e Google Agenda. */
export function buildIcs(profile: Profile, next: Date): string {
  const [hh, mm] = profile.doseTime.split(':')
  const dt = `${dayKey(next).replace(/-/g, '')}T${hh}${mm}00`
  const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']
  const rrule = profile.frequency === 'daily' ? 'FREQ=DAILY' : `FREQ=WEEKLY;BYDAY=${days[profile.doseWeekday]}`
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Leve//Leve', 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT', `UID:leve-dose-${Date.now()}@leve.app`, `DTSTAMP:${dt}`, `DTSTART:${dt}`,
    `RRULE:${rrule}`, `SUMMARY:💉 ${t('Dose de', 'Dose:')} ${profile.medication}`,
    `DESCRIPTION:${t('Hora da sua dose. Abra o Leve para registrar e ver o próximo local de aplicação.', 'Time for your dose. Open Leve to log it and see your next injection site.')}`,
    'BEGIN:VALARM', 'TRIGGER:PT0M', 'ACTION:DISPLAY', `DESCRIPTION:${t('Hora da sua dose', 'Time for your dose')}`, 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR'
  ].join('\r\n')
}
