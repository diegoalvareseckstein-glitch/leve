import { useState } from 'react'
import type { Store } from '../store'
import { isPremium } from '../store'
import { Icon } from '../components/ui'

const FREE = ['Lembrete de dose e rodízio do local', 'Peso, medidas e gráfico', 'Diário de sintomas com dicas', 'Meta de proteína e água', 'Seus dados só no seu aparelho']
const PREMIUM = ['Relatório para levar ao médico (PDF)', 'Ritmo semanal e previsão da meta', 'Em quais dias a dose dá mais sintomas', 'Backup e transferência de dados', 'Apoie um app brasileiro e independente']

export function Plans({ store, toast, back }: { store: Store; toast: (m: string) => void; back: () => void }) {
  const { data, update } = store
  const [period, setPeriod] = useState<'year' | 'month'>('year')
  const premium = isPremium(data)

  function startTrial() {
    // MODO DEMONSTRAÇÃO: troque por Mercado Pago, Stripe ou RevenueCat (veja o README)
    const end = new Date(); end.setDate(end.getDate() + 7)
    update(d => ({ ...d, settings: { ...d.settings, plan: 'premium', trialEndsAt: end.toISOString() } }))
    toast('Premium liberado por 7 dias (demonstração) ✨')
    back()
  }

  return (
    <div className="screen plans">
      <button className="link back" onClick={back}>‹ Voltar</button>
      <div className="plans-hero">
        <span className="badge big">Leve Premium</span>
        <h1>Chegue à sua meta com mais clareza</h1>
        <p className="muted">O essencial é grátis para sempre. O Premium traz análises e o relatório para o médico.</p>
      </div>

      <div className="seg" role="tablist" aria-label="Período">
        <button role="tab" aria-selected={period === 'year'} className={period === 'year' ? 'on' : ''} onClick={() => setPeriod('year')}>Anual <span className="save">-42%</span></button>
        <button role="tab" aria-selected={period === 'month'} className={period === 'month' ? 'on' : ''} onClick={() => setPeriod('month')}>Mensal</button>
      </div>

      <section className="card plan-card featured">
        <div className="price">
          {period === 'year' ? <><b>R$ 89,90</b><span>/ano</span></> : <><b>R$ 12,90</b><span>/mês</span></>}
        </div>
        <p className="muted small">{period === 'year' ? 'Equivale a R$ 7,49 por mês. Menos que um café.' : 'Cancele quando quiser.'}</p>
        <ul className="checks">{PREMIUM.map(f => <li key={f}><Icon name="check" size={18} /> {f}</li>)}</ul>
        {premium
          ? <p className="center"><b>✓ Você já é Premium</b></p>
          : <button className="btn accent block" onClick={startTrial}>Testar 7 dias grátis</button>}
        <p className="muted tiny center">Pagamento por Pix ou cartão. Sem cobrança durante o teste.</p>
      </section>

      <section className="card plan-card">
        <h3>Grátis para sempre</h3>
        <ul className="checks">{FREE.map(f => <li key={f}><Icon name="check" size={18} /> {f}</li>)}</ul>
      </section>

      <p className="muted tiny center">Tem dificuldade para pagar? Escreva para a gente: o Leve tem preço social para quem precisa.</p>
    </div>
  )
}
