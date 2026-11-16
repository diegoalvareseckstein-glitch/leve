import { useState } from 'react'
import type { Store } from '../store'
import { isPremium } from '../store'
import { DIETS, MEAL_NAMES, dietFactor, dietName, foodName, portion, scaleOption, totals } from '../diets'
import { calorieTarget, hasBodyProfile } from '../fitness'
import { BodySetup } from '../components/BodySetup'
import { Icon } from '../components/ui'
import { dayKey, sortByDate } from '../utils'
import { getLang, t } from '../i18n'

export function DietPlan({ store, toast, goPremium }: { store: Store; toast: (m: string) => void; goPremium: () => void }) {
  const { data, update } = store
  const p = data.profile!
  const premium = isPremium(data)
  const [choosing, setChoosing] = useState(false)
  const [opt, setOpt] = useState<Record<string, number>>({})
  const kg = sortByDate(data.weights).at(-1)?.kg ?? p.startWeight
  const today = dayKey()
  const done = data.meals?.[today] ?? []
  const en = getLang() === 'en'

  if (!hasBodyProfile(p)) {
    return (
      <section className="card">
        <h3>🥗 {t('Seu plano alimentar', 'Your meal plan')}</h3>
        <p className="muted small">{t('Responda algumas perguntas e calculamos suas calorias e um cardápio para você.', 'Answer a few questions and we will calculate your calories and a menu for you.')}</p>
        <BodySetup profile={p} onSave={np => { update(d => ({ ...d, profile: np })); toast(t('Pronto! Agora escolha sua dieta.', 'Done! Now pick your diet.')) }} />
      </section>
    )
  }

  const { target, tdee } = calorieTarget(p, kg)
  const diet = DIETS.find(d => d.id === p.dietId)

  if (!diet || choosing) {
    return (
      <section className="card">
        <h3>🥗 {t('Escolha sua dieta', 'Choose your diet')}</h3>
        <p className="muted small">{t(`Sua meta é de cerca de ${target.toLocaleString('pt-BR')} kcal por dia (você gasta ~${tdee.toLocaleString('pt-BR')}). Todas as dietas são ajustadas para isso.`, `Your target is about ${target.toLocaleString('en-US')} kcal a day (you burn ~${tdee.toLocaleString('en-US')}). Every diet is adjusted to it.`)}</p>
        <div className="diet-grid">
          {DIETS.map(d => {
            const [name, who, how] = dietName(d)
            return (
              <button key={d.id} className={`diet ${p.dietId === d.id ? 'on' : ''}`} onClick={() => { update(x => ({ ...x, profile: { ...x.profile!, dietId: d.id } })); setChoosing(false) }}>
                <span className="emoji">{d.emoji}</span>
                <b>{name}</b>
                <small className="diet-who">{who}</small>
                <small className="muted">{how}</small>
              </button>
            )
          })}
        </div>
      </section>
    )
  }

  const [name, who] = dietName(diet)
  const factor = dietFactor(diet, target)
  const plan = diet.meals.map(m => {
    const i = opt[m.id] ?? 0
    const items = scaleOption(m.options[i], factor)
    return { id: m.id, i, n: m.options.length, items, tot: totals(items) }
  })
  const dayTot = plan.reduce((a, m) => ({ k: a.k + m.tot.k, p: a.p + m.tot.p, c: a.c + m.tot.c, f: a.f + m.tot.f }), { k: 0, p: 0, c: 0, f: 0 })

  function toggleMeal(id: string, prot: number) {
    const was = done.includes(id)
    const label = MEAL_NAMES[id as keyof typeof MEAL_NAMES][en ? 1 : 0]
    update(d => {
      const f = d.food[today] ?? { protein: 0, water: 0, items: [] }
      const items = was ? f.items.filter(x => x.name !== label) : [...f.items, { name: label, protein: Math.round(prot) }]
      return {
        ...d,
        meals: { ...d.meals, [today]: was ? done.filter(x => x !== id) : [...done, id] },
        food: { ...d.food, [today]: { ...f, items, protein: items.reduce((s, x) => s + x.protein, 0) } }
      }
    })
    if (!was) toast(t('Refeição marcada. A proteína entrou na sua meta.', 'Meal checked. Protein added to your goal.'))
  }

  return (
    <section className="card">
      <div className="title-row">
        <h3>{diet.emoji} {name}</h3>
        <button className="btn ghost small" onClick={() => setChoosing(true)}>{t('Trocar', 'Change')}</button>
      </div>
      <p className="muted small">{who}</p>
      <div className="macros">
        <div><b>{Math.round(dayTot.k)}</b><small>kcal</small></div>
        <div><b>{Math.round(dayTot.p)} g</b><small>{t('proteína', 'protein')}</small></div>
        <div><b>{Math.round(dayTot.c)} g</b><small>{t('carbo', 'carbs')}</small></div>
        <div><b>{Math.round(dayTot.f)} g</b><small>{t('gordura', 'fat')}</small></div>
      </div>
      {!premium ? (
        <>
          <MealCard plan={plan[0]} en={en} done={false} onToggle={() => goPremium()} onSwap={() => goPremium()} />
          <button className="locked-body" onClick={goPremium}><Icon name="lock" /> {t('Veja o cardápio completo do dia, com porções calculadas para você, no Premium.', 'See your full daily menu, with portions calculated for you, in Premium.')}</button>
        </>
      ) : plan.map(m => (
        <MealCard key={m.id} plan={m} en={en} done={done.includes(m.id)}
          onToggle={() => toggleMeal(m.id, m.tot.p)}
          onSwap={() => setOpt(o => ({ ...o, [m.id]: (m.i + 1) % m.n }))} />
      ))}
      <p className="tiny muted">{t('Cardápio de orientação geral, calculado pela fórmula de Mifflin-St Jeor e pela Tabela TACO. Para um plano individual, consulte um nutricionista.', 'General guidance menu, calculated with the Mifflin-St Jeor equation and USDA data. For an individual plan, see a registered dietitian.')}</p>
    </section>
  )
}

function MealCard({ plan, en, done, onToggle, onSwap }:
  { plan: { id: string; i: number; n: number; items: [string, number][]; tot: { k: number; p: number } }; en: boolean; done: boolean; onToggle: () => void; onSwap: () => void }) {
  return (
    <div className={`meal ${done ? 'done' : ''}`}>
      <div className="meal-head">
        <button className={`meal-check ${done ? 'on' : ''}`} onClick={onToggle} aria-pressed={done} aria-label={t('Marcar refeição como feita', 'Mark meal as eaten')}>
          {done && <Icon name="check" size={16} />}
        </button>
        <div className="grow">
          <b>{MEAL_NAMES[plan.id as keyof typeof MEAL_NAMES][en ? 1 : 0]}</b>
          <div className="muted tiny">{Math.round(plan.tot.k)} kcal · {Math.round(plan.tot.p)} g {t('proteína', 'protein')}</div>
        </div>
        <button className="btn ghost small" onClick={onSwap}>{t(`Opção ${plan.i + 1}/${plan.n}`, `Option ${plan.i + 1}/${plan.n}`)} ↻</button>
      </div>
      <ul className="meal-items">
        {plan.items.map(([id, g]) => <li key={id}><span>{foodName(id)}</span><span className="muted">{portion(id, g)}</span></li>)}
      </ul>
    </div>
  )
}
