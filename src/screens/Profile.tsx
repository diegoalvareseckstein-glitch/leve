import { useRef, useState } from 'react'
import type { Store } from '../store'
import { isPremium } from '../store'
import { MEDICATIONS, WEEKDAYS } from '../data'
import { downloadFile, dayKey } from '../utils'
import type { Profile as P } from '../types'

export function Profile({ store, toast, goPlans, goReport, back }:
  { store: Store; toast: (m: string) => void; goPlans: () => void; goReport: () => void; back: () => void }) {
  const { data, update, reset, replace } = store
  const [p, setP] = useState<P>(data.profile!)
  const file = useRef<HTMLInputElement>(null)
  const premium = isPremium(data)
  const s = data.settings
  const set = <K extends keyof P>(k: K, v: P[K]) => setP(prev => ({ ...prev, [k]: v }))
  const n = (v: string) => Number(v.replace(',', '.')) || 0

  return (
    <div className="screen">
      <button className="link back" onClick={back}>‹ Voltar</button>
      <h1>Perfil e ajustes</h1>

      <button className={`card tap plan-banner ${premium ? 'is-premium' : ''}`} onClick={goPlans}>
        <span className="emoji">{premium ? '✨' : '⭐'}</span>
        <div><b>{premium ? 'Você é Premium' : 'Conheça o Leve Premium'}</b>
          <div className="small">{premium && s.trialEndsAt ? `Teste até ${new Date(s.trialEndsAt).toLocaleDateString('pt-BR')}` : 'Relatório para o médico e análises'}</div></div>
      </button>

      <button className="card tap plan-banner" onClick={goReport}>
        <span className="emoji">📄</span><div><b>Relatório para o médico</b><div className="small">Resumo de doses, peso e sintomas</div></div>
      </button>

      <section className="card">
        <h3>Acessibilidade</h3>
        <label className="toggle"><span>Letras maiores</span>
          <input type="checkbox" checked={s.largeText} onChange={e => update(d => ({ ...d, settings: { ...d.settings, largeText: e.target.checked } }))} /></label>
        <label className="toggle"><span>Alto contraste</span>
          <input type="checkbox" checked={s.highContrast} onChange={e => update(d => ({ ...d, settings: { ...d.settings, highContrast: e.target.checked } }))} /></label>
      </section>

      <section className="card">
        <h3>Meu tratamento</h3>
        <label className="field">Nome<input value={p.name} onChange={e => set('name', e.target.value)} /></label>
        <div className="row2">
          <label className="field">Caneta
            <select value={p.medication} onChange={e => set('medication', e.target.value)}>{MEDICATIONS.map(m => <option key={m.id}>{m.id}</option>)}</select></label>
          <label className="field">Dose receitada<input value={p.doseLabel} onChange={e => set('doseLabel', e.target.value)} /></label>
        </div>
        <div className="row2">
          <label className="field">Frequência
            <select value={p.frequency} onChange={e => set('frequency', e.target.value as P['frequency'])}>
              <option value="weekly">Semanal</option><option value="daily">Diária</option></select></label>
          <label className="field">Horário<input type="time" value={p.doseTime} onChange={e => set('doseTime', e.target.value)} /></label>
        </div>
        {p.frequency === 'weekly' && <label className="field">Dia
          <select value={p.doseWeekday} onChange={e => set('doseWeekday', Number(e.target.value))}>{WEEKDAYS.map((w, i) => <option key={i} value={i}>{w}</option>)}</select></label>}
        <div className="row2">
          <label className="field">Peso inicial (kg)<input inputMode="decimal" defaultValue={String(p.startWeight).replace('.', ',')} onChange={e => set('startWeight', n(e.target.value))} /></label>
          <label className="field">Meta (kg)<input inputMode="decimal" defaultValue={String(p.goalWeight).replace('.', ',')} onChange={e => set('goalWeight', n(e.target.value))} /></label>
        </div>
        <div className="row2">
          <label className="field">Proteína/dia (g)<input inputMode="numeric" value={p.proteinGoal} onChange={e => set('proteinGoal', n(e.target.value))} /></label>
          <label className="field">Água/dia (ml)<input inputMode="numeric" value={p.waterGoal} onChange={e => set('waterGoal', n(e.target.value))} /></label>
        </div>
        <label className="field">Altura (cm)<input inputMode="numeric" value={p.heightCm} onChange={e => set('heightCm', n(e.target.value))} /></label>
        <button className="btn primary block" onClick={() => { update(d => ({ ...d, profile: p })); toast('Alterações salvas') }}>Salvar alterações</button>
      </section>

      <section className="card">
        <h3>Seus dados (LGPD)</h3>
        <p className="muted small">Tudo fica guardado só neste aparelho. Nada é enviado para servidores.</p>
        <div className="stack">
          <button className="btn secondary block" onClick={() => downloadFile(`leve-backup-${dayKey()}.json`, JSON.stringify(data, null, 2), 'application/json')}>Exportar meus dados</button>
          <button className="btn ghost block" onClick={() => file.current?.click()}>Importar backup</button>
          <input ref={file} type="file" accept="application/json" hidden onChange={async e => {
            const f = e.target.files?.[0]; if (!f) return
            try { const parsed = JSON.parse(await f.text()); if (!parsed.profile) throw 0; replace(parsed); toast('Backup importado') }
            catch { toast('Arquivo inválido') }
          }} />
          <button className="btn danger block" onClick={() => { if (confirm('Apagar todos os seus dados deste aparelho? Isso não pode ser desfeito.')) reset() }}>Apagar todos os dados</button>
        </div>
      </section>

      <section className="card soft">
        <p className="small"><b>Aviso:</b> o Leve organiza seu tratamento e não substitui orientação médica. Ele não indica, prescreve nem altera doses. Use canetas emagrecedoras somente com receita e acompanhamento profissional.</p>
        <p className="tiny muted">Leve v0.1 · feito no Brasil 🇧🇷</p>
      </section>
    </div>
  )
}
