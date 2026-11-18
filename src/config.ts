// ===== CONFIGURAÇÃO DE VENDAS (Hotmart) =====
// Cole aqui os links de checkout da Hotmart quando o produto estiver cadastrado.
// Enquanto estiverem vazios, o botão de compra leva para a lista de espera.
export const HOTMART_CHECKOUT = {
  pt: '', // ex.: https://pay.hotmart.com/A12345678B
  en: ''  // ex.: https://pay.hotmart.com/C98765432D (oferta em dólar)
}

// Quanto tempo o Premium fica liberado depois da compra (em dias). 0 = vitalício.
export const ACCESS_DAYS = 365

// Códigos de ativação aceitos (guardamos só o "hash" SHA-256, nunca o código em si).
// Na Hotmart, configure a página de obrigado para: https://SEU-SITE/app/?ativar=CODIGO
export const ACTIVATION_HASHES = [
  '3f83d2380db6aa27a28087b0b0afe79c9d5dd7d7e1d43fda2f77a2317d51591b'
]
