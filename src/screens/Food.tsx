import { useState } from 'react'
import type { Store } from '../store'
import { FOOD_TIPS, PROTEIN_FOODS } from '../data'
import { dayKey } from '../utils'
import { Icon, Ring } from '../components/ui'
import type { FoodDay } from '../types'

export function Food({ store, toast }: { store: Store; toast: (m: string) => void }) {
  const { data, update } = store
  const p = data.profile!
  const today = dayKey()
  const day: FoodDay = data.food[today] ?? { protein: 0, water: 0, items: [] }
  const [custom, setCustom] = useState('')
  const left = Math.max(0, p.proteinGoal - day.protein)

  const setDay = (fn: (f: FoodDay) => FoodDay) => update(d => ({ ...d, food: { ...d.food, [today]: fn(d.food[today] ?? { protein: 0, water: 0, items: [] }) } }))
  const add = (name: string, g: number) => {
    setDay(f => ({ ...f, protein: f.protein + g, items: [...f.items, { name, protein: g }] }))
    if (day.protein < p.proteinGoal && day.protein + g >= p.proteinGoal) toast('Meta de proteína batida! 🎉')
  }
  const remove = (idx: number) => setDay(f => ({ ...f, protein: Math.max(0, f.protein - f.items[idx].protein), items: f.items.filter((_, i) => i !== idx) }))

  // dias seguidos com meta batida
  let streak = 0
  for (let i = 1; i < 60; i++) {
    const d = new Date(); d.setDate(d.getDate() - i)
    if ((data.food[dayKey(d)]?.protein ?? 0) >= p.proteinGoal) streak++; else break
  }
  if (day.protein >= p.proteinGoal) streak++

  return (
    <div className="screen">
      <h1>Alimentação</h1>
      <section className="card protein-hero">
        <Ring value={day.protein} max={p.proteinGoal} size={140} stroke={14}>
          <b className="xl">{day.protein}</b><small>de {p.proteinGoal} g</small>
        </Ring>
        <div>
          <h2>{left > 0 ? `Faltam ${left} g de proteína` : 'Meta de hoje batida!'}</h2>
          <p className="muted small">Sua meta é cerca de 1,2 g por kg do seu peso-meta. Confirme com seu nutricionista.</p>
          {streak > 0 && <p className="streak">🔥 {streak} dia{streak > 1 ? 's' : ''} seguido{streak > 1 ? 's' : ''}</p>}
        </div>
      </section>

      <section className="card">
        <h3>Adicionar rápido</h3>
        <div className="food-grid">
          {PROTEIN_FOODS.map(f => (
            <button key={f.name} className="food" onClick={() => add(f.name, f.protein)} aria-label={`Adicionar ${f.name}, ${f.portion}, ${f.protein} gramas de proteína`}>
              <span className="emoji">{f.emoji}</span>
              <span className="fname">{f.name}</span>
              <small className="muted">{f.portion}</small>
              <b>+{f.protein} g</b>
            </button>
          ))}
        </div>
        <form className="inline-form" onSubmit={e => { e.preventDefault(); const g = Number(custom); if (g > 0) { add('Outro', g); setCustom('') } }}>
          <input inputMode="numeric" value={custom} onChange={e => setCustom(e.target.value)} placeholder="Outro: gramas de proteína" aria-label="Gramas de proteína de outro alimento" />
          <button className="btn secondary" type="submit"><Icon name="plus" size={18} /></button>
        </form>
        <p className="muted small">Valores aproximados por porção, com base na Tabela TACO e rótulos comuns.</p>
      </section>

      {day.items.length > 0 && (
        <section className="card">
          <h3>Hoje</h3>
          <ul className="list">
            {day.items.map((it, i) => (
              <li key={i}><span>{it.name}</span><span className="row-end"><b>{it.protein} g</b>
                <button className="icon-btn" aria-label={`Remover ${it.name}`} onClick={() => remove(i)}><Icon name="close" size={16} /></button></span></li>
            ))}
          </ul>
        </section>
      )}

      <section className="card">
        <h3>Dicas para comer bem com a caneta</h3>
        {FOOD_TIPS.map(t => (
          <details key={t.title} className="tip"><summary><b>{t.title}</b></summary><p>{t.text}</p></details>
        ))}
      </section>
    </div>
  )
}
