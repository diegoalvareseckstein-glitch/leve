import { useState } from 'react'
import type { Store } from '../store'
import { FOOD_TIPS, PROTEIN_FOODS } from '../data'
import { dayKey } from '../utils'
import { t } from '../i18n'
import { Icon, Ring } from '../components/ui'
import type { FoodDay } from '../types'
import { DietPlan } from './Diet'

export function Food({ store, toast, soon, goPremium }: { store: Store; toast: (m: string) => void; soon: (feature: string) => void; goPremium: () => void }) {
  const { data, update } = store
  const p = data.profile!
  const today = dayKey()
  const day: FoodDay = data.food[today] ?? { protein: 0, water: 0, items: [] }
  const [custom, setCustom] = useState('')
  const left = Math.max(0, p.proteinGoal - day.protein)

  const setDay = (fn: (f: FoodDay) => FoodDay) => update(d => ({ ...d, food: { ...d.food, [today]: fn(d.food[today] ?? { protein: 0, water: 0, items: [] }) } }))
  const add = (name: string, g: number) => {
    setDay(f => ({ ...f, protein: f.protein + g, items: [...f.items, { name, protein: g }] }))
    if (day.protein < p.proteinGoal && day.protein + g >= p.proteinGoal) toast(t('Meta de proteína batida! 🎉', 'Protein goal reached! 🎉'))
  }
  const remove = (idx: number) => setDay(f => ({ ...f, protein: Math.max(0, f.protein - f.items[idx].protein), items: f.items.filter((_, i) => i !== idx) }))

  let streak = 0
  for (let i = 1; i < 60; i++) {
    const d = new Date(); d.setDate(d.getDate() - i)
    if ((data.food[dayKey(d)]?.protein ?? 0) >= p.proteinGoal) streak++; else break
  }
  if (day.protein >= p.proteinGoal) streak++

  return (
    <div className="screen">
      <h1>{t('Alimentação', 'Nutrition')}</h1>
      <DietPlan store={store} toast={toast} goPremium={goPremium} />
      <section className="card protein-hero">
        <Ring value={day.protein} max={p.proteinGoal} size={140} stroke={14}>
          <b className="xl">{day.protein}</b><small>{t('de', 'of')} {p.proteinGoal} g</small>
        </Ring>
        <div>
          <h2>{left > 0 ? t(`Faltam ${left} g de proteína`, `${left} g of protein to go`) : t('Meta de hoje batida!', "Today's goal reached!")}</h2>
          <p className="muted small">{t('Sua meta é cerca de 1,2 g por kg do seu peso-meta. Confirme com seu nutricionista.', 'Your goal is about 1.2 g per kg of your goal weight. Check with your dietitian.')}</p>
          {streak > 0 && <p className="streak">🔥 {t(`${streak} dia${streak > 1 ? 's' : ''} seguido${streak > 1 ? 's' : ''}`, `${streak}-day streak`)}</p>}
        </div>
      </section>

      <section className="card soon">
        <h3>📸 {t('Foto do prato com IA', 'AI meal photo')} <span className="badge">{t('Em breve', 'Coming soon')}</span></h3>
        <p className="muted small">{t('Tire uma foto da refeição e o Leve calcula a proteína para você. Sem digitar nada.', 'Snap a photo of your meal and Leve estimates the protein for you. No typing.')}</p>
        <button className="btn secondary block soon-btn" onClick={() => soon('ia_foto')}>{t('Quero usar quando sair', 'Notify me when it launches')}</button>
      </section>

      <section className="card">
        <h3>{t('Adicionar rápido', 'Quick add')}</h3>
        <div className="food-grid">
          {PROTEIN_FOODS().map(f => (
            <button key={f.name} className="food" onClick={() => add(f.name, f.protein)} aria-label={t(`Adicionar ${f.name}, ${f.portion}, ${f.protein} gramas de proteína`, `Add ${f.name}, ${f.portion}, ${f.protein} grams of protein`)}>
              <span className="emoji">{f.emoji}</span>
              <span className="fname">{f.name}</span>
              <small className="muted">{f.portion}</small>
              <b>+{f.protein} g</b>
            </button>
          ))}
        </div>
        <form className="inline-form" onSubmit={e => { e.preventDefault(); const g = Number(custom); if (g > 0) { add(t('Outro', 'Other'), g); setCustom('') } }}>
          <input inputMode="numeric" value={custom} onChange={e => setCustom(e.target.value)} placeholder={t('Outro: gramas de proteína', 'Other: grams of protein')} aria-label={t('Gramas de proteína de outro alimento', 'Grams of protein from another food')} />
          <button className="btn secondary" type="submit"><Icon name="plus" size={18} /></button>
        </form>
        <p className="muted small">{t('Valores aproximados por porção, com base na Tabela TACO e rótulos comuns.', 'Approximate values per serving, based on USDA FoodData Central and common labels.')}</p>
      </section>

      {day.items.length > 0 && (
        <section className="card">
          <h3>{t('Hoje', 'Today')}</h3>
          <ul className="list">
            {day.items.map((it, i) => (
              <li key={i}><span>{it.name}</span><span className="row-end"><b>{it.protein} g</b>
                <button className="icon-btn" aria-label={t(`Remover ${it.name}`, `Remove ${it.name}`)} onClick={() => remove(i)}><Icon name="close" size={16} /></button></span></li>
            ))}
          </ul>
        </section>
      )}


      <section className="card">
        <h3>{t('Dicas para comer bem com a caneta', 'Eating well on a GLP-1')}</h3>
        {FOOD_TIPS().map(tip => (
          <details key={tip.title} className="tip"><summary><b>{tip.title}</b></summary><p>{tip.text}</p></details>
        ))}
      </section>
    </div>
  )
}
