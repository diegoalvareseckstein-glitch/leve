import { useState } from 'react'
import type { Profile } from '../types'
import { MEDICATIONS, WEEKDAYS } from '../data'
import { dayKey } from '../utils'
import { fromW, imperial, parseNum, t, wUnit, type Lang } from '../i18n'

export function Onboarding({ onDone, onDemo, lang, setLang }:
  { onDone: (p: Profile) => void; onDemo: () => void; lang: Lang; setLang: (l: Lang) => void }) {
  const meds = MEDICATIONS()
  const [step, setStep] = useState(0)
  const [p, setP] = useState({
    name: '', medication: meds[0].id as string, doseLabel: '', frequency: 'weekly' as Profile['frequency'],
    doseWeekday: new Date().getDay(), doseTime: '08:00', heightCm: '', heightFt: '', heightIn: '', startWeight: '', goalWeight: '', agree: false
  })
  const set = (k: string, v: unknown) => setP(prev => ({ ...prev, [k]: v }))
  const heightCm = imperial() ? (parseNum(p.heightFt) * 12 + (parseNum(p.heightIn) || 0)) * 2.54 : parseNum(p.heightCm)
  const startKg = fromW(parseNum(p.startWeight)), goalKg = fromW(parseNum(p.goalWeight))

  const canNext = [true, p.name.trim().length > 0 && p.doseLabel.trim().length > 0, heightCm > 100 && startKg > 30 && goalKg > 30, p.agree][step]

  function finish() {
    onDone({
      name: p.name.trim(), medication: p.medication, doseLabel: p.doseLabel.trim(), frequency: p.frequency,
      doseWeekday: Number(p.doseWeekday), doseTime: p.doseTime, heightCm: Math.round(heightCm), startWeight: startKg,
      goalWeight: goalKg, startDate: dayKey(),
      proteinGoal: Math.round(goalKg * 1.2 / 5) * 5,
      waterGoal: Math.min(3500, Math.round(startKg * 35 / 250) * 250)
    })
  }

  return (
    <div className="onboarding">
      <div className="ob-top">
        <div className="ob-progress" aria-label={t(`Passo ${step + 1} de 4`, `Step ${step + 1} of 4`)}>
          {[0, 1, 2, 3].map(i => <span key={i} className={i <= step ? 'on' : ''} />)}
        </div>
        <button className="lang-btn" onClick={() => setLang(lang === 'en' ? 'pt' : 'en')} aria-label={t('Change language to English', 'Mudar idioma para português')}>
          {lang === 'en' ? '🇧🇷 PT' : '🇺🇸 EN'}
        </button>
      </div>

      {step === 0 && (
        <div className="ob-step ob-hero">
          <div className="logo-big" aria-hidden="true">🌿</div>
          <h1>{t('Bem-vindo ao', 'Welcome to')} <span className="brand">Leve</span></h1>
          <p className="lead">{t('Seu tratamento com canetas, organizado e no controle. Sem planilha, sem esquecer dose.', 'Your GLP-1 journey, organized and under control. No spreadsheets, no missed doses.')}</p>
          <ul className="ob-list">
            <li><b>💉 {t('Lembrete de dose', 'Dose reminders')}</b> {t('e o próximo lugar para aplicar', 'and where to inject next')}</li>
            <li><b>📉 {t('Peso e medidas', 'Weight and measurements')}</b> {t('com gráfico da sua evolução', 'with a progress chart')}</li>
            <li><b>🤢 {t('Diário de sintomas', 'Side effect diary')}</b> {t('com dicas para cada um', 'with tips for each one')}</li>
            <li><b>🍗 {t('Meta de proteína', 'Protein goal')}</b> {t('para perder gordura, não músculo', 'to lose fat, not muscle')}</li>
            <li><b>📄 {t('Relatório', 'Doctor report')}</b> {t('pronto para levar ao médico', 'ready for your next visit')}</li>
          </ul>
          <p className="muted small">{t('Grátis para sempre no essencial. Seus dados ficam no seu celular.', 'The essentials are free forever. Your data stays on your phone.')}</p>
          <button className="link" onClick={onDemo}>{t('Só quero ver como funciona (dados de exemplo)', 'Just show me how it works (sample data)')}</button>
        </div>
      )}

      {step === 1 && (
        <div className="ob-step">
          <h2>{t('Seu tratamento', 'Your treatment')}</h2>
          <label className="field">{t('Como podemos te chamar?', 'What should we call you?')}
            <input value={p.name} onChange={e => set('name', e.target.value)} placeholder={t('Seu primeiro nome', 'Your first name')} autoComplete="given-name" />
          </label>
          <fieldset className="field">
            <legend>{t('Qual caneta você usa?', 'Which medication do you take?')}</legend>
            <div className="chips">
              {meds.map(m => (
                <button type="button" key={m.id} className={`chip ${p.medication === m.id ? 'on' : ''}`} aria-pressed={p.medication === m.id}
                  onClick={() => { set('medication', m.id); set('frequency', m.freq) }}>
                  {m.id}<small>{m.sub}</small>
                </button>
              ))}
            </div>
          </fieldset>
          <label className="field">{t('Dose que seu médico receitou', 'Dose your doctor prescribed')}
            <input value={p.doseLabel} onChange={e => set('doseLabel', e.target.value)} placeholder={t('Ex.: 2,5 mg', 'e.g. 2.5 mg')} />
            <small className="muted">{t('O Leve não indica nem altera doses. Siga sempre a sua receita.', 'Leve never recommends or changes doses. Always follow your prescription.')}</small>
          </label>
          <div className="row2">
            <label className="field">{t('Frequência', 'Frequency')}
              <select value={p.frequency} onChange={e => set('frequency', e.target.value)}>
                <option value="weekly">{t('1 vez por semana', 'Once a week')}</option>
                <option value="daily">{t('Todo dia', 'Every day')}</option>
              </select>
            </label>
            <label className="field">{t('Horário', 'Time')}
              <input type="time" value={p.doseTime} onChange={e => set('doseTime', e.target.value)} />
            </label>
          </div>
          {p.frequency === 'weekly' && (
            <label className="field">{t('Dia da dose', 'Dose day')}
              <select value={p.doseWeekday} onChange={e => set('doseWeekday', e.target.value)}>
                {WEEKDAYS().map((w, i) => <option key={i} value={i}>{w}</option>)}
              </select>
            </label>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="ob-step">
          <h2>{t('Seu ponto de partida', 'Your starting point')}</h2>
          <p className="muted">{t('Usamos isso para calcular sua evolução e suas metas de proteína e água.', 'We use this to track your progress and set your protein and water goals.')}</p>
          {imperial() ? (
            <div className="row2">
              <label className="field">Height (ft)<input inputMode="numeric" value={p.heightFt} onChange={e => set('heightFt', e.target.value)} placeholder="5" /></label>
              <label className="field">(in)<input inputMode="numeric" value={p.heightIn} onChange={e => set('heightIn', e.target.value)} placeholder="6" /></label>
            </div>
          ) : (
            <label className="field">Altura (cm)
              <input inputMode="numeric" value={p.heightCm} onChange={e => set('heightCm', e.target.value)} placeholder="Ex.: 165" />
            </label>
          )}
          <div className="row2">
            <label className="field">{t('Peso atual', 'Current weight')} ({wUnit()})
              <input inputMode="decimal" value={p.startWeight} onChange={e => set('startWeight', e.target.value)} placeholder={t('Ex.: 92,5', 'e.g. 210')} />
            </label>
            <label className="field">{t('Meta', 'Goal')} ({wUnit()})
              <input inputMode="decimal" value={p.goalWeight} onChange={e => set('goalWeight', e.target.value)} placeholder={t('Ex.: 75', 'e.g. 170')} />
            </label>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="ob-step">
          <h2>{t('Combinado importante', 'One important thing')}</h2>
          <div className="card soft">
            <p>{t('O Leve é um ', 'Leve is a ')}<b>{t('organizador do seu tratamento', 'tracker for your treatment')}</b>{t('. Ele não substitui seu médico e não diz qual dose usar.', '. It does not replace your doctor and never tells you what dose to take.')}</p>
            <p>{t('Use canetas emagrecedoras ', 'Use GLP-1 medications ')}<b>{t('somente com receita e acompanhamento médico', 'only with a prescription and medical supervision')}</b>.</p>
            <p>{t('Seus dados de saúde ficam ', 'Your health data is ')}<b>{t('guardados só neste aparelho', 'stored only on this device')}</b>{t('. Você pode exportar ou apagar tudo quando quiser.', '. You can export or delete everything at any time.')}</p>
          </div>
          <label className="check">
            <input type="checkbox" checked={p.agree} onChange={e => set('agree', e.target.checked)} />
            <span>{t('Entendi e uso a caneta com acompanhamento médico.', 'I understand, and I use my medication under medical supervision.')}</span>
          </label>
        </div>
      )}

      <div className="ob-actions">
        {step > 0 && <button className="btn ghost" onClick={() => setStep(step - 1)}>{t('Voltar', 'Back')}</button>}
        {step < 3
          ? <button className="btn primary grow" disabled={!canNext} onClick={() => setStep(step + 1)}>{step === 0 ? t('Começar', 'Get started') : t('Continuar', 'Continue')}</button>
          : <button className="btn primary grow" disabled={!canNext} onClick={finish}>{t('Entrar no Leve', 'Start using Leve')}</button>}
      </div>
    </div>
  )
}
