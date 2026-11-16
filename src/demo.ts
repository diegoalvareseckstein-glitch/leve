import type { AppData, SiteId } from './types'
import { addDays, dayKey, uid } from './utils'
import { SITES } from './data'

/** Dados de exemplo: 10 semanas de tratamento, para demonstração e capturas de tela. */
export function demoData(base: AppData): AppData {
  const today = new Date()
  const start = addDays(today, -70)
  const doses = [], weights = [], symptoms = [], food: AppData['food'] = {}
  let kg = 94.2
  for (let w = 0; w < 10; w++) {
    const d = addDays(start, w * 7)
    doses.push({ id: uid(), date: dayKey(d), site: SITES[w % 6].id as SiteId, doseLabel: w < 4 ? '2,5 mg' : '5 mg' })
    kg -= 0.6 + Math.random() * 0.6
    weights.push({ id: uid(), date: dayKey(addDays(d, 2)), kg: Math.round(kg * 10) / 10, waistCm: w % 3 === 0 ? Math.round(108 - w * 1.2) : undefined })
    if (w % 2 === 0) symptoms.push({ id: uid(), date: addDays(d, 1).toISOString(), items: [{ id: 'nausea', severity: (w < 4 ? 2 : 1) as 1 | 2 }, ...(w % 4 === 0 ? [{ id: 'constipacao', severity: 1 as const }] : [])] })
  }
  for (let i = 1; i <= 6; i++) food[dayKey(addDays(today, -i))] = { protein: 90 + (i % 3) * 5, water: 2000, items: [] }
  food[dayKey(today)] = { protein: 61, water: 1250, items: [{ name: 'Ovo', protein: 12 }, { name: 'Frango grelhado', protein: 31 }, { name: 'Iogurte proteico', protein: 15 }, { name: 'Leite', protein: 3 }] }
  return {
    ...base,
    profile: {
      name: 'Ana', medication: 'Mounjaro', doseLabel: '5 mg', frequency: 'weekly', doseWeekday: today.getDay(), doseTime: '08:00',
      heightCm: 165, startWeight: 94.2, goalWeight: 75, startDate: dayKey(start), proteinGoal: 90, waterGoal: 2750
    },
    doses, weights, symptoms, food
  }
}
