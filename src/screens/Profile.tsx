import { useRef, useState } from 'react'
import type { Store } from '../store'
import { isPremium } from '../store'
import { MEDICATIONS, WEEKDAYS } from '../data'
import { fmtNum, fromW, imperial, parseNum, t, toW, wUnit, type Lang } from '../i18n'
import { downloadFile, dayKey } from '../utils'
import type { Profile as P } from '../types'

export function Profile({ store, toast, goPlans, goReport, goBody, back, lang, setLang }:
  { store: Store; toast: (m: string) => void; goPlans: () => void; goReport: () => void; goBody: () => void; back: () => void; lang: Lang; setLang: (l: Lang) => void }) {
  const { data, update, reset, replace } = store
  const [p, setP] = useState<P>(data.profile!)
  const file = useRef<HTMLInputElement>(null)
  const premium = isPremium(data)
  const s = data.settings
  const set = <K extends keyof P>(k: K, v: P[K]) => setP(prev => ({ ...prev, [k]: v }))
  const n = (v: string) => parseNum(v) || 0
  const meds = MEDICATIONS()

  return (
    <div className="screen">
      <button className="link back" onClick={back}>‹ {t('Voltar', 'Back')}</button>
      <h1>{t('Perfil e ajustes', 'Profile & settings')}</h1>

      <button className={`card tap plan-banner ${premium ? 'is-premium' : ''}`} onClick={goPlans}>
        <span className="emoji">{premium ? '✨' : '⭐'}</span>
        <div><b>{premium ? t('Você é Premium', 'You are Premium') : t('Conheça o Leve Premium', 'Discover Leve Premium')}</b>
          <div className="small">{premium && s.trialEndsAt ? t(`Teste até ${new Date(s.trialEndsAt).toLocaleDateString('pt-BR')}`, `Trial until ${new Date(s.trialEndsAt).toLocaleDateString('en-US')}`) : t('Relatório para o médico e análises', 'Doctor report and insights')}</div></div>
      </button>

      <button className="card tap plan-banner" onClick={goBody}>
        <span className="emoji">🏋️</span><div><b>{t('Treino e dieta', 'Workout & diet')}</b><div className="small">{t('Idade, nível de atividade, local de treino e limitações', 'Age, activity level, training place and limitations')}</div></div>
      </button>

      <button className="card tap plan-banner" onClick={goReport}>
        <span className="emoji">📄</span><div><b>{t('Relatório para o médico', 'Doctor visit report')}</b><div className="small">{t('Resumo de doses, peso e sintomas', 'Summary of doses, weight and symptoms')}</div></div>
      </button>

      <section className="card">
        <h3>{t('Idioma e acessibilidade', 'Language & accessibility')}</h3>
        <div className="seg lang" role="tablist" aria-label={t('Idioma', 'Language')}>
          <button role="tab" aria-selected={lang === 'pt'} className={lang === 'pt' ? 'on' : ''} onClick={() => setLang('pt')}>🇧🇷 Português</button>
          <button role="tab" aria-selected={lang === 'en'} className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>🇺🇸 English</button>
        </div>
        <label className="toggle"><span>{t('Letras maiores', 'Larger text')}</span>
          <input type="checkbox" checked={s.largeText} onChange={e => update(d => ({ ...d, settings: { ...d.settings, largeText: e.target.checked } }))} /></label>
        <label className="toggle"><span>{t('Alto contraste', 'High contrast')}</span>
          <input type="checkbox" checked={s.highContrast} onChange={e => update(d => ({ ...d, settings: { ...d.settings, highContrast: e.target.checked } }))} /></label>
      </section>

      <section className="card">
        <h3>{t('Meu tratamento', 'My treatment')}</h3>
        <label className="field">{t('Nome', 'Name')}<input value={p.name} onChange={e => set('name', e.target.value)} /></label>
        <div className="row2">
          <label className="field">{t('Caneta', 'Medication')}
            <select value={p.medication} onChange={e => set('medication', e.target.value)}>{[...meds.map(m => m.id as string), ...(meds.some(m => m.id === p.medication) ? [] : [p.medication])].map(m => <option key={m}>{m}</option>)}</select></label>
          <label className="field">{t('Dose receitada', 'Prescribed dose')}<input value={p.doseLabel} onChange={e => set('doseLabel', e.target.value)} /></label>
        </div>
        <div className="row2">
          <label className="field">{t('Frequência', 'Frequency')}
            <select value={p.frequency} onChange={e => set('frequency', e.target.value as P['frequency'])}>
              <option value="weekly">{t('Semanal', 'Weekly')}</option><option value="daily">{t('Diária', 'Daily')}</option></select></label>
          <label className="field">{t('Horário', 'Time')}<input type="time" value={p.doseTime} onChange={e => set('doseTime', e.target.value)} /></label>
        </div>
        {p.frequency === 'weekly' && <label className="field">{t('Dia', 'Day')}
          <select value={p.doseWeekday} onChange={e => set('doseWeekday', Number(e.target.value))}>{WEEKDAYS().map((w, i) => <option key={i} value={i}>{w}</option>)}</select></label>}
        <div className="row2">
          <label className="field">{t('Peso inicial', 'Starting weight')} ({wUnit()})<input inputMode="decimal" defaultValue={fmtNum(toW(p.startWeight))} onChange={e => set('startWeight', fromW(n(e.target.value)))} /></label>
          <label className="field">{t('Meta', 'Goal')} ({wUnit()})<input inputMode="decimal" defaultValue={fmtNum(toW(p.goalWeight))} onChange={e => set('goalWeight', fromW(n(e.target.value)))} /></label>
        </div>
        <div className="row2">
          <label className="field">{t('Proteína/dia (g)', 'Protein/day (g)')}<input inputMode="numeric" value={p.proteinGoal} onChange={e => set('proteinGoal', n(e.target.value))} /></label>
          <label className="field">{t('Água/dia (ml)', 'Water/day (ml)')}<input inputMode="numeric" value={p.waterGoal} onChange={e => set('waterGoal', n(e.target.value))} /></label>
        </div>
        <label className="field">{t('Altura (cm)', 'Height (in)')}<input inputMode="numeric" defaultValue={imperial() ? Math.round(p.heightCm / 2.54) : p.heightCm} onChange={e => set('heightCm', imperial() ? n(e.target.value) * 2.54 : n(e.target.value))} /></label>
        <button className="btn primary block" onClick={() => { update(d => ({ ...d, profile: p })); toast(t('Alterações salvas', 'Changes saved')) }}>{t('Salvar alterações', 'Save changes')}</button>
      </section>

      <section className="card">
        <h3>{t('Seus dados (LGPD)', 'Your data & privacy')}</h3>
        <p className="muted small">{t('Tudo fica guardado só neste aparelho. Nada é enviado para servidores.', 'Everything is stored only on this device. Nothing is sent to any server.')}</p>
        <div className="stack">
          <button className="btn secondary block" onClick={() => downloadFile(`leve-backup-${dayKey()}.json`, JSON.stringify(data, null, 2), 'application/json')}>{t('Exportar meus dados', 'Export my data')}</button>
          <button className="btn ghost block" onClick={() => file.current?.click()}>{t('Importar backup', 'Import backup')}</button>
          <input ref={file} type="file" accept="application/json" hidden onChange={async e => {
            const f = e.target.files?.[0]; if (!f) return
            try { const parsed = JSON.parse(await f.text()); if (!parsed.profile) throw 0; replace(parsed); toast(t('Backup importado', 'Backup imported')) }
            catch { toast(t('Arquivo inválido', 'Invalid file')) }
          }} />
          <button className="btn danger block" onClick={() => { if (confirm(t('Apagar todos os seus dados deste aparelho? Isso não pode ser desfeito.', 'Delete all your data from this device? This cannot be undone.'))) reset() }}>{t('Apagar todos os dados', 'Delete all data')}</button>
        </div>
      </section>

      <section className="card soft">
        <p className="small"><b>{t('Aviso:', 'Disclaimer:')}</b> {t('o Leve organiza seu tratamento e não substitui orientação médica. Ele não indica, prescreve nem altera doses. Use canetas emagrecedoras somente com receita e acompanhamento profissional.', 'Leve helps you organize your treatment and is not medical advice. It does not recommend, prescribe or change doses. Use GLP-1 medications only with a prescription and medical supervision. Leve is not affiliated with any drug manufacturer.')}</p>
        <p className="tiny muted">Leve v0.2</p>
      </section>
    </div>
  )
}
