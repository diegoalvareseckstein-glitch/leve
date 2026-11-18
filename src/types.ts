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
  // Perfil físico (para treino e dieta)
  age?: number
  sex?: 'f' | 'm'
  activity?: Activity
  trainPlace?: 'home' | 'gym'
  trainDays?: number // 2 a 5
  limits?: Limit[]
  dietId?: string
}

export type Activity = 'sedentary' | 'light' | 'moderate' | 'active'
export type Limit = 'knee' | 'back' | 'shoulder'

export interface WorkoutLog { id: string; date: string; workout: string }
export interface Reminders {
  water: { on: boolean; start: string; end: string; every: number }
  meals: { on: boolean; times: string[] }
  sleep: { on: boolean; bed: string; wake: string }
  gym: { on: boolean; time: string }
}

export interface DoseLog { id: string; date: string; site: SiteId; doseLabel: string; note?: string }
export interface WeightLog { id: string; date: string; kg: number; waistCm?: number; hipCm?: number; neckCm?: number }
export interface SymptomEntry { id: string; severity: 1 | 2 | 3 }
export interface SymptomLog { id: string; date: string; items: SymptomEntry[]; note?: string }
export interface FoodDay { protein: number; water: number; items: { name: string; protein: number }[] }

export interface Settings {
  largeText: boolean
  highContrast: boolean
  plan: 'free' | 'premium'
  trialEndsAt?: string
  premiumUntil?: string // compra: data de fim do acesso ('' = vitalício)
  purchased?: boolean
  accessToken?: string // token deste aparelho (gerado pelo servidor na ativação)
  accessCheckedAt?: string
  buyerEmail?: string
  lang?: 'pt' | 'en'
}

export interface Supply { dosesInStock: number; setAt: string }
export interface TitrationStep { id: string; date: string; dose: string }

export interface AppData {
  version: 1
  profile: Profile | null
  doses: DoseLog[]
  weights: WeightLog[]
  symptoms: SymptomLog[]
  food: Record<string, FoodDay>
  settings: Settings
  supply?: Supply
  titration?: TitrationStep[]
  workouts?: WorkoutLog[]
  meals?: Record<string, string[]> // dia -> refeições marcadas como feitas
  reminders?: Reminders
}
