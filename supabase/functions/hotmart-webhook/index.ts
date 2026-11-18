// Recebe os avisos de venda da Hotmart (Webhook 2.0) e libera ou corta o acesso.
// Variáveis (Edge Function Secrets): HOTMART_HOTTOK, HOTMART_PRODUCT_ID (opcional), ACCESS_DAYS (opcional, padrão 365)
import { createClient } from 'npm:@supabase/supabase-js@2'

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
const PRODUCT_ID = Deno.env.get('HOTMART_PRODUCT_ID') ?? ''
const ACCESS_DAYS = Number(Deno.env.get('ACCESS_DAYS') ?? '365')

const GRANT = ['PURCHASE_APPROVED', 'PURCHASE_COMPLETE']
const REVOKE = ['PURCHASE_REFUNDED', 'PURCHASE_CHARGEBACK', 'PURCHASE_CANCELED', 'PURCHASE_PROTEST', 'PURCHASE_EXPIRED']

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

Deno.serve(async req => {
  if (req.method !== 'POST') return json({ ok: true, hint: 'POST only' })
  let body: any
  try { body = await req.json() } catch { return json({ error: 'invalid json' }, 400) }

  const HOTTOK = (Deno.env.get('HOTMART_HOTTOK') ?? '').trim()
  const token = (req.headers.get('x-hotmart-hottok') ?? body?.hottok ?? '').toString().trim()
  if (!HOTTOK || token !== HOTTOK) {
    await db.from('webhook_log').insert({ event: body?.event ?? null, ok: false, note: `hottok inválido (recebido ${token.length} car., esperado ${HOTTOK.length} car.)` })
    return json({ error: 'unauthorized' }, 401)
  }

  const event: string = body?.event ?? ''
  const data = body?.data ?? {}
  const tx: string = (data?.purchase?.transaction ?? '').toString().trim().toUpperCase()
  const email: string = (data?.buyer?.email ?? '').toString().trim().toLowerCase()
  const productId = (data?.product?.id ?? '').toString()

  if (!tx) { await db.from('webhook_log').insert({ event, ok: false, note: 'sem transação' }); return json({ ok: true, ignored: 'no transaction' }) }
  if (PRODUCT_ID && productId && productId !== PRODUCT_ID) {
    await db.from('webhook_log').insert({ event, transaction: tx, ok: true, note: `outro produto ${productId}` })
    return json({ ok: true, ignored: 'other product' })
  }

  if (GRANT.includes(event)) {
    const approvedMs = Number(data?.purchase?.approved_date) || Date.now()
    const approved = new Date(approvedMs)
    const expires = ACCESS_DAYS > 0 ? new Date(approvedMs + ACCESS_DAYS * 86400000).toISOString() : null
    const { data: prev } = await db.from('purchases').select('status').eq('transaction', tx).maybeSingle()
    if (prev?.status === 'revoked') {
      await db.from('webhook_log').insert({ event, transaction: tx, ok: true, note: 'já revogada, mantida' })
      return json({ ok: true, kept: 'revoked' })
    }
    const { error } = await db.from('purchases').upsert({
      transaction: tx, email, name: data?.buyer?.name ?? null, product_id: productId || null,
      status: 'active', last_event: event, approved_at: approved.toISOString(), expires_at: expires, updated_at: new Date().toISOString(),
    })
    await db.from('webhook_log').insert({ event, transaction: tx, ok: !error, note: error?.message ?? 'liberado' })
    return error ? json({ error: error.message }, 500) : json({ ok: true, granted: tx })
  }

  if (REVOKE.includes(event)) {
    const { error } = await db.from('purchases').upsert({
      transaction: tx, email, product_id: productId || null, status: 'revoked', last_event: event, updated_at: new Date().toISOString(),
    })
    await db.from('devices').delete().eq('transaction', tx)
    await db.from('webhook_log').insert({ event, transaction: tx, ok: !error, note: error?.message ?? 'revogado' })
    return error ? json({ error: error.message }, 500) : json({ ok: true, revoked: tx })
  }

  await db.from('webhook_log').insert({ event, transaction: tx, ok: true, note: 'evento ignorado' })
  return json({ ok: true, ignored: event })
})
