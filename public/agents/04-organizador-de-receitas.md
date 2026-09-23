# AGENTS.md — Organizador de Receitas

Este arquivo dá contexto ao agente de IA que vai construir este protótipo. Leia tudo antes de gerar qualquer tela e siga estas instruções em todas as respostas.

## Visão geral do projeto

Um app para salvar, buscar e organizar receitas favoritas. Cada receita tem lista de ingredientes, modo de preparo passo a passo, foto do prato e tempo de preparo, e dá para filtrar por tipo de refeição, restrição alimentar e tempo disponível.

Este é um **protótipo navegável** criado na oficina "Do Prompt ao Protótipo: Criando Interfaces com IA" (CESAR). O objetivo é validar a interface e o fluxo, não entregar um produto final.

## Público e contexto de uso

- Pessoas que cozinham em casa e têm receitas espalhadas em prints, cadernos e links salvos.
- Dois momentos bem diferentes:
  - **Planejar:** "o que faço hoje com 30 minutos e sem glúten?", no sofá.
  - **Cozinhar:** celular apoiado na bancada, mãos ocupadas ou sujas, lendo de longe.

## Desafio de design (foco principal)

**Busca, filtros e apresentação visual de conteúdo (fotos e passos).** Toda decisão de interface deve responder: "a pessoa encontra a receita certa rápido e consegue segui-la enquanto cozinha?"

- A **busca** fica sempre visível e aceita nome do prato ou ingrediente ("frango", "abobrinha").
- **Filtros** simples e combináveis (Refeição, Restrição, Tempo) usando chips; mostre quantos resultados sobram e permita limpar tudo com um toque.
- Nunca deixe a pessoa num beco sem saída: com zero resultados, sugira remover um filtro.
- A **foto** é protagonista na listagem (cards visuais), mas as informações-chave aparecem junto: tempo, dificuldade e porções.
- O **modo de preparo** é dividido em passos numerados, com texto grande e bem espaçado. Um "modo cozinhar" que mostra um passo por vez é um grande diferencial.

## Escopo do protótipo

**Essencial**
- Listagem de receitas em cards com foto, nome, tempo e tags.
- Busca por nome ou ingrediente.
- Filtros combináveis: tipo de refeição, restrição alimentar e tempo de preparo.
- Detalhe da receita: foto, ingredientes, passos, tempo, porções e dificuldade.
- Favoritar receita.

**Desejável**
- Modo cozinhar (um passo por vez, texto grande, botões próximo/anterior).
- Marcar ingredientes já separados.
- Ajustar porções recalculando as quantidades.
- Adicionar uma receita própria.

**Fora do escopo**
- Login, comentários, avaliações de outras pessoas, lista de compras integrada a mercados, informação nutricional detalhada.

## Telas e fluxos

1. **Início/explorar:** busca em destaque, chips de filtro rápido e grade de receitas.
2. **Resultados:** receitas filtradas, com a contagem e os filtros ativos visíveis e removíveis.
3. **Detalhe da receita:** foto grande, resumo (tempo, porções, dificuldade), ingredientes e passos.
4. **Modo cozinhar:** um passo por vez, em tela cheia e com leitura fácil de longe.
5. **Favoritos:** receitas salvas.
6. **Estados vazios:** busca sem resultado e favoritos vazios, sempre com sugestão de próxima ação.

Fluxo principal: buscar ou filtrar → escolher pela foto e pelo tempo → abrir a receita → cozinhar seguindo os passos.

## Dados de exemplo

Comece com 8 a 12 receitas fictícias realistas, em português, variando refeição, restrição e tempo. Por exemplo:

- Frango xadrez: Almoço, 35 min, fácil, 4 porções.
- Panqueca de banana: Café da manhã, sem glúten, 15 min, fácil.
- Escondidinho de mandioca: Jantar, 60 min, médio.
- Salada de grão-de-bico: Almoço, vegana, 20 min, fácil.
- Bolo de cenoura com chocolate: Sobremesa, vegetariana, 50 min, médio.
- Moqueca de peixe: Jantar, sem lactose, 45 min, médio.

Para as fotos, use imagens de placeholder (ex.: serviços de imagem de exemplo ou blocos de cor com emoji do prato) caso a ferramenta não tenha imagens reais.

## Diretrizes de design

- Se existir um `DESIGN.md` no projeto, siga-o à risca para cores, tipografia, espaçamentos, cantos e componentes. Ele tem prioridade sobre qualquer preferência visual sua.
- Pense primeiro no celular (mobile first) e garanta que o layout também funcione no desktop.
- Uma única ação principal por tela, bem destacada (ex.: "Começar a cozinhar").
- Considere todos os estados: sem resultados, imagem carregando ou indisponível, favoritado e não favoritado.
- Acessibilidade básica: contraste adequado (inclusive texto sobre fotos), áreas de toque de pelo menos 44px, texto alternativo nas imagens e filtros ativos indicados por mais do que cor.

## Regras técnicas

- Protótipo apenas de front-end: **sem backend, sem banco de dados, sem autenticação**.
- Dados fictícios em memória; use `localStorage` se quiser manter favoritos entre recarregamentos.
- Todas as telas precisam estar conectadas: botões e links devem levar a algum lugar. Nada de botão "morto".
- Use a stack padrão da ferramenta (por exemplo, React + Tailwind). Não adicione bibliotecas sem necessidade.
- Todo o texto da interface em **português do Brasil**, com medidas brasileiras (xícara, colher de sopa, g, ml).

## Como trabalhar comigo

- A pessoa que está usando você pode não ter experiência com código nem com design. Explique suas decisões em linguagem simples, sem jargão técnico.
- Se o pedido for ambíguo ou faltar informação importante, faça no máximo 3 perguntas objetivas antes de gerar.
- Trabalhe em iterações pequenas: entregue algo navegável cedo e melhore a partir do feedback.
- Ao pedir um ajuste, mude só o que foi pedido e preserve o resto da interface.
- Ao final de cada entrega, resuma em até 3 itens o que mudou e sugira um próximo passo.
- Não invente funcionalidades fora do escopo acima sem perguntar antes.

## Critérios de avaliação

Antes de considerar uma tela pronta, confira:

- [ ] A busca está sempre ao alcance e encontra por nome e por ingrediente?
- [ ] Os filtros ativos ficam visíveis e são fáceis de remover?
- [ ] Buscas sem resultado sugerem o que fazer em seguida?
- [ ] Dá para escolher uma receita só olhando os cards (foto, tempo, tags)?
- [ ] Os passos são legíveis com o celular apoiado na bancada?
- [ ] O texto sobre as fotos tem contraste suficiente?
- [ ] O visual segue o `DESIGN.md`?
