import { useState } from 'react'
import type { Store } from '../store'
import { isPremium } from '../store'
import type { SiteId, SymptomEntry } from '../types'
import { SYMPTOMS, RED_FLAGS } from '../data'
import { dayKey, sortByDate, suggestSite, uid, siteLabel } from '../utils'
import { fromL, fromW, fmtNum, lUnit, parseNum, t, toW, wUnit } from '../i18n'
import { BodyMap } from './BodyMap'

export function DoseForm({ store, onDone }: { store: Store; onDone: (msg: string) => void }) {
  const { data, update } = store
  const suggested = suggestSite(data.doses)
  const last = sortByDate(data.doses).at(-1)
  const [site, setSite] = useState<SiteId>(suggested)
  const [date, setDate] = useState(dayKey())
  const [dose, setDose] = useState(data.profile!.doseLabel)
  const [note, setNote] = useState('')
  return (
    <form onSubmit={e => {
      e.preventDefault()
      update(d => ({ ...d, doses: [...d.doses, { id: uid(), date, site, doseLabel: dose, note: note || undefined }] }))
      onDone(t('Dose registrada. Muito bem! 💪', 'Dose logged. Nice work! 💪'))
    }}>
      <p className="muted">{t('Toque no local onde você aplicou.', 'Tap where you injected.')} <span className="legend sug">●</span> {t('sugerido', 'suggested')} <span className="legend last">●</span> {t('última vez', 'last time')}</p>
      <BodyMap selected={site} suggested={suggested} lastUsed={last?.site} onSelect={setSite} />
      <p className="center"><b>{siteLabel(site)}</b></p>
      <div className="row2">
        <label className="field">{t('Data', 'Date')}<input type="date" value={date} max={dayKey()} onChange={e => setDate(e.target.value)} /></label>
        <label className="field">{t('Dose', 'Dose')}<input value={dose} onChange={e => setDose(e.target.value)} /></label>
      </div>
      <label className="field">{t('Observação (opcional)', 'Note (optional)')}<input value={note} onChange={e => setNote(e.target.value)} placeholder={t('Ex.: troquei a agulha', 'e.g. new pen today')} /></label>
      <button className="btn primary block" type="submit">{t('Salvar dose', 'Save dose')}</button>
    </form>
  )
}

export function WeightForm({ store, onDone, goPremium }: { store: Store; onDone: (msg: string) => void; goPremium: () => void }) {
  const { data, update } = store
  const last = sortByDate(data.weights).at(-1)
  const [w, setW] = useState(last ? fmtNum(toW(last.kg)) : '')
  const [waist, setWaist] = useState('')
  const [hip, setHip] = useState('')
  const [neck, setNeck] = useState('')
  const [date, setDate] = useState(dayKey())
  const premium = isPremium(data)
  const kg = fromW(parseNum(w))
  return (
    <form onSubmit={e => {
      e.preventDefault()
      if (!(kg > 30)) return
      update(d => ({
        ...d, weights: [...d.weights.filter(x => x.date !== date), {
          id: uid(), date, kg, waistCm: fromL(parseNum(waist)) || undefined, hipCm: fromL(parseNum(hip)) || undefined, neckCm: fromL(parseNum(neck)) || undefined
        }]
      }))
      onDone(t('Peso registrado 📉', 'Weight logged 📉'))
    }}>
      <label className="field big-input">{t('Peso', 'Weight')} ({wUnit()})
        <input inputMode="decimal" value={w} onChange={e => setW(e.target.value)} placeholder="00,0" autoFocus />
      </label>
      <label className="field">{t('Data', 'Date')}<input type="date" value={date} max={dayKey()} onChange={e => setDate(e.target.value)} /></label>
      <div className="row2">
        <label className="field">{t('Cintura', 'Waist')} ({lUnit()})<input inputMode="decimal" value={waist} onChange={e => setWaist(e.target.value)} placeholder={t('opcional', 'optional')} /></label>
        <label className="field">{t('Quadril', 'Hips')} ({lUnit()})<input inputMode="decimal" value={hip} onChange={e => setHip(e.target.value)} placeholder={t('opcional', 'optional')} /></label>
      </div>
      <label className="field">{t('Pescoço', 'Neck')} ({lUnit()})<input inputMode="decimal" value={neck} onChange={e => setNeck(e.target.value)} placeholder={t('opcional: deixa a análise corporal mais precisa', 'optional: makes body analysis more accurate')} /></label>
      <p className="muted tiny">{t('Cintura: na altura do umbigo. Quadril: na parte mais larga do bumbum. Pescoço: logo abaixo do pomo de adão.', 'Waist: at your belly button. Hips: widest part of your buttocks. Neck: just below the Adam\'s apple.')}</p>
      {!premium && <p className="muted small">{t('Dica: pese-se no mesmo horário, de manhã, em jejum.', 'Tip: weigh yourself at the same time each morning, before eating.')} <button type="button" className="link" onClick={goPremium}>{t('No Premium você vê sua análise corporal completa.', 'Premium shows your full body analysis.')}</button></p>}
      <button className="btn primary block" type="submit" disabled={!(kg > 30)}>{t('Salvar', 'Save')}</button>
    </form>
  )
}

export function SymptomForm({ store, onDone }: { store: Store; onDone: (msg: string) => void }) {
  const { update } = store
  const [items, setItems] = useState<SymptomEntry[]>([])
  const [note, setNote] = useState('')
  const [none, setNone] = useState(false)
  const toggle = (id: string) => {
    setNone(false)
    setItems(prev => {
      const cur = prev.find(i => i.id === id)
      if (!cur) return [...prev, { id, severity: 1 }]
      if (cur.severity < 3) return prev.map(i => i.id === id ? { ...i, severity: (i.severity + 1) as 1 | 2 | 3 } : i)
      return prev.filter(i => i.id !== id)
    })
  }
  const sevLabel = ['', t('leve', 'mild'), t('médio', 'moderate'), t('forte', 'severe')]
  const strong = items.some(i => i.severity === 3)
  return (
    <form onSubmit={e => {
      e.preventDefault()
      update(d => ({ ...d, symptoms: [...d.symptoms, { id: uid(), date: new Date().toISOString(), items, note: note || undefined }] }))
      onDone(items.length ? t('Anotado. Veja as dicas na aba Sintomas.', 'Saved. See tips in the Symptoms tab.') : t('Que bom que você está bem! 🌿', 'Glad you are feeling good! 🌿'))
    }}>
      <p className="muted">{t('Toque uma vez para leve, duas para médio e três para forte.', 'Tap once for mild, twice for moderate, three times for severe.')}</p>
      <div className="sym-grid">
        {SYMPTOMS().map(s => {
          const it = items.find(i => i.id === s.id)
          return (
            <button type="button" key={s.id} className={`sym ${it ? 'sev' + it.severity : ''}`} onClick={() => toggle(s.id)}
              aria-label={`${s.label}${it ? ', ' + sevLabel[it.severity] : ''}`}>
              <span className="emoji">{s.emoji}</span>{s.label}
              {it && <small>{sevLabel[it.severity]}</small>}
            </button>
          )
        })}
      </div>
      <button type="button" className={`chip block ${none ? 'on' : ''}`} onClick={() => { setItems([]); setNone(true) }}>😊 {t('Estou bem, sem sintomas', 'I feel fine, no symptoms')}</button>
      {strong && (
        <div className="alert" role="alert">
          <b>{t('Sintoma forte?', 'Severe symptom?')}</b> {t('Procure atendimento médico se tiver:', 'Get medical care if you have:')} {RED_FLAGS().slice(0, 2).join('; ').toLowerCase()}.
        </div>
      )}
      <label className="field">{t('Observação (opcional)', 'Note (optional)')}<input value={note} onChange={e => setNote(e.target.value)} placeholder={t('Ex.: piorou depois do almoço', 'e.g. worse after lunch')} /></label>
      <button className="btn primary block" type="submit" disabled={!items.length && !none}>{t('Salvar', 'Save')}</button>
    </form>
  )
}
