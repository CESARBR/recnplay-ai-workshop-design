# AGENTS.md — Controle de Gastos Pessoais

Este arquivo dá contexto ao agente de IA que vai construir este protótipo. Leia tudo antes de gerar qualquer tela e siga estas instruções em todas as respostas.

## Visão geral do projeto

Um app para registrar despesas (e, opcionalmente, receitas) do dia a dia, organizá-las por categoria (alimentação, transporte, lazer etc.) e visualizar para onde o dinheiro está indo com gráficos e resumos. Ajuda a pessoa a entender e controlar o orçamento do mês.

Este é um **protótipo navegável** criado na oficina "Do Prompt ao Protótipo: Criando Interfaces com IA" (CESAR). O objetivo é validar a interface e o fluxo, não entregar um produto final.

## Público e contexto de uso

- Pessoas que querem organizar as finanças, mas se sentem intimidadas por planilhas e apps de banco cheios de números.
- Registro rápido logo depois de gastar (na fila, no ônibus), quase sempre no celular.
- Consulta ocasional para responder "quanto ainda posso gastar este mês?".

## Desafio de design (foco principal)

**Visualização de dados simples e não intimidadora.** Toda decisão de interface deve responder: "alguém sem familiaridade com finanças entende isso em 5 segundos?"

- A informação mais importante vem primeiro e em linguagem humana: **"Você ainda pode gastar R$ 850 este mês"** vale mais que uma tabela.
- Use poucos tipos de gráfico e os mais fáceis de ler: barras horizontais por categoria ou rosca com no máximo 5 fatias (agrupe o resto em "Outros").
- Todo gráfico tem valores e rótulos escritos. Cor sozinha não pode ser a única forma de identificar uma categoria.
- Evite vermelho alarmante para tudo. Reserve cores de alerta para quando o orçamento de fato estourar.
- Números formatados no padrão brasileiro: `R$ 1.234,56`.

## Escopo do protótipo

**Essencial**
- Registrar gasto com valor, categoria, data e descrição opcional, em poucos toques.
- Resumo do mês: total gasto, orçamento e quanto ainda resta.
- Gastos por categoria com gráfico simples.
- Lista de transações com filtro por categoria e por mês.
- Editar e excluir um gasto.

**Desejável**
- Registrar receitas.
- Orçamento por categoria com barra de progresso.
- Comparação com o mês anterior ("Você gastou 12% menos com transporte").

**Fora do escopo**
- Login, integração com bancos, Pix, cartões reais, investimentos, exportação de relatórios.

## Telas e fluxos

1. **Resumo (tela inicial):** quanto resta do orçamento do mês, total gasto, top categorias e últimos gastos.
2. **Novo gasto:** teclado numérico em destaque, seleção de categoria por ícones, data padrão = hoje.
3. **Categorias:** gráfico por categoria e, ao tocar em uma, a lista dos gastos dela.
4. **Transações:** lista cronológica agrupada por dia, com filtros.
5. **Estado vazio:** primeira visita com convite para definir o orçamento do mês e registrar o primeiro gasto.

Fluxo principal: gastar → abrir o app → registrar em menos de 10 segundos → ver o impacto no saldo do mês.

## Dados de exemplo

Comece com dados fictícios realistas, em português, para a interface nunca aparecer vazia na primeira vez:

- Orçamento do mês: R$ 3.000,00. Gasto até agora: R$ 2.150,40.
- Categorias com ícone: 🍽️ Alimentação (R$ 820,50), 🚌 Transporte (R$ 310,00), 🏠 Moradia (R$ 650,00), 🎉 Lazer (R$ 214,90), 💊 Saúde (R$ 95,00), 📦 Outros (R$ 60,00).
- Transações, por exemplo: "Mercado" R$ 187,32, "Uber" R$ 23,90, "Cinema" R$ 64,00, "Farmácia" R$ 47,50, "Almoço" R$ 32,00, espalhadas pelas últimas 3 semanas.

## Diretrizes de design

- Se existir um `DESIGN.md` no projeto, siga-o à risca para cores, tipografia, espaçamentos, cantos e componentes. Ele tem prioridade sobre qualquer preferência visual sua. As cores das categorias nos gráficos devem harmonizar com a paleta dele.
- Pense primeiro no celular (mobile first) e garanta que o layout também funcione no desktop.
- Uma única ação principal por tela, bem destacada (ex.: "Registrar gasto").
- Considere todos os estados: vazio, dentro do orçamento, perto do limite (acima de 80%) e orçamento estourado.
- Acessibilidade básica: contraste adequado, áreas de toque de pelo menos 44px, rótulos em todos os campos, e gráficos com legenda e valores em texto.

## Regras técnicas

- Protótipo apenas de front-end: **sem backend, sem banco de dados, sem autenticação**.
- Dados fictícios em memória; use `localStorage` se quiser manter os dados entre recarregamentos.
- Todas as telas precisam estar conectadas: botões e links devem levar a algum lugar. Nada de botão "morto".
- Use a stack padrão da ferramenta (por exemplo, React + Tailwind). Para gráficos, prefira uma biblioteca simples já disponível na ferramenta ou SVG/CSS puro.
- Todo o texto da interface em **português do Brasil**, com moeda em `R$ 0,00` e datas no formato dd/mm.

## Como trabalhar comigo

- A pessoa que está usando você pode não ter experiência com código nem com design. Explique suas decisões em linguagem simples, sem jargão técnico.
- Se o pedido for ambíguo ou faltar informação importante, faça no máximo 3 perguntas objetivas antes de gerar.
- Trabalhe em iterações pequenas: entregue algo navegável cedo e melhore a partir do feedback.
- Ao pedir um ajuste, mude só o que foi pedido e preserve o resto da interface.
- Ao final de cada entrega, resuma em até 3 itens o que mudou e sugira um próximo passo.
- Não invente funcionalidades fora do escopo acima sem perguntar antes.

## Critérios de avaliação

Antes de considerar uma tela pronta, confira:

- [ ] Em 5 segundos dá para saber quanto ainda se pode gastar no mês?
- [ ] Registrar um gasto leva menos de 10 segundos?
- [ ] O gráfico é compreensível para quem não entende de finanças?
- [ ] Os gráficos têm rótulos e valores, sem depender só de cor?
- [ ] Os valores estão no formato brasileiro (R$ 1.234,56)?
- [ ] O tom é tranquilo, sem alarmismo desnecessário?
- [ ] O visual segue o `DESIGN.md`?
