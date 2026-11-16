export type Lang = 'pt' | 'en'

let current: Lang = 'pt'
export const setLang = (l: Lang) => { current = l; document.documentElement.lang = l === 'en' ? 'en-US' : 'pt-BR' }
export const getLang = () => current
export const locale = () => (current === 'en' ? 'en-US' : 'pt-BR')
/** Texto no idioma atual: t('português', 'english') */
export const t = (pt: string, en: string) => (current === 'en' ? en : pt)

export function detectLang(): Lang {
  const q = new URLSearchParams(location.search).get('lang')
  if (q === 'en' || q === 'pt') return q
  return navigator.language?.toLowerCase().startsWith('pt') ? 'pt' : 'en'
}

// ===== Unidades: português usa kg/cm/ml; inglês (EUA) usa lb/in/fl oz. Os dados ficam sempre em kg/cm/ml. =====
const LB = 2.20462, IN = 2.54, OZ = 29.5735
export const imperial = () => current === 'en'
export const wUnit = () => (imperial() ? 'lb' : 'kg')
export const lUnit = () => (imperial() ? 'in' : 'cm')
export const toW = (kg: number) => (imperial() ? kg * LB : kg) // kg -> unidade de exibição
export const fromW = (v: number) => (imperial() ? v / LB : v) // unidade de exibição -> kg
export const toL = (cm: number) => (imperial() ? cm / IN : cm)
export const fromL = (v: number) => (imperial() ? v * IN : v)
export const GLASS_ML = () => (imperial() ? 8 * OZ : 250)

export const fmtNum = (n: number, digits = 1) => n.toLocaleString(locale(), { maximumFractionDigits: digits })
/** Peso (em kg) formatado na unidade do idioma, sem a unidade. */
export const fmtW = (kg: number) => fmtNum(toW(kg))
export const fmtL = (cm: number) => fmtNum(toL(cm))
export function fmtWater(ml: number) {
  return imperial() ? `${Math.round(ml / OZ)}` : fmtNum(ml / 1000, 2)
}
export const waterUnit = () => (imperial() ? 'oz' : 'L')
export const parseNum = (s: string) => Number(String(s).replace(',', '.'))
