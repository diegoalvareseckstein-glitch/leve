// ===== CONFIGURAÇÃO DE VENDAS (Hotmart) =====
// Cole aqui os links de checkout da Hotmart quando o produto estiver cadastrado.
// Enquanto estiverem vazios, o botão de compra leva para a lista de espera.
export const HOTMART_CHECKOUT = {
  pt: 'https://pay.hotmart.com/S108552843Q',
  en: ''  // ex.: https://pay.hotmart.com/C98765432D (oferta em dólar)
}

// Endereço do servidor de acesso (Supabase Edge Function "leve-access").
// Cada compra da Hotmart gera um acesso único: a pessoa entra com o e-mail e o código da transação (HP...).
export const ACCESS_API: string = import.meta.env.VITE_ACCESS_API || 'https://tavajtiqdmvmjssrtvri.supabase.co/functions/v1/leve-access'

// De quanto em quanto tempo o app confere de novo se o acesso continua válido (reembolso, fim dos 12 meses).
export const RECHECK_HOURS = 12
