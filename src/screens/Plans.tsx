import { useState } from 'react'
import type { Store } from '../store'
import { isPremium } from '../store'
import { PRICES } from '../data'
import { t } from '../i18n'
import { Icon } from '../components/ui'

export function Plans({ store, toast, back }: { store: Store; toast: (m: string) => void; back: () => void }) {
  const { data, update } = store
  const [period, setPeriod] = useState<'year' | 'month'>('year')
  const premium = isPremium(data)
  const pr = PRICES()
  const FREE = [t('Lembrete de dose e rodízio do local', 'Dose reminders and site rotation'), t('Estoque da caneta e plano de doses', 'Supply tracker and dose plan'), t('Peso, medidas e gráfico', 'Weight, measurements and chart'), t('Diário de sintomas com dicas', 'Side effect diary with tips'), t('Meta de proteína e água', 'Protein and water goals')]
  const PREMIUM = [t('Treino personalizado pela sua idade, peso e nível, em casa ou na academia', 'Workouts personalized to your age, weight and level, at home or the gym'), t('6 dietas com cardápio e porções calculados para você', '6 diets with menus and portions calculated for you'), t('Análise corporal: % de gordura, massa magra e riscos', 'Body analysis: body fat %, lean mass and health risks'), t('Alarmes de água, refeições, sono e treino', 'Water, meal, sleep and workout alarms'), t('Relatório para levar ao médico (PDF)', 'Doctor visit report (PDF)'), t('Ritmo semanal, previsão da meta e padrão de sintomas', 'Weekly pace, goal forecast and symptom patterns')]

  function startTrial() {
    // MODO DEMONSTRAÇÃO: troque por Mercado Pago, Stripe ou RevenueCat (veja o README)
    const end = new Date(); end.setDate(end.getDate() + 7)
    update(d => ({ ...d, settings: { ...d.settings, plan: 'premium', trialEndsAt: end.toISOString() } }))
    toast(t('Premium liberado por 7 dias (demonstração) ✨', 'Premium unlocked for 7 days (demo) ✨'))
    back()
  }

  return (
    <div className="screen plans">
      <button className="link back" onClick={back}>‹ {t('Voltar', 'Back')}</button>
      <div className="plans-hero">
        <span className="badge big">Leve Premium</span>
        <h1>{t('Seu tratamento completo: caneta, treino e dieta', 'Your complete program: medication, training and nutrition')}</h1>
        <p className="muted">{t('O controle da caneta é grátis para sempre. O Premium monta seu treino, sua dieta e seus alarmes.', 'Medication tracking is free forever. Premium builds your workouts, diet and alarms.')}</p>
      </div>

      <div className="seg" role="tablist" aria-label={t('Período', 'Billing period')}>
        <button role="tab" aria-selected={period === 'year'} className={period === 'year' ? 'on' : ''} onClick={() => setPeriod('year')}>{t('Anual', 'Yearly')} <span className="save">{pr.save}</span></button>
        <button role="tab" aria-selected={period === 'month'} className={period === 'month' ? 'on' : ''} onClick={() => setPeriod('month')}>{t('Mensal', 'Monthly')}</button>
      </div>

      <section className="card plan-card featured">
        <div className="price">
          {period === 'year' ? <><b>{pr.year}</b><span>{t('/ano', '/year')}</span></> : <><b>{pr.month}</b><span>{t('/mês', '/month')}</span></>}
        </div>
        <p className="muted small">{period === 'year' ? t(`ou ${pr.installments} sem juros no cartão`, `Just ${pr.perMonth} a month, billed yearly.`) : t('Cancele quando quiser.', 'Cancel anytime.')}</p>
        <ul className="checks">{PREMIUM.map(f => <li key={f}><Icon name="check" size={18} /> {f}</li>)}</ul>
        {premium
          ? <p className="center"><b>✓ {t('Você já é Premium', 'You are Premium')}</b></p>
          : <button className="btn accent block" onClick={startTrial}>{t('Testar 7 dias grátis', 'Try 7 days free')}</button>}
        <p className="muted tiny center">{t('Pagamento por Pix ou cartão. Sem cobrança durante o teste.', 'Pay with card, Apple Pay or Google Pay. No charge during the trial.')}</p>
      </section>

      <section className="card plan-card">
        <h3>{t('Grátis para sempre', 'Free forever')}</h3>
        <ul className="checks">{FREE.map(f => <li key={f}><Icon name="check" size={18} /> {f}</li>)}</ul>
      </section>

      <p className="muted tiny center">{t('Tem dificuldade para pagar? Escreva para a gente: o Leve tem preço social para quem precisa.', "Can't afford it? Write to us. Leve offers a reduced price for anyone who needs it.")}</p>
    </div>
  )
}
