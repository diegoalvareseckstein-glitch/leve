import type { Limit, Profile } from './types'
import { getLang } from './i18n'
import { lowImpact, trainingLevel, type Level } from './fitness'
import { addDays, diffDays, parseDay } from './utils'

type Pattern = 'squat' | 'hinge' | 'push' | 'pull' | 'lunge' | 'shoulder' | 'core' | 'glute'
type Place = 'home' | 'gym' | 'both'

interface Exercise {
  id: string; pattern: Pattern; place: Place; level: Level; avoid?: Limit[]; highImpact?: boolean
  pt: [string, string]; en: [string, string] // [nome, como fazer]
  unit?: 'reps' | 'sec'
}

// Biblioteca de exercícios: do mais fácil (1) ao mais difícil (3), em casa e na academia.
const LIB: Exercise[] = [
  // Agachamento
  { id: 'sit-stand', pattern: 'squat', place: 'both', level: 1, pt: ['Sentar e levantar da cadeira', 'Pés na largura do quadril. Sente devagar, encoste o bumbum na cadeira e levante empurrando o chão com os calcanhares.'], en: ['Chair sit-to-stand', 'Feet hip-width apart. Sit down slowly, touch the chair, and stand up by pushing through your heels.'] },
  { id: 'squat', pattern: 'squat', place: 'home', level: 2, avoid: ['knee'], pt: ['Agachamento livre', 'Desça como se fosse sentar, peito aberto e joelhos na direção dos pés. Suba soltando o ar.'], en: ['Bodyweight squat', 'Sit back like into a chair, chest up, knees tracking over your toes. Exhale as you stand.'] },
  { id: 'goblet', pattern: 'squat', place: 'gym', level: 2, avoid: ['knee'], pt: ['Agachamento com halter (goblet)', 'Segure um halter junto ao peito. Desça com a coluna reta até onde for confortável e suba.'], en: ['Goblet squat', 'Hold a dumbbell at your chest. Lower with a straight back as far as is comfortable, then stand.'] },
  { id: 'legpress', pattern: 'squat', place: 'gym', level: 1, pt: ['Leg press', 'Costas apoiadas no banco. Desça até os joelhos formarem 90° e empurre sem travar os joelhos no final.'], en: ['Leg press', 'Back flat on the pad. Lower until knees reach 90°, then push without locking your knees.'] },
  { id: 'bulgarian', pattern: 'squat', place: 'both', level: 3, avoid: ['knee'], pt: ['Agachamento búlgaro', 'Pé de trás apoiado num banco. Desça o joelho de trás em direção ao chão, tronco firme.'], en: ['Bulgarian split squat', 'Rear foot on a bench. Lower your back knee toward the floor, torso tall.'] },
  // Quadril
  { id: 'bridge', pattern: 'hinge', place: 'both', level: 1, pt: ['Ponte de glúteo', 'Deitado de barriga para cima, joelhos dobrados. Suba o quadril apertando o bumbum, segure 2 segundos e desça.'], en: ['Glute bridge', 'Lie on your back, knees bent. Lift your hips by squeezing your glutes, hold 2 seconds, lower.'] },
  { id: 'hipthrust', pattern: 'hinge', place: 'gym', level: 2, pt: ['Elevação pélvica com peso', 'Costas apoiadas no banco e peso no quadril. Suba até o tronco ficar reto e aperte o glúteo.'], en: ['Hip thrust', 'Upper back on a bench, weight on your hips. Drive up until your torso is flat and squeeze.'] },
  { id: 'rdl', pattern: 'hinge', place: 'gym', level: 2, avoid: ['back'], pt: ['Terra romeno com halteres', 'Joelhos levemente dobrados. Leve o quadril para trás descendo os halteres rente às pernas, coluna reta.'], en: ['Dumbbell Romanian deadlift', 'Soft knees. Push your hips back and slide the dumbbells down your legs, back straight.'] },
  { id: 'single-bridge', pattern: 'hinge', place: 'home', level: 3, pt: ['Ponte com uma perna', 'Como a ponte de glúteo, mas com uma perna esticada no ar. Troque de lado.'], en: ['Single-leg glute bridge', 'Like a glute bridge, but with one leg extended. Switch sides.'] },
  // Empurrar
  { id: 'wall-push', pattern: 'push', place: 'home', level: 1, avoid: [], pt: ['Flexão na parede', 'Mãos na parede na altura do peito. Dobre os cotovelos levando o peito à parede e empurre de volta.'], en: ['Wall push-up', 'Hands on the wall at chest height. Bend your elbows to bring your chest in, then push back.'] },
  { id: 'incline-push', pattern: 'push', place: 'home', level: 2, pt: ['Flexão inclinada (mesa ou sofá)', 'Mãos apoiadas numa superfície firme e alta. Corpo reto como uma tábua, desça o peito e suba.'], en: ['Incline push-up', 'Hands on a sturdy counter or couch. Body straight like a plank, lower your chest and push up.'] },
  { id: 'pushup', pattern: 'push', place: 'home', level: 3, avoid: ['shoulder'], pt: ['Flexão de braço', 'Mãos um pouco mais abertas que os ombros. Desça o corpo inteiro reto e suba.'], en: ['Push-up', 'Hands slightly wider than shoulders. Lower your whole body in a straight line and push up.'] },
  { id: 'machine-press', pattern: 'push', place: 'gym', level: 1, pt: ['Supino na máquina', 'Costas apoiadas. Empurre as alças à frente soltando o ar e volte devagar.'], en: ['Machine chest press', 'Back against the pad. Press the handles forward as you exhale, return slowly.'] },
  { id: 'db-press', pattern: 'push', place: 'gym', level: 2, avoid: ['shoulder'], pt: ['Supino com halteres', 'Deitado no banco, desça os halteres até a linha do peito e empurre para cima.'], en: ['Dumbbell bench press', 'Lying on a bench, lower the dumbbells to chest level and press up.'] },
  // Puxar
  { id: 'band-row', pattern: 'pull', place: 'home', level: 1, pt: ['Remada com elástico', 'Prenda o elástico na porta. Puxe os cotovelos para trás juntando as escápulas.'], en: ['Resistance band row', 'Anchor the band in a door. Pull your elbows back, squeezing your shoulder blades.'] },
  { id: 'backpack-row', pattern: 'pull', place: 'home', level: 2, pt: ['Remada curvada com mochila', 'Mochila com livros ou garrafas. Incline o tronco, coluna reta, e puxe a mochila até a barriga.'], en: ['Bent-over backpack row', 'Load a backpack with books. Hinge forward, back straight, and pull it to your belly.'] },
  { id: 'lat-pulldown', pattern: 'pull', place: 'gym', level: 1, pt: ['Puxada na frente', 'Segure a barra mais aberta que os ombros e puxe até o queixo, peito aberto.'], en: ['Lat pulldown', 'Grip wider than shoulders and pull the bar to your chin, chest up.'] },
  { id: 'seated-row', pattern: 'pull', place: 'gym', level: 1, pt: ['Remada baixa na máquina', 'Coluna reta. Puxe as alças até a barriga e volte controlando.'], en: ['Seated cable row', 'Sit tall. Pull the handles to your belly and return with control.'] },
  { id: 'db-row', pattern: 'pull', place: 'gym', level: 2, pt: ['Remada unilateral com halter', 'Mão e joelho apoiados no banco. Puxe o halter até a cintura.'], en: ['One-arm dumbbell row', 'Hand and knee on a bench. Row the dumbbell to your hip.'] },
  // Passada
  { id: 'step-up', pattern: 'lunge', place: 'both', level: 1, pt: ['Subida no degrau', 'Suba num degrau baixo com uma perna, segurando no corrimão se precisar. Troque de lado.'], en: ['Step-up', 'Step onto a low step with one leg, holding a rail if needed. Switch sides.'] },
  { id: 'split-squat', pattern: 'lunge', place: 'both', level: 2, avoid: ['knee'], pt: ['Passada parada', 'Um pé à frente e outro atrás. Desça o joelho de trás em direção ao chão e suba.'], en: ['Split squat', 'One foot forward, one back. Lower your back knee toward the floor and rise.'] },
  { id: 'lunge', pattern: 'lunge', place: 'both', level: 3, avoid: ['knee'], highImpact: true, pt: ['Afundo alternado', 'Dê um passo à frente, desça os dois joelhos a 90° e volte. Alterne as pernas.'], en: ['Alternating lunge', 'Step forward, lower both knees to 90°, step back. Alternate legs.'] },
  // Glúteo médio (bom para joelho)
  { id: 'side-leg', pattern: 'glute', place: 'home', level: 1, pt: ['Abdução de quadril deitado', 'Deitado de lado, suba a perna de cima esticada sem girar o quadril.'], en: ['Side-lying leg raise', 'Lying on your side, lift your top leg straight up without rolling your hips.'] },
  { id: 'abductor', pattern: 'glute', place: 'gym', level: 1, pt: ['Cadeira abdutora', 'Abra as pernas contra a resistência e volte devagar.'], en: ['Hip abductor machine', 'Push your legs apart against the pads and return slowly.'] },
  { id: 'band-walk', pattern: 'glute', place: 'both', level: 2, pt: ['Caminhada lateral com elástico', 'Elástico acima dos joelhos, joelhos levemente dobrados. Dê passos para o lado.'], en: ['Band side walk', 'Band above your knees, slight squat. Step sideways.'] },
  // Ombro
  { id: 'lateral-raise', pattern: 'shoulder', place: 'both', level: 1, pt: ['Elevação lateral (garrafas ou halteres)', 'Braços ao lado do corpo. Suba até a altura dos ombros e desça devagar.'], en: ['Lateral raise', 'Arms by your sides. Raise to shoulder height and lower slowly.'] },
  { id: 'face-pull', pattern: 'shoulder', place: 'both', level: 1, pt: ['Puxada para o rosto com elástico', 'Puxe o elástico em direção ao rosto abrindo os cotovelos. Ótimo para a postura.'], en: ['Band face pull', 'Pull the band toward your face, elbows high and wide. Great for posture.'] },
  { id: 'db-shoulder', pattern: 'shoulder', place: 'gym', level: 2, avoid: ['shoulder'], pt: ['Desenvolvimento com halteres sentado', 'Sentado com apoio, empurre os halteres acima da cabeça sem arquear as costas.'], en: ['Seated dumbbell shoulder press', 'Seated with back support, press the dumbbells overhead without arching.'] },
  // Abdômen
  { id: 'dead-bug', pattern: 'core', place: 'both', level: 1, pt: ['Dead bug', 'Deitado, braços para cima e joelhos a 90°. Estique braço e perna opostos sem tirar a lombar do chão.'], en: ['Dead bug', 'On your back, arms up, knees at 90°. Extend opposite arm and leg, keeping your low back down.'] },
  { id: 'bird-dog', pattern: 'core', place: 'both', level: 1, pt: ['Perdigueiro (bird dog)', 'De quatro apoios, estique braço e perna opostos e segure 3 segundos.'], en: ['Bird dog', 'On hands and knees, extend opposite arm and leg and hold 3 seconds.'] },
  { id: 'knee-plank', pattern: 'core', place: 'both', level: 1, unit: 'sec', pt: ['Prancha com joelhos apoiados', 'Antebraços e joelhos no chão, corpo reto do joelho à cabeça. Respire normalmente.'], en: ['Kneeling plank', 'Forearms and knees down, body straight from knees to head. Keep breathing.'] },
  { id: 'plank', pattern: 'core', place: 'both', level: 2, avoid: ['back'], unit: 'sec', pt: ['Prancha', 'Antebraços e pontas dos pés no chão, barriga firme e bumbum alinhado.'], en: ['Plank', 'Forearms and toes down, core tight, hips in line.'] },
  { id: 'side-plank', pattern: 'core', place: 'both', level: 3, unit: 'sec', pt: ['Prancha lateral', 'Apoiado num antebraço, de lado, quadril alto. Troque de lado.'], en: ['Side plank', 'On one forearm, sideways, hips high. Switch sides.'] }
]

// Divisão dos treinos por número de dias na semana
const TEMPLATES: Record<string, Pattern[]> = {
  A: ['squat', 'push', 'pull', 'hinge', 'shoulder', 'core'],
  B: ['lunge', 'pull', 'push', 'glute', 'hinge', 'core'],
  U: ['push', 'pull', 'shoulder', 'push', 'pull', 'core'],
  L: ['squat', 'hinge', 'lunge', 'glute', 'core', 'core']
}
const SPLITS: Record<number, string[]> = { 2: ['A', 'B'], 3: ['A', 'B', 'A'], 4: ['U', 'L', 'U', 'L'], 5: ['U', 'L', 'A', 'U', 'L'] }
const WEEKDAYS_BY_COUNT: Record<number, number[]> = { 2: [1, 4], 3: [1, 3, 5], 4: [1, 2, 4, 5], 5: [1, 2, 3, 4, 5] }

export interface PlannedExercise { id: string; name: string; how: string; sets: number; reps: string; rest: string }
export interface Workout { key: string; title: string; weekday: number; warmup: string; exercises: PlannedExercise[]; cardio: string; cooldown: string }

function pick(pattern: Pattern, place: 'home' | 'gym', level: Level, limits: Limit[], noImpact: boolean, skip: Set<string>) {
  const ok = LIB.filter(e => e.pattern === pattern && (e.place === 'both' || e.place === place) && e.level <= level
    && !(e.avoid ?? []).some(a => limits.includes(a)) && !(noImpact && e.highImpact))
  ok.sort((a, b) => b.level - a.level)
  return ok.find(e => !skip.has(e.id)) ?? ok[0]
}

/** Semana do programa (1, 2, 3...) contada a partir do início do tratamento. */
export function programWeek(p: Profile) {
  return Math.max(1, Math.floor(diffDays(new Date(), parseDay(p.startDate)) / 7) + 1)
}

/** Gera o plano semanal de treino personalizado. */
export function buildPlan(p: Profile, kg: number) {
  const en = getLang() === 'en'
  const level = trainingLevel(p, kg)
  const noImpact = lowImpact(p, kg)
  const days = Math.min(5, Math.max(2, p.trainDays ?? 3))
  const place = p.trainPlace ?? 'home'
  const limits = p.limits ?? []
  const week = programWeek(p)
  // Progressão: começa leve e aumenta séries a cada 4 semanas
  const sets = level === 1 ? (week <= 2 ? 2 : 3) : level === 2 ? 3 : (week <= 4 ? 3 : 4)
  const reps = level === 1 ? '10–12' : level === 2 ? '10–15' : '8–12'
  const secs = level === 1 ? '20–30 s' : level === 2 ? '30–45 s' : '45–60 s'
  const rest = level === 3 ? '60–90 s' : '60 s'
  // Cardio: meta semanal sobe aos poucos até 150 minutos (recomendação da OMS)
  const cardioWeek = level === 1 ? Math.min(150, 60 + (week - 1) * 15) : level === 2 ? 150 : 180
  const cardioPerDay = Math.round(cardioWeek / 7 / 5) * 5 || 10
  const cardioKind = noImpact
    ? (place === 'gym' ? t2(en, 'bicicleta ergométrica ou elíptico', 'stationary bike or elliptical') : t2(en, 'caminhada leve', 'brisk walk'))
    : (place === 'gym' ? t2(en, 'esteira inclinada, bike ou elíptico', 'incline treadmill, bike or elliptical') : t2(en, 'caminhada rápida', 'brisk walk'))

  const names: Record<string, [string, string]> = { A: ['Corpo todo A', 'Full body A'], B: ['Corpo todo B', 'Full body B'], U: ['Parte de cima', 'Upper body'], L: ['Pernas e glúteos', 'Lower body'] }
  const split = SPLITS[days]
  const weekdays = WEEKDAYS_BY_COUNT[days]
  const workouts: Workout[] = split.map((key, i) => {
    const used = new Set<string>()
    const exercises = TEMPLATES[key].map(pt => {
      const e = pick(pt, place, level, limits, noImpact, used)
      if (!e) return null
      used.add(e.id)
      const [name, how] = en ? e.en : e.pt
      const isSec = e.unit === 'sec'
      return { id: e.id, name, how, sets, reps: isSec ? secs : `${reps}${['split-squat', 'lunge', 'step-up', 'bulgarian', 'side-leg', 'single-bridge', 'db-row'].includes(e.id) ? t2(en, ' cada lado', ' each side') : ''}`, rest }
    }).filter(Boolean) as PlannedExercise[]
    return {
      key: `${key}${i}`, title: en ? names[key][1] : names[key][0], weekday: weekdays[i],
      warmup: t2(en, '5 min: marcha no lugar, círculos com os braços e 10 agachamentos até a metade', '5 min: march in place, arm circles and 10 half squats'),
      exercises,
      cardio: t2(en, `${Math.max(10, cardioPerDay)} min de ${cardioKind} no fim do treino`, `${Math.max(10, cardioPerDay)} min of ${cardioKind} after training`),
      cooldown: t2(en, '3 min: alongue pernas, peito e costas, respirando fundo', '3 min: stretch legs, chest and back, breathing deeply')
    }
  })
  return { level, noImpact, week, days, cardioWeek, cardioKind, workouts, weekdays, steps: level === 1 ? 6000 : level === 2 ? 8000 : 10000 }
}

function t2(en: boolean, pt: string, e: string) { return en ? e : pt }

/** Próximo treino (hoje ou o próximo dia de treino). */
export function nextWorkout(plan: ReturnType<typeof buildPlan>, today = new Date()) {
  for (let i = 0; i < 7; i++) {
    const d = addDays(today, i)
    const w = plan.workouts.find(x => x.weekday === d.getDay())
    if (w) return { workout: w, inDays: i }
  }
  return null
}
