import { useCallback, useEffect, useState } from 'react'
import type { AppData } from './types'

const KEY = 'leve:data:v1'
export const emptyData = (): AppData => ({
  version: 1, profile: null, doses: [], weights: [], symptoms: [], food: {},
  settings: { largeText: false, highContrast: false, plan: 'free' }
})

function load(): AppData {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyData()
    const parsed = JSON.parse(raw)
    return { ...emptyData(), ...parsed, settings: { ...emptyData().settings, ...parsed.settings } }
  } catch { return emptyData() }
}

/** Os dados ficam só no aparelho da pessoa (localStorage). Ver README para sincronizar na nuvem. */
export function useAppData() {
  const [data, setData] = useState<AppData>(load)
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(data)) }, [data])
  const update = useCallback((fn: (d: AppData) => AppData) => setData(prev => fn(prev)), [])
  const reset = useCallback(() => { localStorage.removeItem(KEY); setData(emptyData()) }, [])
  const replace = useCallback((d: AppData) => setData({ ...emptyData(), ...d }), [])
  return { data, update, reset, replace }
}
export type Store = ReturnType<typeof useAppData>

import { ACCESS_API, RECHECK_HOURS } from './config'

export type ActivateResult = { ok: true; token: string; expires_at: string | null } | { ok: false; reason: string; max?: number }

async function callAccess(body: Record<string, unknown>) {
  if (!ACCESS_API) throw new Error('no_api')
  const r = await fetch(ACCESS_API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
  return r.json()
}

/** Ativa o Premium neste aparelho com o e-mail e o código da transação da Hotmart. */
export async function activatePurchase(email: string, transaction: string): Promise<ActivateResult> {
  try {
    const label = navigator.userAgent.replace(/\s+/g, ' ').slice(0, 80)
    const r = await callAccess({ action: 'activate', email, transaction, label })
    return r?.ok ? { ok: true, token: r.token, expires_at: r.expires_at ?? null } : { ok: false, reason: r?.reason ?? 'server', max: r?.max }
  } catch { return { ok: false, reason: 'offline' } }
}

/** Confere no servidor se o acesso deste aparelho continua valendo. Retorna null se não deu para conferir (sem internet). */
export async function checkAccess(token: string): Promise<{ active: boolean; expires_at: string | null } | null> {
  try {
    const r = await callAccess({ action: 'check', token })
    return r?.ok ? { active: !!r.active, expires_at: r.expires_at ?? null } : null
  } catch { return null }
}
export async function logoutAccess(token: string) { try { await callAccess({ action: 'logout', token }) } catch { /* sem internet */ } }

export function needsRecheck(s: AppData['settings']) {
  if (!s.accessToken) return false
  return !s.accessCheckedAt || Date.now() - new Date(s.accessCheckedAt).getTime() > RECHECK_HOURS * 3600000
}

export function activatedSettings(s: AppData['settings'], token: string, expires: string | null, email: string): AppData['settings'] {
  return { ...s, plan: 'premium', purchased: true, accessToken: token, premiumUntil: expires ?? '', accessCheckedAt: new Date().toISOString(), buyerEmail: email, trialEndsAt: undefined }
}
export function revokedSettings(s: AppData['settings']): AppData['settings'] {
  return { ...s, plan: 'free', purchased: false, accessToken: undefined, premiumUntil: undefined, accessCheckedAt: undefined }
}

export function isPremium(d: AppData) {
  if (d.settings.plan !== 'premium') return false
  // Compra só vale com token do servidor (o código único antigo foi desativado)
  if (d.settings.purchased) return !!d.settings.accessToken && (!d.settings.premiumUntil || new Date(d.settings.premiumUntil) > new Date())
  if (d.settings.trialEndsAt && new Date(d.settings.trialEndsAt) < new Date()) return false
  return true
}
