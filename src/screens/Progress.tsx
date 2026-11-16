import type { Store } from '../store'
import { isPremium } from '../store'
import { bmi, diffDays, fmtDate, parseDay, sortByDate } from '../utils'
import { fmtL, fmtNum, fmtW, lUnit, t, wUnit } from '../i18n'
import { WeightChart } from '../components/WeightChart'
import { Icon, Stat } from '../components/ui'
import { bodyAnalysis, hasBodyProfile } from '../fitness'

export function Progress({ store, openWeight, goPremium, goWorkout }: { store: Store; openWeight: () => void; goPremium: () => void; goWorkout: () => void }) {
  const { data, update } = store
  const p = data.profile!
  const logs = sortByDate(data.weights)
  const all = logs.length && logs[0].date <= p.startDate ? logs : [{ id: 'start', date: p.startDate, kg: p.startWeight }, ...logs]
  const current = all.at(-1)!.kg
  const lost = p.startWeight - current
  const pctBody = (lost / p.startWeight) * 100
  const premium = isPremium(data)

  const last = all.at(-1)!
  const ref = [...all].reverse().find(l => diffDays(parseDay(last.date), parseDay(l.date)) >= 21) ?? all[0]
  const weeks = Math.max(1, diffDays(parseDay(last.date), parseDay(ref.date)) / 7)
  const pace = (ref.kg - last.kg) / weeks
  const remaining = current - p.goalWeight
  const etaWeeks = pace > 0.05 && remaining > 0 ? Math.ceil(remaining / pace) : null
  // Platô: 3+ semanas de registros com menos de 0,5 kg de mudança
  const span = diffDays(parseDay(last.date), parseDay(ref.date))
  const plateau = span >= 21 && Math.abs(ref.kg - last.kg) < 0.5 && remaining > 0

  const waists = logs.filter(l => l.waistCm)

  return (
    <div className="screen">
      <div className="title-row">
        <h1>{t('Progresso', 'Progress')}</h1>
        <button className="btn primary small" onClick={openWeight}><Icon name="plus" size={18} /> {t('Peso', 'Weight')}</button>
      </div>

      <section className="card">
        <div className="stats3">
          <Stat label={t('Atual', 'Current')} value={<>{fmtW(current)}<small> {wUnit()}</small></>} />
          <Stat label={t('Perdido', 'Lost')} value={<>{fmtW(Math.max(0, lost))}<small> {wUnit()}</small></>} hint={t(`${fmtNum(Math.max(0, pctBody))}% do peso`, `${fmtNum(Math.max(0, pctBody))}% of body weight`)} />
          <Stat label={t('IMC', 'BMI')} value={fmtNum(bmi(current, p.heightCm))} />
        </div>
        <WeightChart logs={all} goal={p.goalWeight} />
      </section>

      <section className={`card ${premium ? '' : 'locked'}`}>
        <h3>🧬 {t('Análise corporal', 'Body analysis')} {!premium && <span className="badge">Premium</span>}</h3>
        {!premium ? (
          <button className="locked-body" onClick={goPremium}><Icon name="lock" /> {t('Descubra seu % de gordura, massa magra, risco pela cintura e sua faixa de peso saudável.', 'See your body fat %, lean mass, waist risk and healthy weight range.')}</button>
        ) : !hasBodyProfile(p) ? (
          <button className="locked-body" onClick={goWorkout}>{t('Informe idade e sexo na aba Treino para liberar sua análise.', 'Add your age and sex in the Workout tab to unlock your analysis.')}</button>
        ) : (() => {
          const lastM = [...logs].reverse().find(l => l.waistCm) ?? {}
          const a = bodyAnalysis(p, current, lastM)
          const bmiTxt: Record<string, [string, string]> = { under: ['abaixo do peso', 'underweight'], normal: ['peso saudável', 'healthy weight'], over: ['sobrepeso', 'overweight'], ob1: ['obesidade grau 1', 'obesity class 1'], ob2: ['obesidade grau 2', 'obesity class 2'], ob3: ['obesidade grau 3', 'obesity class 3'] }
          const fatTxt: Record<string, [string, string]> = { good: ['ótimo', 'great'], ok: ['aceitável', 'acceptable'], high: ['acima do ideal', 'above ideal'] }
          return (
            <>
              <div className="stats3">
                <Stat label={t('Gordura', 'Body fat')} value={<>{fmtNum(a.fat)}<small>%</small></>} hint={t(fatTxt[a.fatBand][0], fatTxt[a.fatBand][1])} />
                <Stat label={t('Massa magra', 'Lean mass')} value={<>{fmtW(a.leanKg)}<small> {wUnit()}</small></>} />
                <Stat label={t('Gordura', 'Fat mass')} value={<>{fmtW(a.fatKg)}<small> {wUnit()}</small></>} />
              </div>
              <ul className="analysis">
                <li><span>{t('IMC', 'BMI')}</span><b>{fmtNum(a.bmi)} · {t(bmiTxt[a.bmiBand][0], bmiTxt[a.bmiBand][1])}</b></li>
                <li><span>{t('Faixa de peso saudável', 'Healthy weight range')}</span><b>{fmtW(a.healthyMin)}–{fmtW(a.healthyMax)} {wUnit()}</b></li>
                {a.whtr !== undefined && <li><span>{t('Cintura ÷ altura', 'Waist-to-height')}</span><b className={a.whtrRisk ? 'warn-text' : 'ok-text'}>{a.whtr.toFixed(2)} · {a.whtrRisk ? t('risco aumentado (ideal < 0,5)', 'increased risk (aim < 0.5)') : t('saudável', 'healthy')}</b></li>}
                {a.whr !== undefined && <li><span>{t('Cintura ÷ quadril', 'Waist-to-hip')}</span><b className={a.whrRisk ? 'warn-text' : 'ok-text'}>{a.whr.toFixed(2)} · {a.whrRisk ? t('gordura concentrada na barriga', 'fat stored around the belly') : t('distribuição saudável', 'healthy distribution')}</b></li>}
                {a.shape && <li><span>{t('Tipo de corpo', 'Body shape')}</span><b>{a.shape === 'apple' ? t('🍎 Maçã (barriga)', '🍎 Apple (belly)') : t('🍐 Pera (quadril)', '🍐 Pear (hips)')}</b></li>}
              </ul>
              <p className="tiny muted">{a.method === 'navy'
                ? t('% de gordura estimado pela fórmula da Marinha dos EUA (cintura, quadril, pescoço e altura). Bioimpedância ou DEXA são mais precisos.', 'Body fat estimated with the U.S. Navy formula (waist, hips, neck and height). Bioimpedance or DEXA are more accurate.')
                : t('Estimativa pelo IMC, idade e sexo. Registre cintura, quadril e pescoço junto com o peso para um resultado mais preciso.', 'Estimated from BMI, age and sex. Log waist, hips and neck with your weight for a more accurate result.')}</p>
            </>
          )
        })()}
      </section>

      {plateau && (
        <section className="card warn">
          <h3>⏸️ {t('Peso parado há 3 semanas', 'Weight stalled for 3 weeks')}</h3>
          <p className="small">{t('Platô é normal e costuma passar. O que mais ajuda:', 'Plateaus are normal and usually pass. What helps most:')}</p>
          <ul className="bullets small">
            <li>{t('Bater a meta de proteína todos os dias', 'Hit your protein goal every day')}</li>
            <li>{t('Treino de força 2 a 3 vezes por semana', 'Strength training 2 to 3 times a week')}</li>
            <li>{t('Dormir bem e beber água', 'Sleep well and stay hydrated')}</li>
            <li>{t('Conversar com seu médico sobre o plano de doses', 'Talk to your doctor about your dose plan')}</li>
          </ul>
          <p className="muted small">{t('Medidas como a cintura podem continuar caindo mesmo com o peso parado.', 'Measurements like your waist can keep shrinking even when the scale does not move.')}</p>
        </section>
      )}

      <section className="card">
        <h3>{t('Marcos de saúde', 'Health milestones')}</h3>
        <p className="muted small">{t('Perder 5% a 10% do peso já traz benefícios reais, como melhora da pressão, da glicose e das articulações.', 'Losing 5% to 10% of your weight already brings real benefits, like better blood pressure, blood sugar and joints.')}</p>
        <div className="milestones">
          {[5, 10, 15].map(m => {
            const target = p.startWeight * (1 - m / 100)
            const hit = current <= target
            return (
              <div key={m} className={`milestone ${hit ? 'hit' : ''}`}>
                <span className="ms-icon">{hit ? '🏅' : '○'}</span>
                <b>{m}%</b><small>{fmtW(target)} {wUnit()}</small>
              </div>
            )
          })}
        </div>
      </section>

      <section className={`card ${premium ? '' : 'locked'}`}>
        <h3>{t('Ritmo e previsão', 'Pace and forecast')} {!premium && <span className="badge">Premium</span>}</h3>
        {premium ? (
          <div className="stats3">
            <Stat label={t('Por semana', 'Per week')} value={<>{pace > 0 ? '−' : ''}{fmtW(Math.abs(pace))}<small> {wUnit()}</small></>} hint={t('últimas semanas', 'recent weeks')} />
            <Stat label={t('Faltam', 'To go')} value={<>{fmtW(Math.max(0, remaining))}<small> {wUnit()}</small></>} />
            <Stat label={t('Meta em', 'Goal in')} value={etaWeeks ? <>{etaWeeks}<small> {t('sem.', 'wks')}</small></> : '—'} hint={etaWeeks ? t('no ritmo atual', 'at this pace') : t('registre mais pesos', 'log more weights')} />
          </div>
        ) : (
          <button className="locked-body" onClick={goPremium}>
            <Icon name="lock" /> {t('Veja quanto você perde por semana e quando deve chegar à meta.', 'See how much you lose per week and when you will reach your goal.')}
          </button>
        )}
      </section>

      {waists.length > 0 && (
        <section className="card">
          <h3>{t('Cintura', 'Waist')}</h3>
          <p className="big">{fmtL(waists.at(-1)!.waistCm!)}<small> {lUnit()}</small></p>
          {waists.length > 1 && <p className="delta">{t(`${fmtL(waists[0].waistCm! - waists.at(-1)!.waistCm!)} cm a menos desde o primeiro registro`, `${fmtL(waists[0].waistCm! - waists.at(-1)!.waistCm!)} in smaller since your first entry`)}</p>}
        </section>
      )}

      <section className="card">
        <h3>{t('Registros', 'Entries')}</h3>
        {logs.length === 0 && <p className="muted">{t('Ainda sem registros. Toque em "+ Peso" para começar.', 'No entries yet. Tap "+ Weight" to start.')}</p>}
        <ul className="list">
          {[...logs].reverse().map(l => (
            <li key={l.id}>
              <div><b>{fmtW(l.kg)} {wUnit()}</b> <span className="muted small">· {fmtDate(l.date, { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                {(l.waistCm || l.hipCm) && <div className="muted small">{l.waistCm ? `${t('cintura', 'waist')} ${fmtL(l.waistCm)} ${lUnit()}` : ''}{l.waistCm && l.hipCm ? ' · ' : ''}{l.hipCm ? `${t('quadril', 'hips')} ${fmtL(l.hipCm)} ${lUnit()}` : ''}</div>}
              </div>
              <button className="icon-btn" aria-label={t('Apagar registro', 'Delete entry')} onClick={() => update(d => ({ ...d, weights: d.weights.filter(w => w.id !== l.id) }))}><Icon name="trash" size={18} /></button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
