import type { Activity, Profile } from './types'
import { bmi } from './utils'

export const ACTIVITY_FACTOR: Record<Activity, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 }

/** Gasto em repouso pela fórmula de Mifflin-St Jeor (kcal/dia). */
export function bmr(p: Profile, kg: number) {
  const base = 10 * kg + 6.25 * p.heightCm - 5 * (p.age ?? 40)
  return p.sex === 'm' ? base + 5 : base - 161
}

/** Calorias para emagrecer com segurança: gasto total menos ~500 kcal, sem passar de 25% de déficit nem ficar abaixo do mínimo. */
export function calorieTarget(p: Profile, kg: number) {
  const tdee = bmr(p, kg) * ACTIVITY_FACTOR[p.activity ?? 'sedentary']
  const floor = p.sex === 'm' ? 1500 : 1200
  const target = Math.max(floor, tdee - 500, tdee * 0.75)
  return { tdee: Math.round(tdee), target: Math.round(target / 50) * 50 }
}

export type Level = 1 | 2 | 3

/** Nível de treino a partir de atividade, idade e IMC. */
export function trainingLevel(p: Profile, kg: number): Level {
  const b = bmi(kg, p.heightCm), age = p.age ?? 40, a = p.activity ?? 'sedentary'
  if (a === 'sedentary' || a === 'light' || age >= 65 || b >= 35) return 1
  if (a === 'active' && age < 50 && b < 30) return 3
  return 2
}

export function lowImpact(p: Profile, kg: number) {
  return bmi(kg, p.heightCm) >= 30 || (p.age ?? 40) >= 55 || (p.limits ?? []).includes('knee')
}

/** Precisa de liberação médica antes de começar? */
export function needsClearance(p: Profile, kg: number) {
  return (p.age ?? 40) >= 65 || bmi(kg, p.heightCm) >= 40
}

export const hasBodyProfile = (p: Profile) => !!(p.age && p.sex && p.activity && p.trainPlace && p.trainDays)

/** Análise corporal: % de gordura (fórmula da Marinha dos EUA com medidas, ou Deurenberg pelo IMC), massas, riscos e peso saudável. */
export function bodyAnalysis(p: Profile, kg: number, m: { waistCm?: number; hipCm?: number; neckCm?: number }) {
  const h = p.heightCm, b = bmi(kg, h), male = p.sex === 'm', age = p.age ?? 40
  let fat: number, method: 'navy' | 'bmi'
  if (m.waistCm && m.neckCm && (male || m.hipCm) && m.waistCm > m.neckCm) {
    fat = male
      ? 495 / (1.0324 - 0.19077 * Math.log10(m.waistCm - m.neckCm) + 0.15456 * Math.log10(h)) - 450
      : 495 / (1.29579 - 0.35004 * Math.log10(m.waistCm + (m.hipCm ?? 0) - m.neckCm) + 0.221 * Math.log10(h)) - 450
    method = 'navy'
  } else {
    fat = 1.2 * b + 0.23 * age - 10.8 * (male ? 1 : 0) - 5.4
    method = 'bmi'
  }
  fat = Math.min(60, Math.max(5, fat))
  const fatKg = kg * fat / 100
  const whtr = m.waistCm ? m.waistCm / h : undefined
  const whr = m.waistCm && m.hipCm ? m.waistCm / m.hipCm : undefined
  const whrRisk = whr ? whr > (male ? 0.9 : 0.85) : undefined
  const fatBand = male ? (fat < 18 ? 'good' : fat < 25 ? 'ok' : 'high') : (fat < 25 ? 'good' : fat < 32 ? 'ok' : 'high')
  const bmiBand = b < 18.5 ? 'under' : b < 25 ? 'normal' : b < 30 ? 'over' : b < 35 ? 'ob1' : b < 40 ? 'ob2' : 'ob3'
  const hm = h / 100
  return {
    bmi: b, bmiBand, fat, fatKg, leanKg: kg - fatKg, method, fatBand,
    whtr, whtrRisk: whtr ? whtr >= 0.5 : undefined, whr, whrRisk,
    healthyMin: 18.5 * hm * hm, healthyMax: 24.9 * hm * hm,
    shape: whr ? (whr > (male ? 0.95 : 0.85) ? 'apple' : 'pear') : undefined
  }
}
