import { useState } from 'react'
import type { Activity, Limit, Profile } from '../types'
import { t } from '../i18n'

/** Perguntas para personalizar treino e dieta: idade, sexo, nível de atividade, onde treina e limitações. */
export function BodySetup({ profile, onSave }: { profile: Profile; onSave: (p: Profile) => void }) {
  const [age, setAge] = useState(profile.age ? String(profile.age) : '')
  const [sex, setSex] = useState<Profile['sex']>(profile.sex)
  const [activity, setActivity] = useState<Activity | undefined>(profile.activity)
  const [place, setPlace] = useState<Profile['trainPlace']>(profile.trainPlace)
  const [days, setDays] = useState(profile.trainDays ?? 3)
  const [limits, setLimits] = useState<Limit[]>(profile.limits ?? [])
  const ok = Number(age) >= 16 && Number(age) <= 100 && sex && activity && place

  const ACT: [Activity, string, string][] = [
    ['sedentary', t('Sedentário', 'Sedentary'), t('Fico sentado a maior parte do dia e não faço exercício', 'I sit most of the day and do not exercise')],
    ['light', t('Pouco ativo', 'Lightly active'), t('Caminho um pouco ou faço exercício 1 a 2 vezes por semana', 'I walk a little or exercise 1–2 times a week')],
    ['moderate', t('Ativo', 'Moderately active'), t('Faço exercício 3 a 4 vezes por semana', 'I exercise 3–4 times a week')],
    ['active', t('Muito ativo', 'Very active'), t('Treino 5 vezes ou mais por semana ou tenho trabalho físico', 'I train 5+ times a week or have a physical job')]
  ]
  const LIM: [Limit, string][] = [['knee', t('Joelho', 'Knees')], ['back', t('Coluna / lombar', 'Lower back')], ['shoulder', t('Ombro', 'Shoulders')]]

  return (
    <div className="body-setup">
      <div className="row2">
        <label className="field">{t('Idade', 'Age')}<input inputMode="numeric" value={age} onChange={e => setAge(e.target.value)} placeholder="40" /></label>
        <fieldset className="field"><legend>{t('Sexo', 'Sex')}</legend>
          <div className="seg">
            <button type="button" className={sex === 'f' ? 'on' : ''} aria-pressed={sex === 'f'} onClick={() => setSex('f')}>{t('Feminino', 'Female')}</button>
            <button type="button" className={sex === 'm' ? 'on' : ''} aria-pressed={sex === 'm'} onClick={() => setSex('m')}>{t('Masculino', 'Male')}</button>
          </div>
        </fieldset>
      </div>
      <fieldset className="field"><legend>{t('Seu nível de atividade hoje', 'Your activity level today')}</legend>
        <div className="stack-sm">
          {ACT.map(([id, label, desc]) => (
            <button type="button" key={id} className={`chip ${activity === id ? 'on' : ''}`} aria-pressed={activity === id} onClick={() => setActivity(id)}>
              {label}<small>{desc}</small>
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="field"><legend>{t('Onde você vai treinar?', 'Where will you train?')}</legend>
        <div className="seg">
          <button type="button" className={place === 'home' ? 'on' : ''} aria-pressed={place === 'home'} onClick={() => setPlace('home')}>🏠 {t('Em casa', 'At home')}</button>
          <button type="button" className={place === 'gym' ? 'on' : ''} aria-pressed={place === 'gym'} onClick={() => setPlace('gym')}>🏋️ {t('Academia', 'Gym')}</button>
        </div>
      </fieldset>
      <fieldset className="field"><legend>{t('Quantos dias por semana?', 'How many days a week?')}</legend>
        <div className="seg four">
          {[2, 3, 4, 5].map(n => <button type="button" key={n} className={days === n ? 'on' : ''} aria-pressed={days === n} onClick={() => setDays(n)}>{n}</button>)}
        </div>
      </fieldset>
      <fieldset className="field"><legend>{t('Tem dor ou limitação em algum lugar?', 'Any pain or limitations?')}</legend>
        <div className="chips three">
          {LIM.map(([id, label]) => (
            <button type="button" key={id} className={`chip ${limits.includes(id) ? 'on' : ''}`} aria-pressed={limits.includes(id)}
              onClick={() => setLimits(l => l.includes(id) ? l.filter(x => x !== id) : [...l, id])}>{label}</button>
          ))}
        </div>
        <small className="muted">{t('Trocamos os exercícios que forçam essas regiões.', 'We swap out exercises that load these areas.')}</small>
      </fieldset>
      <button className="btn primary block" disabled={!ok}
        onClick={() => onSave({ ...profile, age: Number(age), sex, activity, trainPlace: place, trainDays: days, limits })}>
        {t('Montar meu plano', 'Build my plan')}
      </button>
    </div>
  )
}
