// Ativação e verificação do Premium no app.
// POST { action: 'activate', email, transaction, label? } -> { ok, token, expires_at }
// POST { action: 'check', token }                         -> { ok, active, expires_at }
// POST { action: 'logout', token }                        -> { ok }
// Variáveis opcionais: MAX_DEVICES (padrão 2)
import { createClient } from 'npm:@supabase/supabase-js@2'

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
const MAX_DEVICES = Number(Deno.env.get('MAX_DEVICES') ?? '2')

const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'content-type, authorization, apikey, x-client-info',
  'access-control-allow-methods': 'POST, OPTIONS',
}
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'content-type': 'application/json' } })

async function sha256(s: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
}
const isActive = (p: any) => p && p.status === 'active' && (!p.expires_at || new Date(p.expires_at) > new Date())

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405)
  let body: any
  try { body = await req.json() } catch { return json({ error: 'invalid json' }, 400) }
  const action = body?.action

  if (action === 'activate') {
    const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown'
    const since = new Date(Date.now() - 15 * 60000).toISOString()
    const { count } = await db.from('activation_attempts').select('id', { count: 'exact', head: true }).eq('ip', ip).eq('ok', false).gte('at', since)
    if ((count ?? 0) >= 10) return json({ ok: false, reason: 'too_many' }, 429)

    const email = (body?.email ?? '').toString().trim().toLowerCase()
    const tx = (body?.transaction ?? '').toString().trim().toUpperCase().replace(/\s+/g, '')
    if (!email || !tx) return json({ ok: false, reason: 'missing' }, 400)
    const { data: p } = await db.from('purchases').select('*').eq('transaction', tx).maybeSingle()
    if (!p || p.email !== email) {
      await db.from('activation_attempts').insert({ ip, ok: false })
      return json({ ok: false, reason: 'not_found' }, 404)
    }
    if (!isActive(p)) return json({ ok: false, reason: p.status === 'revoked' ? 'revoked' : 'expired', expires_at: p.expires_at }, 403)

    const { data: devs } = await db.from('devices').select('token_hash, last_seen').eq('transaction', tx).order('last_seen', { ascending: true })
    if ((devs?.length ?? 0) >= MAX_DEVICES) return json({ ok: false, reason: 'device_limit', max: MAX_DEVICES }, 403)

    const token = crypto.randomUUID() + crypto.randomUUID()
    const { error } = await db.from('devices').insert({ token_hash: await sha256(token), transaction: tx, label: (body?.label ?? '').toString().slice(0, 80) })
    if (error) return json({ ok: false, reason: 'server', detail: error.message }, 500)
    await db.from('activation_attempts').insert({ ip, ok: true })
    return json({ ok: true, token, expires_at: p.expires_at })
  }

  if (action === 'check' || action === 'logout') {
    const token = (body?.token ?? '').toString()
    if (!token) return json({ ok: false, reason: 'missing' }, 400)
    const hash = await sha256(token)
    if (action === 'logout') { await db.from('devices').delete().eq('token_hash', hash); return json({ ok: true }) }
    const { data: d } = await db.from('devices').select('transaction').eq('token_hash', hash).maybeSingle()
    if (!d) return json({ ok: true, active: false, reason: 'unknown_device' })
    const { data: p } = await db.from('purchases').select('*').eq('transaction', d.transaction).maybeSingle()
    await db.from('devices').update({ last_seen: new Date().toISOString() }).eq('token_hash', hash)
    return json({ ok: true, active: isActive(p), expires_at: p?.expires_at ?? null, reason: isActive(p) ? undefined : (p?.status === 'revoked' ? 'revoked' : 'expired') })
  }

  return json({ error: 'unknown action' }, 400)
})
