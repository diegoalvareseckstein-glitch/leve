import type { Store } from '../store'
import { adherence, dayKey, doseStatus, sortByDate, suggestSite, siteLabel, fmtDate } from '../utils'
import { fmtW, fmtWater, GLASS_ML, locale, t, waterUnit, wUnit } from '../i18n'
import { Bar, Icon, Ring } from '../components/ui'
import type { Tab } from '../App'
import { supplyStatus, titrationStatus } from './Doses'
import { buildPlan, nextWorkout } from '../workouts'
import { hasBodyProfile } from '../fitness'

export function Today({ store, go, openDose, openSymptom, openWeight }:
  { store: Store; go: (t: Tab) => void; openDose: () => void; openSymptom: () => void; openWeight: () => void }) {
  const { data, update } = store
  const p = data.profile!
  const st = doseStatus(p, data.doses)
  const site = suggestSite(data.doses)
  const adh = adherence(p, data.doses)
  const weights = sortByDate(data.weights)
  const current = weights.at(-1)?.kg ?? p.startWeight
  const lost = p.startWeight - current
  const toGoal = Math.max(0, p.startWeight - p.goalWeight)
  const goalPct = toGoal ? Math.max(0, Math.min(100, (lost / toGoal) * 100)) : 0
  const today = dayKey()
  const food = data.food[today] ?? { protein: 0, water: 0, items: [] }
  const hour = new Date().getHours()
  const hello = hour < 12 ? t('Bom dia', 'Good morning') : hour < 18 ? t('Boa tarde', 'Good afternoon') : t('Boa noite', 'Good evening')
  const doneToday = data.doses.some(d => d.date.slice(0, 10) === today)
  const sup = supplyStatus(data)
  const tit = titrationStatus(data)
  const plan = hasBodyProfile(p) ? buildPlan(p, current) : null
  const nw = plan ? nextWorkout(plan) : null

  const addWater = (ml: number) => update(d => {
    const f = d.food[today] ?? { protein: 0, water: 0, items: [] }
    return { ...d, food: { ...d.food, [today]: { ...f, water: Math.max(0, Math.round(f.water + ml)) } } }
  })

  return (
    <div className="screen">
      <header className="greet">
        <p className="muted">{new Date().toLocaleDateString(locale(), { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        <h1>{hello}, {p.name}</h1>
      </header>

      <section className={`card dose-card tone-${doneToday ? 'done' : st.tone}`} aria-labelledby="dose-h">
        <div className="dose-top">
          <div>
            <p className="eyebrow">{p.medication} · {p.doseLabel}</p>
            <h2 id="dose-h">{doneToday ? t('Dose de hoje registrada ✓', "Today's dose logged ✓") : st.label}</h2>
            {!doneToday && st.tone === 'ok' && <p className="muted">{fmtDate(dayKey(st.next), { weekday: 'long', day: 'numeric', month: 'short' })} {t('às', 'at')} {p.doseTime}</p>}
          </div>
          <div className="pill"><Icon name="pen" size={18} /></div>
        </div>
        <div className="site-hint">
          <span className="dot" /><span>{t('Próximo local sugerido:', 'Suggested next site:')} <b>{siteLabel(site)}</b></span>
        </div>
        {!doneToday && <button className="btn primary block" onClick={openDose}>{t('Registrar dose', 'Log dose')}</button>}
      </section>

      {sup && sup.days <= 10 && (
        <button className="card tap warn" onClick={() => go('doses')}>
          <b className="warn-text">💉 {t(`Sua caneta acaba em cerca de ${sup.days} dias`, `Your medication runs out in about ${sup.days} days`)}</b>
          <p className="small muted">{t('Compre ou peça a receita agora para não atrasar o tratamento.', 'Refill now so you do not miss a dose.')}</p>
        </button>
      )}
      {!sup && (
        <button className="card tap soft" onClick={() => go('doses')}>
          <b>💉 {t('Quantas doses você tem em casa?', 'How many doses do you have left?')}</b>
          <p className="small muted">{t('Informe e o Leve avisa antes de acabar.', 'Tell Leve and it will warn you before you run out.')}</p>
        </button>
      )}
      {tit.next && tit.daysToNext !== null && tit.daysToNext <= 14 && (
        <p className="pill-note">📈 {t(`Sua dose muda para ${tit.next.dose} em ${tit.daysToNext} dias, conforme o plano do seu médico.`, `Your dose changes to ${tit.next.dose} in ${tit.daysToNext} days, per your doctor's plan.`)}</p>
      )}

      <div className="grid2">
        <button className="card tap" onClick={() => go('progresso')}>
          <p className="eyebrow">{t('Perdidos', 'Lost')}</p>
          <div className="big">{lost > 0 ? fmtW(lost) : '0'}<small> {wUnit()}</small></div>
          <Bar value={goalPct} max={100} />
          <p className="muted small">{t(`${Math.round(goalPct)}% da meta de ${fmtW(p.goalWeight)} kg`, `${Math.round(goalPct)}% of the way to ${fmtW(p.goalWeight)} lb`)}</p>
        </button>
        <button className="card tap" onClick={() => go('doses')}>
          <p className="eyebrow">{t('Adesão', 'On track')}</p>
          <div className="big">{adh.pct}<small>%</small></div>
          <Bar value={adh.pct} max={100} color="var(--accent)" />
          <p className="muted small">{t(`${adh.taken} de ${adh.expected} doses no prazo`, `${adh.taken} of ${adh.expected} doses on time`)}</p>
        </button>
      </div>

      <section className="card" aria-labelledby="hoje-meta">
        <h3 id="hoje-meta">{t('Metas de hoje', "Today's goals")}</h3>
        <div className="today-goals">
          <button className="goal tap" onClick={() => go('comida')} aria-label={t(`Proteína: ${food.protein} de ${p.proteinGoal} gramas`, `Protein: ${food.protein} of ${p.proteinGoal} grams`)}>
            <Ring value={food.protein} max={p.proteinGoal} size={104}>
              <b>{food.protein}</b><small>/{p.proteinGoal} g</small>
            </Ring>
            <span>{t('Proteína', 'Protein')}</span>
          </button>
          <div className="goal">
            <Ring value={food.water} max={p.waterGoal} size={104} color="var(--water)">
              <b>{fmtWater(food.water)}</b><small>/{fmtWater(p.waterGoal)} {waterUnit()}</small>
            </Ring>
            <span>{t('Água', 'Water')}</span>
            <div className="mini-actions">
              <button className="btn small ghost" onClick={() => addWater(-GLASS_ML())} aria-label={t('Remover um copo de água', 'Remove a glass of water')}>−</button>
              <button className="btn small water" onClick={() => addWater(GLASS_ML())}>{t('+ copo', '+ glass')}</button>
            </div>
          </div>
        </div>
      </section>

      <button className="card tap workout-today" onClick={() => go('treino')}>
        <span className="emoji">🏋️</span>
        <div>
          <b>{nw ? (nw.inDays === 0 ? t(`Treino de hoje: ${nw.workout.title}`, `Today's workout: ${nw.workout.title}`) : t(`Próximo treino: ${nw.workout.title} em ${nw.inDays} dia${nw.inDays > 1 ? 's' : ''}`, `Next workout: ${nw.workout.title} in ${nw.inDays} day${nw.inDays > 1 ? 's' : ''}`)) : t('Monte seu treino personalizado', 'Build your personalized workout')}</b>
          <p className="muted small">{nw ? t(`${nw.workout.exercises.length} exercícios · cerca de ${nw.workout.exercises.length * 5 + 15} min`, `${nw.workout.exercises.length} exercises · about ${nw.workout.exercises.length * 5 + 15} min`) : t('Pela sua idade, peso e nível de atividade', 'Based on your age, weight and activity level')}</p>
        </div>
      </button>

      <div className="grid2">
        <button className="card tap action" onClick={() => go('sintomas')}><span className="emoji">🩺</span>{t('Sintomas e dicas', 'Symptoms & tips')}</button>
        <button className="card tap action" onClick={() => go('lembretes')}><span className="emoji">⏰</span>{t('Lembretes e alarmes', 'Reminders & alarms')}</button>
      </div>

      <div className="grid2">
        <button className="card tap action" onClick={openSymptom}><span className="emoji">🤢</span>{t('Como você está se sentindo?', 'How are you feeling?')}</button>
        <button className="card tap action" onClick={openWeight}><span className="emoji">⚖️</span>{t('Registrar peso', 'Log weight')}</button>
      </div>
    </div>
  )
}
