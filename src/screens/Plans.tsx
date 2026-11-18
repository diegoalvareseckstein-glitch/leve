import { useState } from 'react'
import type { Store } from '../store'
import { activatedSettings, checkActivation, isPremium } from '../store'
import { PRICES } from '../data'
import { HOTMART_CHECKOUT } from '../config'
import { getLang, t } from '../i18n'
import { Icon } from '../components/ui'

export function Plans({ store, toast, back }: { store: Store; toast: (m: string) => void; back: () => void }) {
  const { data, update } = store
  const [code, setCode] = useState('')
  const premium = isPremium(data)
  const pr = PRICES()
  const en = getLang() === 'en'
  const checkout = HOTMART_CHECKOUT[en ? 'en' : 'pt'] || (en ? '../en/#waitlist' : '../#lista')
  const s = data.settings
  const FREE = [t('Lembrete de dose e rodízio do local', 'Dose reminders and site rotation'), t('Estoque da caneta e plano de doses', 'Supply tracker and dose plan'), t('Peso, medidas e gráfico', 'Weight, measurements and chart'), t('Diário de sintomas com dicas', 'Side effect diary with tips'), t('Meta de proteína e água', 'Protein and water goals')]
  const PREMIUM = [t('Treino personalizado pela sua idade, peso e nível, em casa ou na academia', 'Workouts personalized to your age, weight and level, at home or the gym'), t('6 dietas com cardápio e porções calculados para você', '6 diets with menus and portions calculated for you'), t('Análise corporal: % de gordura, massa magra e riscos', 'Body analysis: body fat %, lean mass and health risks'), t('Alarmes de água, refeições, sono e treino', 'Water, meal, sleep and workout alarms'), t('Relatório para levar ao médico (PDF)', 'Doctor visit report (PDF)'), t('Ritmo semanal, previsão da meta e padrão de sintomas', 'Weekly pace, goal forecast and symptom patterns')]

  function startTrial() {
    const end = new Date(); end.setDate(end.getDate() + 7)
    update(d => ({ ...d, settings: { ...d.settings, plan: 'premium', trialEndsAt: end.toISOString() } }))
    toast(t('Premium liberado por 7 dias ✨', 'Premium unlocked for 7 days ✨'))
    back()
  }
  async function activate(e: React.FormEvent) {
    e.preventDefault()
    if (await checkActivation(code)) {
      update(d => ({ ...d, settings: activatedSettings(d.settings) }))
      toast(t('Premium ativado! Obrigado pela compra 💚', 'Premium activated! Thank you 💚')); setCode('')
    } else toast(t('Código inválido. Confira o e-mail da compra.', 'Invalid code. Check your purchase email.'))
  }

  return (
    <div className="screen plans">
      <button className="link back" onClick={back}>‹ {t('Voltar', 'Back')}</button>
      <div className="plans-hero">
        <span className="badge big">Leve Premium</span>
        <h1>{t('Seu tratamento completo: caneta, treino e dieta', 'Your complete program: medication, training and nutrition')}</h1>
        <p className="muted">{t('O controle da caneta é grátis para sempre. O Premium monta seu treino, sua dieta e seus alarmes.', 'Medication tracking is free forever. Premium builds your workouts, diet and alarms.')}</p>
      </div>

      <section className="card plan-card featured">
        <div className="price"><b>{pr.price}</b></div>
        <p className="muted small">{pr.note} · {pr.perMonth}</p>
        <ul className="checks">{PREMIUM.map(f => <li key={f}><Icon name="check" size={18} /> {f}</li>)}</ul>
        {premium && s.purchased
          ? <p className="center"><b>✓ {t('Você é Premium', 'You are Premium')}</b>{s.premiumUntil && <><br /><small className="muted">{t('até', 'until')} {new Date(s.premiumUntil).toLocaleDateString(en ? 'en-US' : 'pt-BR')}</small></>}</p>
          : <a className="btn accent block" href={checkout} target="_blank" rel="noopener">{t('Comprar agora', 'Buy now')}</a>}
        <p className="muted tiny center">{t('Pagamento seguro pela Hotmart: Pix, boleto ou cartão em até 12x. Garantia de 7 dias: não gostou, devolvemos seu dinheiro.', 'Secure checkout by Hotmart. 7-day money-back guarantee.')}</p>
        {!premium && <button className="btn ghost block" onClick={startTrial}>{t('Testar 7 dias grátis antes', 'Try 7 days free first')}</button>}
      </section>

      {!(premium && s.purchased) && (
        <section className="card">
          <h3>{t('Já comprou?', 'Already bought?')}</h3>
          <p className="muted small">{t('Digite o código de ativação que chegou no seu e-mail ou na página de obrigado.', 'Enter the activation code from your purchase email or thank-you page.')}</p>
          <form className="inline-form" onSubmit={activate}>
            <input value={code} onChange={e => setCode(e.target.value)} placeholder="LEVE-XXXX-XXXX" aria-label={t('Código de ativação', 'Activation code')} autoCapitalize="characters" />
            <button className="btn primary" type="submit">{t('Ativar', 'Activate')}</button>
          </form>
        </section>
      )}

      <section className="card plan-card">
        <h3>{t('Grátis para sempre', 'Free forever')}</h3>
        <ul className="checks">{FREE.map(f => <li key={f}><Icon name="check" size={18} /> {f}</li>)}</ul>
      </section>
    </div>
  )
}
