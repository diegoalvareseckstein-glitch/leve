# Leve · app companheiro para quem usa canetas emagrecedoras

**Leve** (nome provisório) ajuda quem usa Mounjaro, Ozempic, Wegovy ou Saxenda a seguir o tratamento no dia a dia: lembrete de dose, rodízio do local de aplicação, peso e medidas, diário de sintomas, meta de proteína e água, e relatório para o médico.

O projeto tem duas partes:

| Parte | Pasta | Para que serve |
|---|---|---|
| **App (PWA)** | `src/` | O produto. Abre no navegador do celular e pode ser instalado na tela inicial, como um app. |
| **Landing page** | `landing/` | Página de validação com lista de espera, pesquisa de preço e teste de "porta falsa" do Premium. |

---

## 1. Rodar no seu computador

Pré-requisito: [Node.js 20 ou mais novo](https://nodejs.org).

```bash
npm install        # instala as dependências (só na primeira vez)
npm run dev        # abre o app em http://localhost:5173
```

Para ver no celular, rode `npm run dev -- --host` e abra no celular o endereço "Network" que aparecer (o celular precisa estar no mesmo Wi-Fi).

Para ver a landing, abra `landing/index.html` direto no navegador.

Dica: na primeira tela do app, toque em **"Só quero ver como funciona"** para carregar 10 semanas de dados de exemplo.

## 2. Publicar na internet (grátis)

O comando abaixo junta tudo numa pasta `site/`: a landing na raiz e o app em `/app`.

```bash
npm run build:site
```

**Opção mais fácil, sem conta de GitHub (Netlify Drop):**
1. Rode `npm run build:site`.
2. Entre em https://app.netlify.com/drop e arraste a pasta `site/`.
3. Pronto: você recebe um link (ex.: `leve-xyz.netlify.app`). A landing fica em `/` e o app em `/app/`.

**Opção com deploy automático (Vercel ou Netlify + GitHub):**
1. Crie um repositório no GitHub e envie esta pasta (`git init`, `git add .`, `git commit -m "Leve"`, `git push`).
2. Importe o repositório na [Vercel](https://vercel.com/new) ou na [Netlify](https://app.netlify.com/start). As configurações já estão em `vercel.json` e `netlify.toml`.
3. Cada `git push` publica uma nova versão.

**Domínio:** compre um `.com.br` no [Registro.br](https://registro.br) (cerca de R$ 40/ano) e aponte para a Vercel/Netlify.

## 3. Validar a ideia antes de investir mais

A landing já faz três medições:

1. **Lista de espera:** nome, contato, qual caneta usa.
2. **Disposição a pagar:** "Quanto você pagaria por mês?" (grátis / até R$ 10 / R$ 10–20 / mais de R$ 20).
3. **Porta falsa do preço:** registra se a pessoa clicou em "Quero o Premium" ou "Quero o grátis" antes de se cadastrar (campo `plano_clicado`).

**Para receber os cadastros**, crie um formulário grátis no [Formspree](https://formspree.io) e cole o endereço em `landing/index.html`:

```js
const FORM_ENDPOINT = 'https://formspree.io/f/SEU_CODIGO';
```

Enquanto estiver vazio, os cadastros ficam só no navegador (bom para testar).

**Para medir visitas e anúncios**, cole o código do Google Analytics 4 e/ou do Meta Pixel no `<head>` da landing. Os cliques já disparam eventos (`hero_cta`, `plan_premium`, `cadastro` etc.) se `gtag` ou `fbq` existirem.

**Meta sugerida de validação (2 a 4 semanas):**
- Tráfego: R$ 300 a R$ 500 em anúncios no Instagram/TikTok para "Mounjaro", "Ozempic", "canetas emagrecedoras", mais posts em grupos e comunidades.
- Sinal bom: **taxa de cadastro acima de 15%** dos visitantes e **pelo menos 30% dizendo que pagariam** algo.
- Fale com 10 pessoas da lista por WhatsApp antes de construir o próximo recurso.

## 4. O que já está pronto no app

**Português e inglês (EUA):** o idioma muda no perfil ou pela landing. Em inglês o app usa libras, polegadas, onças, preços em dólar, 911 e comidas americanas. Landing em inglês: `/en/`.

**Módulos Premium:**
- **Treino personalizado** (`src/workouts.ts`): nível por idade, IMC e atividade; casa ou academia; 2 a 5 dias; baixo impacto e troca de exercícios para joelho, coluna e ombro; progressão semanal e cardio até 150 min/semana.
- **6 dietas** (`src/diets.ts`): alta proteína, mediterrânea, low carb moderada, vegetariana, prática e econômica, leve para dias de enjoo. Calorias por Mifflin-St Jeor com déficit seguro e porções ajustadas para cada pessoa.
- **Análise corporal** (`src/fitness.ts`): % de gordura (fórmula da Marinha dos EUA ou IMC), massa magra, cintura/altura, cintura/quadril e faixa de peso saudável.
- **Alarmes** (`src/screens/Reminders.tsx`): água, refeições, sono e treino, salvos no calendário do celular e avisos do app.


- **Cadastro guiado** (nome, caneta, dose receitada, dia e horário, peso, meta) com aceite de que o uso é com acompanhamento médico.
- **Hoje:** status da dose (no dia, atrasada, faltam X dias), próximo local sugerido, kg perdidos, % de adesão, metas de proteína e água.
- **Doses:** registro com mapa do corpo e rodízio automático (barriga, coxas, braços), histórico, adesão, **lembrete no calendário do celular** (arquivo .ics recorrente que funciona com o app fechado) e aviso do navegador.
- **Progresso:** gráfico de peso com linha da meta, IMC, marcos de 5%, 10% e 15%, cintura e quadril.
- **Sintomas:** registro em toques (leve, médio, forte), dicas para cada sintoma, sinais de alerta com atalho para o SAMU (192).
- **Comida:** meta de proteína (1,2 g/kg do peso-meta, ajustável), atalhos com comida brasileira, sequência de dias batendo a meta, dicas.
- **Premium:** ritmo semanal e previsão da meta, padrão de sintomas por dia após a dose, relatório para o médico (salvar em PDF ou imprimir).
- **Acessibilidade:** letras maiores, alto contraste, botões grandes, leitores de tela (rótulos ARIA), respeita "reduzir movimento".
- **LGPD:** dados guardados só no aparelho, exportar, importar e apagar tudo.
- **Funciona offline** e pode ser instalado (PWA).

## 5. Preço

- **Grátis para sempre:** lembrete de dose, rodízio, estoque da caneta, plano de doses, peso, sintomas, proteína e água.
- **Premium (Brasil):** R$ 29,90/mês ou R$ 149,90/ano (12x de R$ 12,49), com 7 dias grátis.
- **Premium (EUA):** US$ 12,99/mês ou US$ 69,99/ano.
- O Premium inclui: treino personalizado, 6 dietas com cardápio calculado, análise corporal, alarmes de água, refeições, sono e treino, relatório para o médico e análises de ritmo e sintomas.

## 6. Próximos passos técnicos (quando a validação der certo)

1. **Pagamento de verdade.** Hoje o botão "Testar 7 dias grátis" libera o Premium em modo demonstração (`src/screens/Plans.tsx`, função `startTrial`). Para web, use **Mercado Pago Assinaturas** (aceita Pix e cartão) ou **Stripe Billing**. Para lojas de apps, use **RevenueCat**.
2. **Conta e backup na nuvem.** Para a pessoa trocar de celular sem perder dados: **Supabase** (login por e-mail/Google e banco Postgres). Antes de guardar dados de saúde em servidor, escreva a Política de Privacidade e o termo de consentimento (LGPD, dado sensível).
3. **Notificações push de verdade** (com o app fechado, sem calendário): Web Push via Supabase Edge Functions ou OneSignal.
4. **Publicar na Play Store e App Store:** empacote o mesmo código com **Capacitor** (`npx cap add android` / `ios`). Na Play Store também dá para usar TWA (Bubblewrap).
5. **Recursos com IA** (diferencial do relatório de pesquisa): foto do prato com estimativa de proteína, e um assistente que responde dúvidas comuns com fontes.

## 7. Cuidados legais e médicos

- O app **não indica, prescreve nem altera doses**. A dose é digitada pela própria pessoa, conforme a receita.
- Textos de sintomas e alimentação são orientações gerais e apontam para o médico em sinais de alerta.
- Ozempic, Wegovy, Saxenda e Mounjaro são marcas de seus fabricantes. Não use os logotipos deles, e não diga ser "oficial" ou "parceiro".
- Antes de anunciar, confira as regras de anúncios de saúde da Meta e do Google (eles costumam barrar anúncios que citam medicamentos de prescrição). Foque o anúncio no problema ("organize seu tratamento") em vez do nome do remédio.
- O nome "Leve" é provisório: antes de investir em marca, pesquise no [INPI](https://busca.inpi.gov.br) e nas lojas de apps.

## Estrutura do código

```
src/
  App.tsx            navegação por abas, folhas de registro e avisos
  store.ts           dados salvos no aparelho (localStorage)
  types.ts           tipos dos dados
  data.ts            canetas, locais de aplicação, sintomas, alimentos, dicas
  utils.ts           cálculo de próxima dose, adesão, rodízio, IMC, calendário (.ics)
  demo.ts            dados de exemplo
  screens/           Hoje, Doses, Progresso, Sintomas, Comida, Planos, Perfil, Relatório, Cadastro
  components/        gráfico de peso, mapa do corpo, formulários, componentes visuais
landing/index.html   landing page de validação (um arquivo só)
scripts/build-site.mjs  junta landing + app na pasta site/
```

Stack: React 19, TypeScript, Vite e vite-plugin-pwa. Sem backend e sem custo mensal para rodar.
