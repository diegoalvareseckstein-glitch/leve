import { useState } from 'react'
import type { Store } from '../store'
import { activatePurchase, activatedSettings, isPremium, logoutAccess, revokedSettings } from '../store'
import { PRICES } from '../data'
import { HOTMART_CHECKOUT } from '../config'
import { getLang, t } from '../i18n'
import { Icon } from '../components/ui'

export function Plans({ store, toast, back }: { store: Store; toast: (m: string) => void; back: () => void }) {
  const { data, update } = store
  const [email, setEmail] = useState(data.settings.buyerEmail ?? '')
  const [tx, setTx] = useState('')
  const [busy, setBusy] = useState(false)
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
    if (!email.trim() || !tx.trim()) { toast(t('Preencha o e-mail e o código da compra.', 'Fill in your email and order code.')); return }
    setBusy(true)
    const r = await activatePurchase(email, tx)
    setBusy(false)
    if (r.ok) {
      update(d => ({ ...d, settings: activatedSettings(d.settings, r.token, r.expires_at, email.trim().toLowerCase()) }))
      toast(t('Premium ativado! Obrigado pela compra 💚', 'Premium activated! Thank you 💚')); setTx('')
      return
    }
    const msg: Record<string, string> = {
      not_found: t('Não encontramos essa compra. Confira o e-mail usado na Hotmart e o código da transação (começa com HP).', 'Purchase not found. Check the email used at checkout and the order code (starts with HP).'),
      device_limit: t(`Essa compra já está ativa em ${r.ok === false && r.max ? r.max : 2} celulares. Saia de um deles em Planos para usar aqui.`, `This purchase is already active on ${r.ok === false && r.max ? r.max : 2} phones. Sign out on one of them first.`),
      revoked: t('Essa compra foi reembolsada ou cancelada.', 'This purchase was refunded or canceled.'),
      expired: t('Seus 12 meses de Premium terminaram. Renove para continuar.', 'Your 12 months of Premium have ended. Renew to continue.'),
      too_many: t('Muitas tentativas. Espere 15 minutos e tente de novo.', 'Too many attempts. Wait 15 minutes and try again.'),
      offline: t('Sem conexão com o servidor. Confira sua internet e tente de novo.', 'Could not reach the server. Check your connection and try again.'),
    }
    toast(msg[r.reason] ?? t('Não foi possível ativar agora. Tente de novo em instantes.', 'Could not activate now. Please try again shortly.'))
  }
  async function signOut() {
    if (s.accessToken) await logoutAccess(s.accessToken)
    update(d => ({ ...d, settings: revokedSettings(d.settings) }))
    toast(t('Premium removido deste celular.', 'Premium removed from this phone.'))
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

      {!(premium && s.purchased) ? (
        <section className="card" id="ja-comprou">
          <h3>{t('Já comprou? Ative aqui', 'Already bought? Activate here')}</h3>
          <p className="muted small">{t('Use o e-mail da compra e o código da transação que a Hotmart mandou para você (começa com HP). Vale para até 2 celulares.', 'Use the email from your purchase and the order code Hotmart sent you (starts with HP). Works on up to 2 phones.')}</p>
          <form className="stack-form" onSubmit={activate}>
            <label className="field">{t('E-mail da compra', 'Purchase email')}
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@email.com" autoComplete="email" inputMode="email" /></label>
            <label className="field">{t('Código da transação', 'Order code')}
              <input value={tx} onChange={e => setTx(e.target.value)} placeholder="HP12345678901" autoCapitalize="characters" autoCorrect="off" spellCheck={false} /></label>
            <button className="btn primary block" type="submit" disabled={busy}>{busy ? t('Conferindo…', 'Checking…') : t('Ativar meu Premium', 'Activate my Premium')}</button>
          </form>
        </section>
      ) : (
        <section className="card">
          <p className="muted small">{t('Premium ativo para', 'Premium active for')} <b>{s.buyerEmail}</b>. {t('Trocou de celular? Saia aqui e ative no aparelho novo.', 'New phone? Sign out here and activate on the new one.')}</p>
          <button className="btn ghost block" onClick={signOut}>{t('Sair do Premium neste celular', 'Sign out of Premium on this phone')}</button>
        </section>
      )}

      <section className="card plan-card">
        <h3>{t('Grátis para sempre', 'Free forever')}</h3>
        <ul className="checks">{FREE.map(f => <li key={f}><Icon name="check" size={18} /> {f}</li>)}</ul>
      </section>
    </div>
  )
}
