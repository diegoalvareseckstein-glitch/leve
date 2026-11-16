import { useState } from 'react'
import type { Store } from '../store'
import { isPremium } from '../store'
import { buildPlan, nextWorkout } from '../workouts'
import { hasBodyProfile, needsClearance } from '../fitness'
import { BodySetup } from '../components/BodySetup'
import { Icon } from '../components/ui'
import { WEEKDAYS } from '../data'
import { dayKey, sortByDate, uid, diffDays, parseDay } from '../utils'
import { t } from '../i18n'

export function Workout({ store, toast, goPremium }: { store: Store; toast: (m: string) => void; goPremium: () => void }) {
  const { data, update } = store
  const p = data.profile!
  const premium = isPremium(data)
  const [editing, setEditing] = useState(false)
  const [open, setOpen] = useState<string | null>(null)
  const kg = sortByDate(data.weights).at(-1)?.kg ?? p.startWeight

  if (!hasBodyProfile(p) || editing) {
    return (
      <div className="screen">
        <h1>{t('Seu treino', 'Your workouts')}</h1>
        <section className="card">
          <h3>{t('Vamos montar seu treino', "Let's build your plan")}</h3>
          <p className="muted small">{t('O treino é calculado pelo seu peso, altura, idade, nível de atividade e onde você treina. Músculo forte ajuda a emagrecer sem flacidez e a manter o peso depois.', 'Your plan is built from your weight, height, age, activity level and where you train. Stronger muscles help you lose fat, not muscle, and keep the weight off.')}</p>
          <BodySetup profile={p} onSave={np => { update(d => ({ ...d, profile: np })); setEditing(false); toast(t('Plano pronto! 💪', 'Your plan is ready! 💪')) }} />
        </section>
      </div>
    )
  }

  const plan = buildPlan(p, kg)
  const next = nextWorkout(plan)
  const logs = data.workouts ?? []
  const doneToday = (key: string) => logs.some(l => l.date === dayKey() && l.workout === key)
  const thisWeek = logs.filter(l => diffDays(new Date(), parseDay(l.date)) < 7).length
  const levelName = [t('Iniciante', 'Beginner'), t('Intermediário', 'Intermediate'), t('Avançado', 'Advanced')][plan.level - 1]

  function finish(key: string) {
    update(d => ({ ...d, workouts: [...(d.workouts ?? []), { id: uid(), date: dayKey(), workout: key }] }))
    toast(t('Treino concluído! Seu músculo agradece. 💪', 'Workout done! Your muscles thank you. 💪'))
  }

  return (
    <div className="screen">
      <div className="title-row">
        <h1>{t('Seu treino', 'Your workouts')}</h1>
        <button className="btn ghost small" onClick={() => setEditing(true)}>{t('Ajustar', 'Adjust')}</button>
      </div>

      <section className="card hero-green">
        <p className="eyebrow">{t(`Semana ${plan.week} · nível ${levelName}`, `Week ${plan.week} · ${levelName} level`)}</p>
        <h2>{t(`${plan.days} treinos de força por semana`, `${plan.days} strength sessions a week`)}</h2>
        <p className="small">{t(`+ ${plan.cardioWeek} min de ${plan.cardioKind} na semana e ${plan.steps.toLocaleString('pt-BR')} passos por dia`, `+ ${plan.cardioWeek} min of ${plan.cardioKind} a week and ${plan.steps.toLocaleString('en-US')} steps a day`)}</p>
        <div className="week-dots" aria-label={t('Dias de treino', 'Training days')}>
          {[1, 2, 3, 4, 5, 6, 0].map(d => {
            const w = plan.workouts.find(x => x.weekday === d)
            return <span key={d} className={`wd ${w ? 'on' : ''} ${new Date().getDay() === d ? 'today' : ''}`}>{WEEKDAYS()[d].slice(0, 3)}</span>
          })}
        </div>
        <p className="small">{t(`Feitos nos últimos 7 dias: ${thisWeek} de ${plan.days}`, `Done in the last 7 days: ${thisWeek} of ${plan.days}`)}</p>
      </section>

      {needsClearance(p, kg) && (
        <section className="card warn">
          <b className="warn-text">🩺 {t('Peça liberação ao seu médico antes de começar', 'Get your doctor’s OK before you start')}</b>
          <p className="small">{t('Pela sua idade ou peso, é importante confirmar com o médico. Comece pelo nível mais leve.', 'Because of your age or weight, check with your doctor first. Start at the easiest level.')}</p>
        </section>
      )}
      {plan.noImpact && <p className="pill-note">🦵 {t('Seu plano é de baixo impacto: sem saltos, protegendo joelhos e coluna.', 'Your plan is low-impact: no jumping, easy on your knees and back.')}</p>}

      {!premium && (
        <section className="card locked">
          <h3>{t('Treino personalizado', 'Personalized training')} <span className="badge">Premium</span></h3>
          <p className="muted small">{t(`Seu plano já está pronto: ${plan.workouts.length} treinos com ${plan.workouts[0].exercises.length} exercícios cada, explicação de como fazer, séries, repetições e progressão semanal.`, `Your plan is ready: ${plan.workouts.length} workouts with ${plan.workouts[0].exercises.length} exercises each, how-to cues, sets, reps and weekly progression.`)}</p>
          <button className="btn accent block" onClick={goPremium}><Icon name="star" size={18} /> {t('Liberar meu treino', 'Unlock my workouts')}</button>
        </section>
      )}

      {premium && plan.workouts.map(w => {
        const isNext = next?.workout.key === w.key
        const expanded = open === w.key || (open === null && isNext)
        const done = doneToday(w.key)
        return (
          <section key={w.key} className={`card workout ${isNext ? 'next' : ''}`}>
            <button className="workout-head" onClick={() => setOpen(expanded ? '' : w.key)} aria-expanded={expanded}>
              <div>
                <p className="eyebrow">{WEEKDAYS()[w.weekday]}{isNext ? (next!.inDays === 0 ? t(' · hoje', ' · today') : next!.inDays === 1 ? t(' · amanhã', ' · tomorrow') : '') : ''}</p>
                <h3>{w.title}</h3>
                <p className="muted small">{w.exercises.length} {t('exercícios', 'exercises')} · ~{w.exercises.length * 5 + 15} min</p>
              </div>
              <span className="chev">{expanded ? '−' : '+'}</span>
            </button>
            {expanded && (
              <div className="workout-body">
                <p className="small"><b>🔥 {t('Aquecimento', 'Warm-up')}:</b> {w.warmup}</p>
                <ol className="ex-list">
                  {w.exercises.map(e => (
                    <li key={e.id}>
                      <div className="ex-top"><b>{e.name}</b><span className="ex-sets">{e.sets} × {e.reps}</span></div>
                      <p className="muted small">{e.how}</p>
                      <p className="tiny muted">{t('Descanso', 'Rest')}: {e.rest}</p>
                    </li>
                  ))}
                </ol>
                <p className="small"><b>🚶 {t('Cardio', 'Cardio')}:</b> {w.cardio}</p>
                <p className="small"><b>🧘 {t('Desaquecimento', 'Cool-down')}:</b> {w.cooldown}</p>
                <p className="tiny muted">{t('Use uma carga que deixe as 2 últimas repetições difíceis, mas com boa postura. Quando ficar fácil, aumente um pouco. Sentiu dor forte, tontura ou falta de ar? Pare.', 'Use a weight that makes the last 2 reps hard but with good form. When it gets easy, go a bit heavier. Stop if you feel sharp pain, dizziness or shortness of breath.')}</p>
                {done
                  ? <p className="center"><b>✓ {t('Treino de hoje concluído', 'Done for today')}</b></p>
                  : <button className="btn primary block" onClick={() => finish(w.key)}>{t('Concluí este treino', 'I finished this workout')}</button>}
              </div>
            )}
          </section>
        )
      })}

      <section className="card soft">
        <p className="small"><b>{t('Por que treinar força usando a caneta?', 'Why strength train on a GLP-1?')}</b> {t('Sem treino, até 1/3 do peso perdido pode ser músculo. Com força e proteína, você perde mais gordura, fica mais firme e tem menos chance de recuperar o peso.', 'Without training, up to a third of the weight lost can be muscle. With strength work and protein, you lose more fat, look firmer and are less likely to regain.')}</p>
      </section>
    </div>
  )
}
