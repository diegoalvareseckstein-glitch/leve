export type Frequency = 'weekly' | 'daily'
export type SiteId = 'abd-e' | 'abd-d' | 'coxa-e' | 'coxa-d' | 'braco-e' | 'braco-d'

export interface Profile {
  name: string
  medication: string
  doseLabel: string // dose prescrita, digitada pela pessoa (ex.: "0,5 mg")
  frequency: Frequency
  doseWeekday: number // 0 = domingo
  doseTime: string // "08:00"
  heightCm: number
  startWeight: number
  goalWeight: number
  startDate: string // yyyy-mm-dd
  proteinGoal: number // g/dia
  waterGoal: number // ml/dia
}

export interface DoseLog { id: string; date: string; site: SiteId; doseLabel: string; note?: string }
export interface WeightLog { id: string; date: string; kg: number; waistCm?: number; hipCm?: number }
export interface SymptomEntry { id: string; severity: 1 | 2 | 3 }
export interface SymptomLog { id: string; date: string; items: SymptomEntry[]; note?: string }
export interface FoodDay { protein: number; water: number; items: { name: string; protein: number }[] }

export interface Settings {
  largeText: boolean
  highContrast: boolean
  plan: 'free' | 'premium'
  trialEndsAt?: string
}

export interface AppData {
  version: 1
  profile: Profile | null
  doses: DoseLog[]
  weights: WeightLog[]
  symptoms: SymptomLog[]
  food: Record<string, FoodDay>
  settings: Settings
}
