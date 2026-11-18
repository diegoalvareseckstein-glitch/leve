import { useCallback, useEffect, useRef, useState } from 'react'
import { activatedSettings, checkActivation, useAppData } from './store'
import { Onboarding } from './screens/Onboarding'
import { Today } from './screens/Today'
import { Doses } from './screens/Doses'
import { Progress } from './screens/Progress'
import { Symptoms } from './screens/Symptoms'
import { Food } from './screens/Food'
import { Plans } from './screens/Plans'
import { Profile } from './screens/Profile'
import { Report } from './screens/Report'
import { Workout } from './screens/Workout'
import { Reminders, reminderEvents, defaultReminders } from './screens/Reminders'
import { sortByDate } from './utils'
import { DoseForm, SymptomForm, WeightForm } from './components/forms'
import { Icon, Sheet, Toast } from './components/ui'
import { dayKey, doseStatus } from './utils'
import { demoData } from './demo'
import { detectLang, setLang as applyLang, t, type Lang } from './i18n'

export type Tab = 'hoje' | 'doses' | 'treino' | 'progresso' | 'sintomas' | 'comida' | 'planos' | 'perfil' | 'relatorio' | 'lembretes'
const TABS = (): { id: Tab; label: string; icon: string }[] => [
  { id: 'hoje', label: t('Hoje', 'Today'), icon: 'home' },
  { id: 'doses', label: t('Doses', 'Doses'), icon: 'pen' },
  { id: 'treino', label: t('Treino', 'Workout'), icon: 'dumbbell' },
  { id: 'comida', label: t('Dieta', 'Diet'), icon: 'food' },
  { id: 'progresso', label: t('Progresso', 'Progress'), icon: 'chart' }
]

export default function App() {
  const store = useAppData()
  const { data, update } = store
  const lang: Lang = data.settings.lang ?? detectLang()
  applyLang(lang)
  const setLang = (l: Lang) => update(d => ({ ...d, settings: { ...d.settings, lang: l } }))
  const soon = (feature: string) => {
    try { const k = 'leve:interesse'; const v = JSON.parse(localStorage.getItem(k) || '{}'); v[feature] = (v[feature] || 0) + 1; localStorage.setItem(k, JSON.stringify(v)) } catch { /* sem armazenamento */ }
    const w = window as unknown as { gtag?: (...a: unknown[]) => void }
    w.gtag?.('event', 'em_breve', { feature })
    toast(t('Anotado! Você será avisado quando lançar. 🙌', 'Got it! We will let you know when it launches. 🙌'))
  }
  const [tab, setTab] = useState<Tab>('hoje')
  const [prevTab, setPrevTab] = useState<Tab>('hoje')
  const [sheet, setSheet] = useState<null | 'dose' | 'peso' | 'sintoma'>(null)
  const [toastText, setToastText] = useState<string | null>(null)
  const timer = useRef<number>(undefined)

  const toast = useCallback((t: string) => {
    setToastText(t); window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setToastText(null), 2800)
  }, [])
  const go = (t: Tab) => { setPrevTab(tab); setTab(t); window.scrollTo({ top: 0 }) }
  const closeSheet = useCallback(() => setSheet(null), [])
  const done = (msg: string) => { setSheet(null); toast(msg) }

  useEffect(() => {
    document.documentElement.classList.toggle('large-text', data.settings.largeText)
    document.documentElement.classList.toggle('high-contrast', data.settings.highContrast)
  }, [data.settings.largeText, data.settings.highContrast])

  // Ativação do Premium pelo link da página de obrigado da Hotmart (?ativar=CODIGO)
  useEffect(() => {
    const code = new URLSearchParams(location.search).get('ativar') || new URLSearchParams(location.search).get('activate')
    if (!code) return
    checkActivation(code).then(ok => {
      if (ok) { update(d => ({ ...d, settings: activatedSettings(d.settings) })); toast(t('Premium ativado! Obrigado pela compra 💚', 'Premium activated! Thank you 💚')) }
      else toast(t('Código de ativação inválido.', 'Invalid activation code.'))
      history.replaceState(null, '', location.pathname + (location.search.includes('lang=') ? '?lang=' + new URLSearchParams(location.search).get('lang') : ''))
    })
  }, [update, toast])

  // Aviso ao abrir o app no dia da dose (se a pessoa permitiu notificações)
  useEffect(() => {
    if (!data.profile || !('Notification' in window) || Notification.permission !== 'granted') return
    const st = doseStatus(data.profile, data.doses)
    const key = 'leve:notified:' + dayKey()
    if (st.tone !== 'ok' && !localStorage.getItem(key)) {
      localStorage.setItem(key, '1')
      new Notification(t('Leve · dia de dose 💉', 'Leve · dose day 💉'), { body: `${st.label}. ${t('Abra para registrar e ver o próximo local.', 'Open to log it and see your next site.')}`, icon: './icon-192.png' })
    }
  }, [data.profile, data.doses])

  // Avisos do app enquanto ele está aberto (Premium): confere a cada minuto
  useEffect(() => {
    if (!data.profile || !('Notification' in window) || Notification.permission !== 'granted') return
    const p = data.profile
    const tick = () => {
      if (data.settings.plan !== 'premium') return
      const now = new Date(), hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      const w = sortByDate(data.weights).at(-1)?.kg ?? p.startWeight
      reminderEvents(data.reminders ?? defaultReminders(), p, w)
        .filter(([tm, , wd]) => tm === hhmm && (!wd.length || wd.includes(now.getDay())))
        .forEach(([, title]) => new Notification('Leve', { body: title, icon: './icon-192.png' }))
    }
    const id = window.setInterval(tick, 60000)
    return () => window.clearInterval(id)
  }, [data.profile, data.reminders, data.weights, data.settings.plan])

  if (!data.profile) {
    return <Onboarding key={lang} lang={lang} setLang={setLang} onDone={profile => update(d => ({ ...d, profile, settings: { ...d.settings, lang } }))} onDemo={() => update(d => { const x = demoData(d); return { ...x, settings: { ...x.settings, lang } } })} />
  }

  const kg = sortByDate(data.weights).at(-1)?.kg ?? data.profile.startWeight
  const main = tab === 'hoje' ? <Today store={store} go={go} openDose={() => setSheet('dose')} openSymptom={() => setSheet('sintoma')} openWeight={() => setSheet('peso')} />
    : tab === 'doses' ? <Doses store={store} openDose={() => setSheet('dose')} toast={toast} />
    : tab === 'progresso' ? <Progress store={store} openWeight={() => setSheet('peso')} goPremium={() => go('planos')} goWorkout={() => go('treino')} />
    : tab === 'treino' ? <Workout store={store} toast={toast} goPremium={() => go('planos')} />
    : tab === 'lembretes' ? <Reminders store={store} toast={toast} back={() => go(prevTab === 'lembretes' ? 'hoje' : prevTab)} goPremium={() => go('planos')} kg={kg} />
    : tab === 'sintomas' ? <Symptoms back={() => go('hoje')} store={store} openSymptom={() => setSheet('sintoma')} goPremium={() => go('planos')} />
    : tab === 'comida' ? <Food store={store} toast={toast} soon={soon} goPremium={() => go('planos')} />
    : tab === 'planos' ? <Plans store={store} toast={toast} back={() => go(prevTab === 'planos' ? 'hoje' : prevTab)} />
    : tab === 'relatorio' ? <Report store={store} back={() => go('perfil')} goPlans={() => go('planos')} />
    : <Profile key={lang} lang={lang} setLang={setLang} store={store} toast={toast} goPlans={() => go('planos')} goReport={() => go('relatorio')} goBody={() => go('treino')} back={() => go('hoje')} />

  return (
    <div className="app">
      <div className="topbar no-print">
        <span className="brand-sm"><span aria-hidden="true">🌿</span> Leve</span>
        <button className="icon-btn avatar" onClick={() => go('perfil')} aria-label={t('Perfil e ajustes', 'Profile & settings')}>
          {data.profile.name.slice(0, 1).toUpperCase()}
        </button>
      </div>
      <main id="main">{main}</main>
      <nav className="tabbar no-print" aria-label={t('Navegação principal', 'Main navigation')}>
        {TABS().map(x => (
          <button key={x.id} className={tab === x.id ? 'on' : ''} aria-current={tab === x.id ? 'page' : undefined} onClick={() => go(x.id)}>
            <Icon name={x.icon} /><span>{x.label}</span>
          </button>
        ))}
      </nav>
      <Sheet open={sheet === 'dose'} onClose={closeSheet} title={t('Registrar dose', 'Log dose')}><DoseForm store={store} onDone={done} /></Sheet>
      <Sheet open={sheet === 'peso'} onClose={closeSheet} title={t('Registrar peso', 'Log weight')}><WeightForm store={store} onDone={done} goPremium={() => { setSheet(null); go('planos') }} /></Sheet>
      <Sheet open={sheet === 'sintoma'} onClose={closeSheet} title={t('Como você está hoje?', 'How are you today?')}><SymptomForm store={store} onDone={done} /></Sheet>
      <Toast text={toastText} />
    </div>
  )
}
