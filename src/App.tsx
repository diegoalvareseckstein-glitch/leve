import { useCallback, useEffect, useRef, useState } from 'react'
import { useAppData } from './store'
import { Onboarding } from './screens/Onboarding'
import { Today } from './screens/Today'
import { Doses } from './screens/Doses'
import { Progress } from './screens/Progress'
import { Symptoms } from './screens/Symptoms'
import { Food } from './screens/Food'
import { Plans } from './screens/Plans'
import { Profile } from './screens/Profile'
import { Report } from './screens/Report'
import { DoseForm, SymptomForm, WeightForm } from './components/forms'
import { Icon, Sheet, Toast } from './components/ui'
import { dayKey, doseStatus } from './utils'
import { demoData } from './demo'

export type Tab = 'hoje' | 'doses' | 'progresso' | 'sintomas' | 'comida' | 'planos' | 'perfil' | 'relatorio'
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'hoje', label: 'Hoje', icon: 'home' },
  { id: 'doses', label: 'Doses', icon: 'pen' },
  { id: 'progresso', label: 'Progresso', icon: 'chart' },
  { id: 'sintomas', label: 'Sintomas', icon: 'heart' },
  { id: 'comida', label: 'Comida', icon: 'food' }
]

export default function App() {
  const store = useAppData()
  const { data, update } = store
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

  // Aviso ao abrir o app no dia da dose (se a pessoa permitiu notificações)
  useEffect(() => {
    if (!data.profile || !('Notification' in window) || Notification.permission !== 'granted') return
    const st = doseStatus(data.profile, data.doses)
    const key = 'leve:notified:' + dayKey()
    if (st.tone !== 'ok' && !localStorage.getItem(key)) {
      localStorage.setItem(key, '1')
      new Notification('Leve · dia de dose 💉', { body: `${st.label}. Abra para registrar e ver o próximo local.`, icon: './icon-192.png' })
    }
  }, [data.profile, data.doses])

  if (!data.profile) {
    return <Onboarding onDone={profile => update(d => ({ ...d, profile }))} onDemo={() => update(d => demoData(d))} />
  }

  const main = tab === 'hoje' ? <Today store={store} go={go} openDose={() => setSheet('dose')} openSymptom={() => setSheet('sintoma')} openWeight={() => setSheet('peso')} />
    : tab === 'doses' ? <Doses store={store} openDose={() => setSheet('dose')} toast={toast} />
    : tab === 'progresso' ? <Progress store={store} openWeight={() => setSheet('peso')} goPremium={() => go('planos')} />
    : tab === 'sintomas' ? <Symptoms store={store} openSymptom={() => setSheet('sintoma')} goPremium={() => go('planos')} />
    : tab === 'comida' ? <Food store={store} toast={toast} />
    : tab === 'planos' ? <Plans store={store} toast={toast} back={() => go(prevTab === 'planos' ? 'hoje' : prevTab)} />
    : tab === 'relatorio' ? <Report store={store} back={() => go('perfil')} goPlans={() => go('planos')} />
    : <Profile store={store} toast={toast} goPlans={() => go('planos')} goReport={() => go('relatorio')} back={() => go('hoje')} />

  return (
    <div className="app">
      <div className="topbar no-print">
        <span className="brand-sm"><span aria-hidden="true">🌿</span> Leve</span>
        <button className="icon-btn avatar" onClick={() => go('perfil')} aria-label="Perfil e ajustes">
          {data.profile.name.slice(0, 1).toUpperCase()}
        </button>
      </div>
      <main id="main">{main}</main>
      <nav className="tabbar no-print" aria-label="Navegação principal">
        {TABS.map(t => (
          <button key={t.id} className={tab === t.id ? 'on' : ''} aria-current={tab === t.id ? 'page' : undefined} onClick={() => go(t.id)}>
            <Icon name={t.icon} /><span>{t.label}</span>
          </button>
        ))}
      </nav>
      <Sheet open={sheet === 'dose'} onClose={closeSheet} title="Registrar dose"><DoseForm store={store} onDone={done} /></Sheet>
      <Sheet open={sheet === 'peso'} onClose={closeSheet} title="Registrar peso"><WeightForm store={store} onDone={done} goPremium={() => { setSheet(null); go('planos') }} /></Sheet>
      <Sheet open={sheet === 'sintoma'} onClose={closeSheet} title="Como você está hoje?"><SymptomForm store={store} onDone={done} /></Sheet>
      <Toast text={toastText} />
    </div>
  )
}
