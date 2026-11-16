import { useState } from 'react'
import type { Store } from '../store'
import { isPremium } from '../store'
import type { SiteId, SymptomEntry } from '../types'
import { SYMPTOMS, RED_FLAGS } from '../data'
import { dayKey, sortByDate, suggestSite, uid, siteLabel } from '../utils'
import { BodyMap } from './BodyMap'

const num = (s: string) => Number(String(s).replace(',', '.'))

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
      onDone('Dose registrada. Muito bem! 💪')
    }}>
      <p className="muted">Toque no local onde você aplicou. <span className="legend sug">●</span> sugerido <span className="legend last">●</span> última vez</p>
      <BodyMap selected={site} suggested={suggested} lastUsed={last?.site} onSelect={setSite} />
      <p className="center"><b>{siteLabel(site)}</b></p>
      <div className="row2">
        <label className="field">Data<input type="date" value={date} max={dayKey()} onChange={e => setDate(e.target.value)} /></label>
        <label className="field">Dose<input value={dose} onChange={e => setDose(e.target.value)} /></label>
      </div>
      <label className="field">Observação (opcional)<input value={note} onChange={e => setNote(e.target.value)} placeholder="Ex.: troquei a agulha" /></label>
      <button className="btn primary block" type="submit">Salvar dose</button>
    </form>
  )
}

export function WeightForm({ store, onDone, goPremium }: { store: Store; onDone: (msg: string) => void; goPremium: () => void }) {
  const { data, update } = store
  const last = sortByDate(data.weights).at(-1)
  const [kg, setKg] = useState(last ? String(last.kg).replace('.', ',') : '')
  const [waist, setWaist] = useState('')
  const [hip, setHip] = useState('')
  const [date, setDate] = useState(dayKey())
  const premium = isPremium(data)
  return (
    <form onSubmit={e => {
      e.preventDefault()
      if (!(num(kg) > 30)) return
      update(d => ({
        ...d, weights: [...d.weights.filter(w => w.date !== date), {
          id: uid(), date, kg: num(kg), waistCm: num(waist) || undefined, hipCm: num(hip) || undefined
        }]
      }))
      onDone('Peso registrado 📉')
    }}>
      <label className="field big-input">Peso (kg)
        <input inputMode="decimal" value={kg} onChange={e => setKg(e.target.value)} placeholder="00,0" autoFocus />
      </label>
      <label className="field">Data<input type="date" value={date} max={dayKey()} onChange={e => setDate(e.target.value)} /></label>
      <div className="row2">
        <label className="field">Cintura (cm)<input inputMode="decimal" value={waist} onChange={e => setWaist(e.target.value)} placeholder="opcional" /></label>
        <label className="field">Quadril (cm)<input inputMode="decimal" value={hip} onChange={e => setHip(e.target.value)} placeholder="opcional" /></label>
      </div>
      {!premium && <p className="muted small">Dica: pese-se no mesmo horário, de manhã, em jejum. <button type="button" className="link" onClick={goPremium}>No Premium você vê o ritmo semanal e a previsão da meta.</button></p>}
      <button className="btn primary block" type="submit" disabled={!(num(kg) > 30)}>Salvar</button>
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
  const sevLabel = ['', 'leve', 'médio', 'forte']
  const strong = items.some(i => i.severity === 3)
  return (
    <form onSubmit={e => {
      e.preventDefault()
      update(d => ({ ...d, symptoms: [...d.symptoms, { id: uid(), date: new Date().toISOString(), items, note: note || undefined }] }))
      onDone(items.length ? 'Anotado. Veja as dicas na aba Sintomas.' : 'Que bom que você está bem! 🌿')
    }}>
      <p className="muted">Toque uma vez para leve, duas para médio e três para forte.</p>
      <div className="sym-grid">
        {SYMPTOMS.map(s => {
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
      <button type="button" className={`chip block ${none ? 'on' : ''}`} onClick={() => { setItems([]); setNone(true) }}>😊 Estou bem, sem sintomas</button>
      {strong && (
        <div className="alert" role="alert">
          <b>Sintoma forte?</b> Procure atendimento médico se tiver: {RED_FLAGS.slice(0, 2).join('; ').toLowerCase()}.
        </div>
      )}
      <label className="field">Observação (opcional)<input value={note} onChange={e => setNote(e.target.value)} placeholder="Ex.: piorou depois do almoço" /></label>
      <button className="btn primary block" type="submit" disabled={!items.length && !none}>Salvar</button>
    </form>
  )
}
