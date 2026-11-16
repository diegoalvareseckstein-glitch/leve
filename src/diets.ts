import { getLang } from './i18n'

// Tabela de alimentos por 100 g: [kcal, proteína, carboidrato, gordura]. Fontes: Tabela TACO (Unicamp) e USDA FoodData Central.
type Food = { pt: string; en: string; k: number; p: number; c: number; f: number; unit?: { g: number; pt: string; en: string }; fixed?: boolean }
export const FOODS: Record<string, Food> = {
  ovo: { pt: 'Ovo', en: 'Egg', k: 143, p: 13, c: 1, f: 10, unit: { g: 50, pt: 'ovo', en: 'egg' } },
  frango: { pt: 'Peito de frango grelhado', en: 'Grilled chicken breast', k: 159, p: 32, c: 0, f: 3 },
  carne: { pt: 'Carne magra (patinho)', en: 'Lean beef', k: 219, p: 36, c: 0, f: 7 },
  peixe: { pt: 'Peixe branco (tilápia)', en: 'White fish (tilapia/cod)', k: 128, p: 26, c: 0, f: 3 },
  salmao: { pt: 'Salmão', en: 'Salmon', k: 206, p: 22, c: 0, f: 13 },
  atum: { pt: 'Atum em água', en: 'Tuna in water', k: 116, p: 26, c: 0, f: 1 },
  peru: { pt: 'Peito de peru fatiado', en: 'Sliced turkey breast', k: 104, p: 17, c: 3, f: 2 },
  iogurte: { pt: 'Iogurte natural/grego zero', en: 'Nonfat Greek yogurt', k: 59, p: 10, c: 4, f: 0.4 },
  cottage: { pt: 'Queijo cottage', en: 'Cottage cheese', k: 98, p: 11, c: 3, f: 4 },
  queijo: { pt: 'Queijo branco (minas)', en: 'Part-skim mozzarella', k: 240, p: 18, c: 3, f: 17 },
  ricota: { pt: 'Ricota', en: 'Ricotta', k: 140, p: 12, c: 4, f: 8 },
  leite: { pt: 'Leite desnatado', en: 'Skim milk', k: 35, p: 3.4, c: 5, f: 0.1 },
  whey: { pt: 'Whey protein', en: 'Protein powder', k: 400, p: 80, c: 8, f: 6 },
  tofu: { pt: 'Tofu', en: 'Tofu', k: 120, p: 13, c: 2, f: 7 },
  lentilha: { pt: 'Lentilha cozida', en: 'Cooked lentils', k: 93, p: 6.3, c: 16, f: 0.5 },
  feijao: { pt: 'Feijão cozido', en: 'Cooked beans', k: 76, p: 4.8, c: 13.6, f: 0.5 },
  grao: { pt: 'Grão-de-bico cozido', en: 'Cooked chickpeas', k: 164, p: 9, c: 27, f: 2.6 },
  humus: { pt: 'Homus', en: 'Hummus', k: 177, p: 8, c: 14, f: 10 },
  arroz: { pt: 'Arroz branco cozido', en: 'Cooked white rice', k: 128, p: 2.5, c: 28, f: 0.2 },
  arrozint: { pt: 'Arroz integral cozido', en: 'Cooked brown rice', k: 124, p: 2.6, c: 26, f: 1 },
  macarrao: { pt: 'Macarrão integral cozido', en: 'Cooked whole-wheat pasta', k: 124, p: 5, c: 25, f: 1 },
  batatadoce: { pt: 'Batata-doce cozida', en: 'Sweet potato', k: 77, p: 0.6, c: 18, f: 0.1 },
  batata: { pt: 'Batata cozida', en: 'Boiled potato', k: 52, p: 1.2, c: 12, f: 0 },
  aveia: { pt: 'Aveia em flocos', en: 'Rolled oats', k: 394, p: 14, c: 67, f: 8.5 },
  pao: { pt: 'Pão integral', en: 'Whole-wheat bread', k: 253, p: 9.4, c: 49, f: 3.7, unit: { g: 25, pt: 'fatia', en: 'slice' } },
  wrap: { pt: 'Wrap integral', en: 'Whole-wheat tortilla', k: 300, p: 9, c: 50, f: 7, unit: { g: 40, pt: 'unidade', en: 'tortilla' } },
  bolacha: { pt: 'Bolacha água e sal', en: 'Saltine crackers', k: 430, p: 10, c: 70, f: 12 },
  banana: { pt: 'Banana', en: 'Banana', k: 98, p: 1.3, c: 26, f: 0.1 },
  maca: { pt: 'Maçã', en: 'Apple', k: 56, p: 0.3, c: 15, f: 0 },
  morango: { pt: 'Morangos ou frutas vermelhas', en: 'Strawberries or berries', k: 30, p: 0.9, c: 7, f: 0.3 },
  laranja: { pt: 'Laranja', en: 'Orange', k: 47, p: 0.9, c: 12, f: 0.1 },
  salada: { pt: 'Salada de folhas', en: 'Leafy green salad', k: 15, p: 1.3, c: 2, f: 0.2 },
  legumes: { pt: 'Legumes cozidos (brócolis, cenoura, abobrinha)', en: 'Cooked vegetables (broccoli, carrots, zucchini)', k: 30, p: 2, c: 6, f: 0.3 },
  tomate: { pt: 'Tomate', en: 'Tomato', k: 15, p: 1, c: 3, f: 0.2 },
  azeite: { pt: 'Azeite de oliva', en: 'Olive oil', k: 884, p: 0, c: 0, f: 100 },
  abacate: { pt: 'Abacate', en: 'Avocado', k: 160, p: 2, c: 9, f: 15 },
  castanhas: { pt: 'Castanhas ou nozes', en: 'Nuts (almonds, walnuts)', k: 600, p: 18, c: 20, f: 52 },
  amendoim: { pt: 'Pasta de amendoim', en: 'Peanut butter', k: 590, p: 25, c: 20, f: 50 },
  sopa: { pt: 'Sopa de legumes', en: 'Vegetable soup', k: 45, p: 2, c: 7, f: 1 },
  gelatina: { pt: 'Gelatina zero', en: 'Sugar-free gelatin', k: 10, p: 1.5, c: 0, f: 0, fixed: true },
  cha: { pt: 'Chá de gengibre', en: 'Ginger tea', k: 2, p: 0, c: 0, f: 0, fixed: true },
  coco: { pt: 'Água de coco', en: 'Coconut water', k: 22, p: 0, c: 5, f: 0, fixed: true }
}

type Item = [string, number] // [alimento, gramas]
type Meal = { id: 'cafe' | 'lanche1' | 'almoco' | 'lanche2' | 'jantar'; options: Item[][] }
export interface Diet { id: string; emoji: string; pt: [string, string, string]; en: [string, string, string]; meals: Meal[] }

export const MEAL_NAMES: Record<Meal['id'], [string, string]> = {
  cafe: ['Café da manhã', 'Breakfast'], lanche1: ['Lanche da manhã', 'Morning snack'], almoco: ['Almoço', 'Lunch'],
  lanche2: ['Lanche da tarde', 'Afternoon snack'], jantar: ['Jantar', 'Dinner']
}

// Cada dieta: [nome, para quem é, como funciona]. Cardápios-base de ~1.500 kcal, ajustados para cada pessoa.
export const DIETS: Diet[] = [
  {
    id: 'proteina', emoji: '💪',
    pt: ['Alta proteína', 'A mais indicada para quem usa caneta', 'Proteína em todas as refeições para proteger o músculo enquanto você emagrece. Carboidrato moderado e muitas verduras.'],
    en: ['High protein', 'The best fit for GLP-1 users', 'Protein at every meal to protect muscle while you lose weight. Moderate carbs and lots of vegetables.'],
    meals: [
      { id: 'cafe', options: [[['ovo', 100], ['pao', 50], ['queijo', 30], ['morango', 100]], [['iogurte', 170], ['aveia', 30], ['banana', 60], ['whey', 15]]] },
      { id: 'lanche1', options: [[['cottage', 100], ['maca', 130]], [['whey', 30], ['leite', 200]]] },
      { id: 'almoco', options: [[['frango', 130], ['arrozint', 100], ['feijao', 80], ['legumes', 120], ['salada', 50], ['azeite', 5]], [['carne', 120], ['batatadoce', 120], ['legumes', 120], ['salada', 50], ['azeite', 5]]] },
      { id: 'lanche2', options: [[['iogurte', 170], ['castanhas', 15]], [['peru', 50], ['wrap', 40], ['tomate', 50]]] },
      { id: 'jantar', options: [[['peixe', 150], ['batata', 100], ['legumes', 150], ['azeite', 5]], [['ovo', 150], ['queijo', 30], ['salada', 80], ['pao', 25]]] }
    ]
  },
  {
    id: 'mediterranea', emoji: '🫒',
    pt: ['Mediterrânea', 'Para o coração e para o longo prazo', 'Peixes, azeite, grãos, frutas e castanhas. É a dieta com mais estudos sobre saúde do coração.'],
    en: ['Mediterranean', 'Heart-healthy and sustainable', 'Fish, olive oil, legumes, fruit and nuts. The most studied eating pattern for heart health.'],
    meals: [
      { id: 'cafe', options: [[['iogurte', 170], ['morango', 100], ['castanhas', 15], ['aveia', 20]], [['pao', 50], ['abacate', 50], ['ovo', 100], ['tomate', 50]]] },
      { id: 'lanche1', options: [[['maca', 130], ['castanhas', 15]], [['humus', 50], ['legumes', 100]]] },
      { id: 'almoco', options: [[['salmao', 120], ['grao', 80], ['salada', 80], ['tomate', 60], ['azeite', 8]], [['frango', 120], ['macarrao', 100], ['legumes', 120], ['azeite', 8]]] },
      { id: 'lanche2', options: [[['iogurte', 170], ['morango', 80]], [['queijo', 30], ['pao', 25], ['tomate', 50]]] },
      { id: 'jantar', options: [[['peixe', 150], ['arrozint', 60], ['legumes', 150], ['azeite', 8]], [['lentilha', 150], ['ovo', 50], ['legumes', 120], ['salada', 60], ['azeite', 5]]] }
    ]
  },
  {
    id: 'lowcarb', emoji: '🥑',
    pt: ['Low carb moderada', 'Para quem sente mais fome de doce e pão', 'Menos pão, arroz e açúcar, mais proteína, verduras e gorduras boas. Sem cortar tudo.'],
    en: ['Moderate low-carb', 'For those who crave bread and sweets', 'Fewer refined carbs and sugar, more protein, vegetables and healthy fats. No extreme cuts.'],
    meals: [
      { id: 'cafe', options: [[['ovo', 150], ['queijo', 30], ['abacate', 50]], [['iogurte', 170], ['morango', 60], ['castanhas', 15]]] },
      { id: 'lanche1', options: [[['queijo', 40], ['tomate', 80]], [['whey', 30], ['leite', 200]]] },
      { id: 'almoco', options: [[['carne', 150], ['legumes', 200], ['salada', 80], ['azeite', 8]], [['frango', 150], ['feijao', 50], ['legumes', 150], ['salada', 80], ['azeite', 8]]] },
      { id: 'lanche2', options: [[['cottage', 120], ['morango', 80]], [['atum', 80], ['salada', 80], ['azeite', 5]]] },
      { id: 'jantar', options: [[['salmao', 140], ['legumes', 200]], [['ovo', 150], ['queijo', 30], ['legumes', 120]]] }
    ]
  },
  {
    id: 'vegetariana', emoji: '🥦',
    pt: ['Vegetariana', 'Sem carne, com ovos e laticínios', 'Proteína de ovos, laticínios, tofu, feijões e lentilha, com atenção para bater a meta todo dia.'],
    en: ['Vegetarian', 'No meat, includes eggs and dairy', 'Protein from eggs, dairy, tofu, beans and lentils, with care to hit your goal every day.'],
    meals: [
      { id: 'cafe', options: [[['iogurte', 170], ['aveia', 30], ['banana', 60]], [['ovo', 100], ['pao', 50], ['queijo', 30]]] },
      { id: 'lanche1', options: [[['cottage', 100], ['maca', 130]], [['whey', 30], ['leite', 200]]] },
      { id: 'almoco', options: [[['tofu', 150], ['arrozint', 100], ['feijao', 100], ['legumes', 120], ['azeite', 5]], [['lentilha', 150], ['grao', 60], ['arrozint', 80], ['salada', 80], ['azeite', 5]]] },
      { id: 'lanche2', options: [[['humus', 50], ['wrap', 40], ['legumes', 60]], [['iogurte', 170], ['castanhas', 15]]] },
      { id: 'jantar', options: [[['ovo', 150], ['queijo', 30], ['legumes', 150]], [['tofu', 120], ['macarrao', 100], ['legumes', 120]]] }
    ]
  },
  {
    id: 'pratica', emoji: '🍚',
    pt: ['Prática e econômica', 'Comida do dia a dia, barata e fácil', 'Arroz, feijão, ovo, frango e frutas da estação. Cabe no bolso e na rotina de quem cozinha pouco.'],
    en: ['Simple & budget-friendly', 'Everyday food, cheap and easy', 'Rice, beans, eggs, chicken and seasonal fruit. Easy on your wallet and your schedule.'],
    meals: [
      { id: 'cafe', options: [[['ovo', 100], ['pao', 50], ['banana', 60]], [['aveia', 40], ['leite', 200], ['banana', 60]]] },
      { id: 'lanche1', options: [[['banana', 90], ['amendoim', 15]], [['iogurte', 170]]] },
      { id: 'almoco', options: [[['frango', 130], ['arroz', 120], ['feijao', 100], ['salada', 80], ['azeite', 5]], [['ovo', 150], ['arroz', 120], ['feijao', 100], ['legumes', 100]]] },
      { id: 'lanche2', options: [[['leite', 200], ['aveia', 20]], [['pao', 50], ['ovo', 50]]] },
      { id: 'jantar', options: [[['carne', 120], ['batata', 150], ['legumes', 100]], [['sopa', 400], ['frango', 60]]] }
    ]
  },
  {
    id: 'enjoo', emoji: '🍵',
    pt: ['Leve para dias de enjoo', 'Para os 2 ou 3 dias depois da dose', 'Porções pequenas, comidas frias ou mornas, pouca gordura e muitos líquidos. Mantém a proteína mesmo sem fome.'],
    en: ['Gentle (nausea days)', 'For the 2–3 days after your shot', 'Small portions, cool or mild foods, low fat and plenty of fluids. Keeps protein up even with no appetite.'],
    meals: [
      { id: 'cafe', options: [[['bolacha', 30], ['cha', 200], ['iogurte', 100]], [['banana', 90], ['whey', 20], ['leite', 200]]] },
      { id: 'lanche1', options: [[['gelatina', 120], ['cottage', 80]], [['maca', 130], ['bolacha', 20]]] },
      { id: 'almoco', options: [[['sopa', 350], ['frango', 80]], [['arroz', 80], ['frango', 90], ['legumes', 80]]] },
      { id: 'lanche2', options: [[['iogurte', 170], ['coco', 200]], [['whey', 20], ['morango', 100], ['leite', 150]]] },
      { id: 'jantar', options: [[['peixe', 120], ['batata', 120], ['legumes', 80]], [['ovo', 100], ['bolacha', 20], ['cha', 200]]] }
    ]
  }
]

export const dietName = (d: Diet) => (getLang() === 'en' ? d.en : d.pt)
export const foodName = (id: string) => (getLang() === 'en' ? FOODS[id].en : FOODS[id].pt)

export function totals(items: Item[]) {
  return items.reduce((acc, [id, g]) => {
    const f = FOODS[id]
    return { k: acc.k + f.k * g / 100, p: acc.p + f.p * g / 100, c: acc.c + f.c * g / 100, f: acc.f + f.f * g / 100 }
  }, { k: 0, p: 0, c: 0, f: 0 })
}

/** Calorias médias do cardápio-base (média das opções de cada refeição). */
export function baseKcal(d: Diet) {
  return d.meals.reduce((sum, m) => sum + m.options.reduce((s, o) => s + totals(o).k, 0) / m.options.length, 0)
}

/** Ajusta as porções para a meta de calorias da pessoa (sem mexer em chás, gelatina e água de coco). */
export function scaleOption(items: Item[], factor: number): Item[] {
  return items.map(([id, g]) => {
    const f = FOODS[id]
    if (f.fixed) return [id, g]
    if (id === 'azeite') return [id, Math.max(5, Math.round(g * factor))]
    const unitG = f.unit?.g
    if (unitG) return [id, Math.max(unitG, Math.round(g * factor / unitG) * unitG)]
    return [id, Math.max(10, Math.round(g * factor / 10) * 10)]
  })
}

export function dietFactor(d: Diet, targetKcal: number) {
  return Math.min(1.7, Math.max(0.75, targetKcal / baseKcal(d)))
}

/** Texto da porção: "2 ovos (100 g)", "1 fatia (25 g)" ou "120 g". */
export function portion(id: string, g: number) {
  const f = FOODS[id], en = getLang() === 'en'
  if (f.unit) {
    const n = Math.round(g / f.unit.g)
    const label = en ? f.unit.en : f.unit.pt
    return `${n} ${label}${n > 1 ? 's' : ''} (${g} g)`
  }
  if (['leite', 'cha', 'coco', 'sopa'].includes(id)) return en ? `${Math.round(g / 29.6)} fl oz` : `${g} ml`
  if (id === 'azeite') return en ? `${Math.max(1, Math.round(g / 5))} tsp` : `${Math.max(1, Math.round(g / 5))} col. chá`
  return en ? `${g} g (${Math.round(g / 28.35 * 10) / 10} oz)` : `${g} g`
}
