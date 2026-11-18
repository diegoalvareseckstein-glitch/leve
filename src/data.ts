import type { SiteId } from './types'
import { getLang } from './i18n'

const en = () => getLang() === 'en'

export const MEDICATIONS = () => en()
  ? [
      { id: 'Zepbound', sub: 'tirzepatide', freq: 'weekly' },
      { id: 'Mounjaro', sub: 'tirzepatide', freq: 'weekly' },
      { id: 'Wegovy', sub: 'semaglutide', freq: 'weekly' },
      { id: 'Ozempic', sub: 'semaglutide', freq: 'weekly' },
      { id: 'Compounded', sub: 'semaglutide or tirzepatide', freq: 'weekly' },
      { id: 'Other', sub: 'another pen', freq: 'weekly' }
    ] as const
  : [
      { id: 'Mounjaro', sub: 'tirzepatida', freq: 'weekly' },
      { id: 'Ozempic', sub: 'semaglutida', freq: 'weekly' },
      { id: 'Wegovy', sub: 'semaglutida', freq: 'weekly' },
      { id: 'Saxenda', sub: 'liraglutida', freq: 'daily' },
      { id: 'Outro', sub: 'outra caneta', freq: 'weekly' }
    ] as const

const SITE_IDS: SiteId[] = ['abd-e', 'abd-d', 'coxa-e', 'coxa-d', 'braco-e', 'braco-d']
const SITE_PT = [['Barriga, lado esquerdo', 'Barriga esq.'], ['Barriga, lado direito', 'Barriga dir.'], ['Coxa esquerda', 'Coxa esq.'], ['Coxa direita', 'Coxa dir.'], ['Braço esquerdo (parte de trás)', 'Braço esq.'], ['Braço direito (parte de trás)', 'Braço dir.']]
const SITE_EN = [['Belly, left side', 'Belly L'], ['Belly, right side', 'Belly R'], ['Left thigh', 'Thigh L'], ['Right thigh', 'Thigh R'], ['Left upper arm (back)', 'Arm L'], ['Right upper arm (back)', 'Arm R']]
export const SITES = () => SITE_IDS.map((id, i) => ({ id, label: (en() ? SITE_EN : SITE_PT)[i][0], short: (en() ? SITE_EN : SITE_PT)[i][1] }))

export const WEEKDAYS = () => en()
  ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  : ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']

const SYM = [
  { id: 'nausea', emoji: '🤢', pt: ['Enjoo', 'Coma porções menores, devagar, e pare ao sentir saciedade. Evite frituras e comidas muito gordurosas. Gengibre e alimentos frios costumam ajudar.'], en: ['Nausea', 'Eat smaller portions slowly and stop when you feel full. Avoid fried and greasy food. Ginger and cold foods often help.'] },
  { id: 'constipacao', emoji: '🧱', pt: ['Intestino preso', 'Beba mais água e inclua fibras aos poucos (frutas com casca, verduras, aveia, feijão). Caminhar depois das refeições ajuda.'], en: ['Constipation', 'Drink more water and add fiber gradually (fruit with skin, vegetables, oats, beans). A walk after meals helps.'] },
  { id: 'diarreia', emoji: '💧', pt: ['Diarreia', 'Reponha líquidos com água e soro caseiro ou de farmácia. Prefira comidas leves, como arroz, banana e frango cozido.'], en: ['Diarrhea', 'Replace fluids with water and an electrolyte drink. Stick to bland foods like rice, bananas, toast and plain chicken.'] },
  { id: 'refluxo', emoji: '🔥', pt: ['Azia ou refluxo', 'Evite deitar logo após comer, faça refeições menores e diminua café, álcool, refrigerante e comidas apimentadas.'], en: ['Heartburn', 'Avoid lying down right after eating, eat smaller meals and cut back on coffee, alcohol, soda and spicy food.'] },
  { id: 'vomito', emoji: '🤮', pt: ['Vômito', 'Beba líquidos em pequenos goles. Se não conseguir manter líquidos por mais de um dia, procure atendimento.'], en: ['Vomiting', 'Sip fluids in small amounts. If you cannot keep fluids down for more than a day, get medical care.'] },
  { id: 'fadiga', emoji: '😴', pt: ['Cansaço', 'Pode ser falta de comida, de proteína ou de água. Confira suas metas do dia e tente não pular refeições.'], en: ['Fatigue', 'It may be too little food, protein or water. Check your goals for today and try not to skip meals.'] },
  { id: 'cabeca', emoji: '🤕', pt: ['Dor de cabeça', 'Muitas vezes é desidratação ou comer pouco. Beba água e faça um lanche com proteína.'], en: ['Headache', 'Often caused by dehydration or eating too little. Drink water and have a protein snack.'] },
  { id: 'tontura', emoji: '💫', pt: ['Tontura', 'Sente ou deite, beba água e coma algo. Se você usa outro remédio para diabetes, meça a glicose se puder.'], en: ['Dizziness', 'Sit or lie down, drink water and eat something. If you take other diabetes medication, check your blood sugar if you can.'] },
  { id: 'local', emoji: '📍', pt: ['Reação no local', 'Vermelhidão leve some sozinha. Troque sempre o local de aplicação; o app sugere o próximo.'], en: ['Injection site', 'Mild redness goes away on its own. Always rotate injection sites; the app suggests the next one.'] },
  { id: 'fome', emoji: '🍽️', pt: ['Sem apetite', 'Mesmo sem fome, priorize proteína em pequenas porções ao longo do dia: ovo, iogurte, frango, whey.'], en: ['No appetite', 'Even when not hungry, prioritize protein in small portions through the day: eggs, Greek yogurt, chicken, a protein shake.'] }
]
export const SYMPTOMS = () => SYM.map(s => ({ id: s.id, emoji: s.emoji, label: (en() ? s.en : s.pt)[0], tip: (en() ? s.en : s.pt)[1] }))

export const RED_FLAGS = () => en()
  ? [
      'Severe stomach pain that does not go away, sometimes spreading to your back',
      'Vomiting that will not stop, or signs of dehydration (dry mouth, barely urinating)',
      'Swelling of the face, lips or throat, or trouble breathing',
      'Pain on the right side of your belly with yellow skin or eyes',
      'Cold sweat, shaking and confusion (signs of low blood sugar)'
    ]
  : [
      'Dor forte na barriga que não passa, às vezes indo para as costas',
      'Vômitos que não param ou sinais de desidratação (boca seca, quase não urinar)',
      'Inchaço no rosto, lábios ou garganta, ou dificuldade para respirar',
      'Dor do lado direito da barriga com pele ou olhos amarelados',
      'Suor frio, tremor e confusão (sinais de glicose baixa)'
    ]

export const EMERGENCY = () => (en() ? { label: '911', tel: '911' } : { label: '192 (SAMU)', tel: '192' })

// Valores aproximados por porção (PT: Tabela TACO; EN: USDA FoodData Central)
export const PROTEIN_FOODS = () => en()
  ? [
      { name: 'Egg', portion: '1 large', protein: 6, emoji: '🥚' },
      { name: 'Chicken breast', portion: '4 oz cooked', protein: 35, emoji: '🍗' },
      { name: 'Lean beef', portion: '4 oz cooked', protein: 30, emoji: '🥩' },
      { name: 'Salmon', portion: '4 oz cooked', protein: 25, emoji: '🐟' },
      { name: 'Tuna', portion: '1 can (3 oz)', protein: 20, emoji: '🥫' },
      { name: 'Greek yogurt', portion: '1 cup', protein: 20, emoji: '🥛' },
      { name: 'Protein shake', portion: '1 bottle', protein: 30, emoji: '🥤' },
      { name: 'Cottage cheese', portion: '½ cup', protein: 12, emoji: '🧀' },
      { name: 'Milk', portion: '1 cup', protein: 8, emoji: '🥛' },
      { name: 'String cheese', portion: '1 stick', protein: 7, emoji: '🧀' },
      { name: 'Turkey slices', portion: '2 oz', protein: 10, emoji: '🥪' },
      { name: 'Black beans', portion: '½ cup', protein: 7, emoji: '🫘' }
    ]
  : [
      { name: 'Ovo', portion: '1 unidade', protein: 6, emoji: '🥚' },
      { name: 'Frango grelhado', portion: '1 filé (100 g)', protein: 31, emoji: '🍗' },
      { name: 'Carne magra', portion: '1 bife (100 g)', protein: 32, emoji: '🥩' },
      { name: 'Peixe (tilápia)', portion: '1 filé (100 g)', protein: 26, emoji: '🐟' },
      { name: 'Atum em lata', portion: '½ lata (60 g)', protein: 15, emoji: '🥫' },
      { name: 'Iogurte proteico', portion: '1 pote', protein: 15, emoji: '🥛' },
      { name: 'Whey protein', portion: '1 dose (30 g)', protein: 24, emoji: '🥤' },
      { name: 'Leite', portion: '1 copo (200 ml)', protein: 6, emoji: '🥛' },
      { name: 'Queijo minas', portion: '1 fatia (30 g)', protein: 5, emoji: '🧀' },
      { name: 'Feijão', portion: '1 concha (100 g)', protein: 5, emoji: '🫘' },
      { name: 'Lentilha', portion: '1 concha (100 g)', protein: 6, emoji: '🍲' },
      { name: 'Tofu', portion: '100 g', protein: 8, emoji: '⬜' }
    ]

export const FOOD_TIPS = () => en()
  ? [
      { title: 'Protein first', text: 'Start every meal with protein. When your appetite is low, protein is what protects your muscle while you lose weight.' },
      { title: 'Smaller plates', text: 'The medication makes you full faster. Use a smaller plate and stop at the first sign of fullness.' },
      { title: 'Sip water all day', text: 'Drink between meals, a little at a time. Lots of water with food can make nausea worse.' },
      { title: 'Strength training 2–3x a week', text: 'Strength work (gym, bands or bodyweight) helps you keep muscle. Start light.' },
      { title: 'Add fiber slowly', text: 'Increase vegetables, fruit and whole grains gradually to keep things moving.' }
    ]
  : [
      { title: 'Proteína primeiro', text: 'Comece cada refeição pela proteína. Com pouco apetite, é ela que protege seus músculos enquanto você perde peso.' },
      { title: 'Pratos menores', text: 'A caneta deixa você satisfeito mais rápido. Use pratos menores e pare na primeira sensação de saciedade.' },
      { title: 'Água ao longo do dia', text: 'Beba aos poucos, entre as refeições. Muita água junto da comida pode piorar o enjoo.' },
      { title: 'Força 2 a 3 vezes por semana', text: 'Exercício de força (academia, elástico ou peso do corpo) ajuda a manter o músculo. Comece leve.' },
      { title: 'Fibras sem pressa', text: 'Aumente verduras, frutas e grãos integrais aos poucos para ajudar o intestino.' }
    ]

export const PRICES = () => en()
  ? { price: '$49.90', note: 'One-time payment · 12 months of Premium', perMonth: 'about $4.16 a month' }
  : { price: 'R$ 49,90', note: 'Pagamento único · 12 meses de Premium', perMonth: 'menos de R$ 4,16 por mês' }
