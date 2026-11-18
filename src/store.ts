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

import { ACCESS_DAYS, ACTIVATION_HASHES } from './config'

/** Confere um código de ativação comparando o hash SHA-256 com a lista do config. */
export async function checkActivation(code: string) {
  const clean = code.trim().toUpperCase()
  if (!clean || !crypto?.subtle) return false
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(clean))
  const hex = [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
  return ACTIVATION_HASHES.includes(hex)
}

export function activatedSettings(s: AppData['settings']): AppData['settings'] {
  const until = ACCESS_DAYS > 0 ? new Date(Date.now() + ACCESS_DAYS * 86400000).toISOString() : ''
  return { ...s, plan: 'premium', purchased: true, premiumUntil: until, trialEndsAt: undefined }
}

export function isPremium(d: AppData) {
  if (d.settings.plan !== 'premium') return false
  if (d.settings.purchased) return !d.settings.premiumUntil || new Date(d.settings.premiumUntil) > new Date()
  if (d.settings.trialEndsAt && new Date(d.settings.trialEndsAt) < new Date()) return false
  return true
}
