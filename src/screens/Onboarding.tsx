import { useState } from 'react'
import type { Profile } from '../types'
import { MEDICATIONS, WEEKDAYS } from '../data'
import { dayKey } from '../utils'

export function Onboarding({ onDone, onDemo }: { onDone: (p: Profile) => void; onDemo: () => void }) {
  const [step, setStep] = useState(0)
  const [p, setP] = useState({
    name: '', medication: 'Mounjaro', doseLabel: '', frequency: 'weekly' as Profile['frequency'],
    doseWeekday: new Date().getDay(), doseTime: '08:00', heightCm: '', startWeight: '', goalWeight: '', agree: false
  })
  const set = (k: string, v: unknown) => setP(prev => ({ ...prev, [k]: v }))
  const num = (s: string) => Number(String(s).replace(',', '.'))

  const canNext = [
    true,
    p.name.trim().length > 0 && p.doseLabel.trim().length > 0,
    num(p.heightCm) > 100 && num(p.startWeight) > 30 && num(p.goalWeight) > 30,
    p.agree
  ][step]

  function finish() {
    const goal = num(p.goalWeight), start = num(p.startWeight)
    onDone({
      name: p.name.trim(), medication: p.medication, doseLabel: p.doseLabel.trim(), frequency: p.frequency,
      doseWeekday: Number(p.doseWeekday), doseTime: p.doseTime, heightCm: num(p.heightCm), startWeight: start,
      goalWeight: goal, startDate: dayKey(),
      proteinGoal: Math.round(goal * 1.2 / 5) * 5,
      waterGoal: Math.min(3500, Math.round(start * 35 / 250) * 250)
    })
  }

  return (
    <div className="onboarding">
      <div className="ob-progress" aria-label={`Passo ${step + 1} de 4`}>
        {[0, 1, 2, 3].map(i => <span key={i} className={i <= step ? 'on' : ''} />)}
      </div>

      {step === 0 && (
        <div className="ob-step ob-hero">
          <div className="logo-big" aria-hidden="true">🌿</div>
          <h1>Bem-vindo ao <span className="brand">Leve</span></h1>
          <p className="lead">Seu tratamento com canetas, organizado e no controle. Sem planilha, sem esquecer dose.</p>
          <ul className="ob-list">
            <li><b>💉 Lembrete de dose</b> e o próximo lugar para aplicar</li>
            <li><b>📉 Peso e medidas</b> com gráfico da sua evolução</li>
            <li><b>🤢 Diário de sintomas</b> com dicas para cada um</li>
            <li><b>🍗 Meta de proteína</b> para perder gordura, não músculo</li>
            <li><b>📄 Relatório</b> pronto para levar ao médico</li>
          </ul>
          <p className="muted small">Grátis para sempre no essencial. Seus dados ficam no seu celular.</p>
          <button className="link" onClick={onDemo}>Só quero ver como funciona (dados de exemplo)</button>
        </div>
      )}

      {step === 1 && (
        <div className="ob-step">
          <h2>Seu tratamento</h2>
          <label className="field">Como podemos te chamar?
            <input value={p.name} onChange={e => set('name', e.target.value)} placeholder="Seu primeiro nome" autoComplete="given-name" />
          </label>
          <fieldset className="field">
            <legend>Qual caneta você usa?</legend>
            <div className="chips">
              {MEDICATIONS.map(m => (
                <button type="button" key={m.id} className={`chip ${p.medication === m.id ? 'on' : ''}`} aria-pressed={p.medication === m.id}
                  onClick={() => { set('medication', m.id); set('frequency', m.freq) }}>
                  {m.id}<small>{m.sub}</small>
                </button>
              ))}
            </div>
          </fieldset>
          <label className="field">Dose que seu médico receitou
            <input value={p.doseLabel} onChange={e => set('doseLabel', e.target.value)} placeholder="Ex.: 2,5 mg" />
            <small className="muted">O Leve não indica nem altera doses. Siga sempre a sua receita.</small>
          </label>
          <div className="row2">
            <label className="field">Frequência
              <select value={p.frequency} onChange={e => set('frequency', e.target.value)}>
                <option value="weekly">1 vez por semana</option>
                <option value="daily">Todo dia</option>
              </select>
            </label>
            <label className="field">Horário
              <input type="time" value={p.doseTime} onChange={e => set('doseTime', e.target.value)} />
            </label>
          </div>
          {p.frequency === 'weekly' && (
            <label className="field">Dia da dose
              <select value={p.doseWeekday} onChange={e => set('doseWeekday', e.target.value)}>
                {WEEKDAYS.map((w, i) => <option key={i} value={i}>{w}</option>)}
              </select>
            </label>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="ob-step">
          <h2>Seu ponto de partida</h2>
          <p className="muted">Usamos isso para calcular sua evolução e suas metas de proteína e água.</p>
          <label className="field">Altura (cm)
            <input inputMode="numeric" value={p.heightCm} onChange={e => set('heightCm', e.target.value)} placeholder="Ex.: 165" />
          </label>
          <div className="row2">
            <label className="field">Peso atual (kg)
              <input inputMode="decimal" value={p.startWeight} onChange={e => set('startWeight', e.target.value)} placeholder="Ex.: 92,5" />
            </label>
            <label className="field">Meta (kg)
              <input inputMode="decimal" value={p.goalWeight} onChange={e => set('goalWeight', e.target.value)} placeholder="Ex.: 75" />
            </label>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="ob-step">
          <h2>Combinado importante</h2>
          <div className="card soft">
            <p>O Leve é um <b>organizador do seu tratamento</b>. Ele não substitui seu médico e não diz qual dose usar.</p>
            <p>Use canetas emagrecedoras <b>somente com receita e acompanhamento médico</b>.</p>
            <p>Seus dados de saúde ficam <b>guardados só neste aparelho</b>. Você pode exportar ou apagar tudo quando quiser.</p>
          </div>
          <label className="check">
            <input type="checkbox" checked={p.agree} onChange={e => set('agree', e.target.checked)} />
            <span>Entendi e uso a caneta com acompanhamento médico.</span>
          </label>
        </div>
      )}

      <div className="ob-actions">
        {step > 0 && <button className="btn ghost" onClick={() => setStep(step - 1)}>Voltar</button>}
        {step < 3
          ? <button className="btn primary grow" disabled={!canNext} onClick={() => setStep(step + 1)}>{step === 0 ? 'Começar' : 'Continuar'}</button>
          : <button className="btn primary grow" disabled={!canNext} onClick={finish}>Entrar no Leve</button>}
      </div>
    </div>
  )
}
