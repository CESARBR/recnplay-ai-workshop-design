# AGENTS.md — Rastreador de Hábitos (Habit Tracker)

Este arquivo dá contexto ao agente de IA que vai construir este protótipo. Leia tudo antes de gerar qualquer tela e siga estas instruções em todas as respostas.

## Visão geral do projeto

Um app onde a pessoa cadastra hábitos que quer manter ou construir (beber água, ler, se exercitar etc.) e marca todo dia se cumpriu ou não. O app mostra sequências (streaks), calendários visuais e estatísticas de consistência ao longo do tempo, como reforço motivacional.

Este é um **protótipo navegável** criado na oficina "Do Prompt ao Protótipo: Criando Interfaces com IA" (CESAR). O objetivo é validar a interface e o fluxo, não entregar um produto final.

## Público e contexto de uso

- Pessoas que querem mudar a rotina, mas costumam perder a motivação depois de alguns dias.
- Uso diário e rápido, geralmente de manhã ou à noite, no celular.
- Precisam sentir progresso para continuar, e não podem se sentir punidas quando falham.

## Desafio de design (foco principal)

**Motivação e feedback visual de progresso.** Toda decisão de interface deve responder: "isso faz a pessoa querer voltar amanhã?"

- Marcar um hábito como feito precisa ser **um toque só**, com um feedback visual satisfatório (animação curta, mudança de cor, check).
- Mostre a **sequência atual** (ex.: "🔥 12 dias") com destaque, sem esconder a consistência geral.
- O calendário ou mapa de calor deixa o progresso visível de relance.
- **Não seja punitivo:** um dia perdido não pode parecer um fracasso. Prefira mensagens como "Você cumpriu 80% este mês" a "Você quebrou sua sequência".
- Comemore marcos (7, 30, 100 dias) de forma leve e sem atrapalhar.

## Escopo do protótipo

**Essencial**
- Criar hábito com nome, ícone/emoji, frequência (diária ou dias da semana) e meta opcional (ex.: 8 copos).
- Marcar e desmarcar o hábito no dia.
- Mostrar sequência atual e melhor sequência.
- Calendário mensal por hábito.
- Resumo de consistência (porcentagem da semana e do mês).

**Desejável**
- Hábitos com contagem (ex.: 5 de 8 copos de água).
- Mensagens motivacionais contextuais.
- Celebração de marcos.

**Fora do escopo**
- Login, contas, sincronização, notificações reais, rede social ou ranking entre pessoas.

## Telas e fluxos

1. **Hoje (tela inicial):** lista dos hábitos do dia com botão de marcar, sequência de cada um e progresso geral do dia.
2. **Detalhe do hábito:** calendário mensal, sequência atual, melhor sequência e taxa de consistência.
3. **Novo/editar hábito:** formulário curto com sugestões prontas (Beber água, Ler 10 páginas, Caminhar 20 min, Meditar).
4. **Estatísticas:** visão geral da semana/mês com todos os hábitos.
5. **Estado vazio:** primeira visita com convite para criar o primeiro hábito a partir das sugestões.

Fluxo principal: abrir o app → marcar os hábitos feitos hoje → ver o progresso reagir → sair motivado.

## Dados de exemplo

Comece com dados fictícios realistas, em português, para a interface nunca aparecer vazia na primeira vez:

- 💧 Beber água: diário, meta de 8 copos, sequência de 12 dias.
- 📚 Ler 10 páginas: diário, sequência de 4 dias, melhor sequência de 21.
- 🏃 Exercitar-se: seg/qua/sex, 75% de consistência no mês.
- 🧘 Meditar 5 min: diário, sequência de 0 dias (falhou ontem), 60% no mês.
- Histórico dos últimos 30 dias com alguns dias falhados, para o calendário parecer real.

## Diretrizes de design

- Se existir um `DESIGN.md` no projeto, siga-o à risca para cores, tipografia, espaçamentos, cantos e componentes. Ele tem prioridade sobre qualquer preferência visual sua.
- Pense primeiro no celular (mobile first) e garanta que o layout também funcione no desktop.
- Uma única ação principal por tela, bem destacada.
- Considere todos os estados: vazio, hábito feito, não feito, parcialmente feito (meta com contagem) e dia sem hábito programado.
- Acessibilidade básica: contraste adequado, áreas de toque de pelo menos 44px, rótulos em todos os campos, e estado feito/não feito indicado por texto ou ícone, nunca só por cor.
- Animações curtas (até 300ms) e que respeitem a preferência de movimento reduzido do sistema.

## Regras técnicas

- Protótipo apenas de front-end: **sem backend, sem banco de dados, sem autenticação**.
- Dados fictícios em memória; use `localStorage` se quiser manter os dados entre recarregamentos.
- Todas as telas precisam estar conectadas: botões e links devem levar a algum lugar. Nada de botão "morto".
- Use a stack padrão da ferramenta (por exemplo, React + Tailwind). Não adicione bibliotecas sem necessidade.
- Todo o texto da interface em **português do Brasil**, com datas no formato dd/mm e semana começando no domingo.

## Como trabalhar comigo

- A pessoa que está usando você pode não ter experiência com código nem com design. Explique suas decisões em linguagem simples, sem jargão técnico.
- Se o pedido for ambíguo ou faltar informação importante, faça no máximo 3 perguntas objetivas antes de gerar.
- Trabalhe em iterações pequenas: entregue algo navegável cedo e melhore a partir do feedback.
- Ao pedir um ajuste, mude só o que foi pedido e preserve o resto da interface.
- Ao final de cada entrega, resuma em até 3 itens o que mudou e sugira um próximo passo.
- Não invente funcionalidades fora do escopo acima sem perguntar antes.

## Critérios de avaliação

Antes de considerar uma tela pronta, confira:

- [ ] Marcar um hábito leva um toque e tem feedback visual claro?
- [ ] A sequência atual é visível sem precisar procurar?
- [ ] Dá para entender a consistência do mês de relance?
- [ ] Um dia perdido é comunicado sem soar punitivo?
- [ ] Criar o primeiro hábito é fácil para quem nunca usou o app?
- [ ] Estados feito/não feito são distinguíveis sem depender só de cor?
- [ ] O visual segue o `DESIGN.md`?
