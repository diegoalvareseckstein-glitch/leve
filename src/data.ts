import type { SiteId } from './types'

export const MEDICATIONS = [
  { id: 'Mounjaro', sub: 'tirzepatida', freq: 'weekly' },
  { id: 'Ozempic', sub: 'semaglutida', freq: 'weekly' },
  { id: 'Wegovy', sub: 'semaglutida', freq: 'weekly' },
  { id: 'Saxenda', sub: 'liraglutida', freq: 'daily' },
  { id: 'Outro', sub: 'outra caneta', freq: 'weekly' }
] as const

export const SITES: { id: SiteId; label: string; short: string }[] = [
  { id: 'abd-e', label: 'Barriga, lado esquerdo', short: 'Barriga esq.' },
  { id: 'abd-d', label: 'Barriga, lado direito', short: 'Barriga dir.' },
  { id: 'coxa-e', label: 'Coxa esquerda', short: 'Coxa esq.' },
  { id: 'coxa-d', label: 'Coxa direita', short: 'Coxa dir.' },
  { id: 'braco-e', label: 'Braço esquerdo (parte de trás)', short: 'Braço esq.' },
  { id: 'braco-d', label: 'Braço direito (parte de trás)', short: 'Braço dir.' }
]

export const WEEKDAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']

export const SYMPTOMS = [
  { id: 'nausea', label: 'Enjoo', emoji: '🤢', tip: 'Coma porções menores, devagar, e pare ao sentir saciedade. Evite frituras e comidas muito gordurosas. Gengibre e alimentos frios costumam ajudar.' },
  { id: 'constipacao', label: 'Intestino preso', emoji: '🧱', tip: 'Beba mais água e inclua fibras aos poucos (frutas com casca, verduras, aveia, feijão). Caminhar depois das refeições ajuda.' },
  { id: 'diarreia', label: 'Diarreia', emoji: '💧', tip: 'Reponha líquidos com água e soro caseiro ou de farmácia. Prefira comidas leves, como arroz, banana e frango cozido.' },
  { id: 'refluxo', label: 'Azia ou refluxo', emoji: '🔥', tip: 'Evite deitar logo após comer, faça refeições menores e diminua café, álcool, refrigerante e comidas apimentadas.' },
  { id: 'vomito', label: 'Vômito', emoji: '🤮', tip: 'Beba líquidos em pequenos goles. Se não conseguir manter líquidos por mais de um dia, procure atendimento.' },
  { id: 'fadiga', label: 'Cansaço', emoji: '😴', tip: 'Pode ser falta de comida, de proteína ou de água. Confira suas metas do dia e tente não pular refeições.' },
  { id: 'cabeca', label: 'Dor de cabeça', emoji: '🤕', tip: 'Muitas vezes é desidratação ou comer pouco. Beba água e faça um lanche com proteína.' },
  { id: 'tontura', label: 'Tontura', emoji: '💫', tip: 'Sente ou deite, beba água e coma algo. Se você usa outro remédio para diabetes, meça a glicose se puder.' },
  { id: 'local', label: 'Reação no local', emoji: '📍', tip: 'Vermelhidão leve some sozinha. Troque sempre o local de aplicação; o app sugere o próximo.' },
  { id: 'fome', label: 'Sem apetite', emoji: '🍽️', tip: 'Mesmo sem fome, priorize proteína em pequenas porções ao longo do dia: ovo, iogurte, frango, whey.' }
] as const

export const RED_FLAGS = [
  'Dor forte na barriga que não passa, às vezes indo para as costas',
  'Vômitos que não param ou sinais de desidratação (boca seca, quase não urinar)',
  'Inchaço no rosto, lábios ou garganta, ou dificuldade para respirar',
  'Dor do lado direito da barriga com pele ou olhos amarelados',
  'Suor frio, tremor e confusão (sinais de glicose baixa)'
]

// Valores aproximados por porção (base: Tabela TACO e rótulos comuns)
export const PROTEIN_FOODS = [
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

export const FOOD_TIPS = [
  { title: 'Proteína primeiro', text: 'Comece cada refeição pela proteína. Com pouco apetite, é ela que protege seus músculos enquanto você perde peso.' },
  { title: 'Pratos menores', text: 'A caneta deixa você satisfeito mais rápido. Use pratos menores e pare na primeira sensação de saciedade.' },
  { title: 'Água ao longo do dia', text: 'Beba aos poucos, entre as refeições. Muita água junto da comida pode piorar o enjoo.' },
  { title: 'Força 2 a 3 vezes por semana', text: 'Exercício de força (academia, elástico ou peso do corpo) ajuda a manter o músculo. Comece leve.' },
  { title: 'Fibras sem pressa', text: 'Aumente verduras, frutas e grãos integrais aos poucos para ajudar o intestino.' }
]
