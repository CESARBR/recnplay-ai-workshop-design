# AGENTS.md — To-Do List

Este arquivo dá contexto ao agente de IA que vai construir este protótipo. Leia tudo antes de gerar qualquer tela e siga estas instruções em todas as respostas.

## Visão geral do projeto

Um app de lista de tarefas onde a pessoa anota o que precisa fazer, organiza as tarefas por data, prioridade ou categoria e marca como concluídas conforme avança. O objetivo é que ela não esqueça compromissos e tenha uma visão clara do que falta fazer hoje, nesta semana e depois.

Este é um **protótipo navegável** criado na oficina "Do Prompt ao Protótipo: Criando Interfaces com IA" (CESAR). O objetivo é validar a interface e o fluxo, não entregar um produto final.

## Público e contexto de uso

- Pessoas adultas com rotina cheia (trabalho, estudos, casa) que querem se organizar sem complicação.
- Uso rápido e frequente, principalmente no celular: abrir, anotar ou marcar algo e fechar em poucos segundos.
- Muitas já tentaram outros apps e desistiram porque eram complexos demais.

## Desafio de design (foco principal)

**Priorização, categorização e hierarquia de tarefas.** Toda decisão de interface deve responder: "a pessoa consegue ver em segundos o que é mais importante agora?"

- Deixe claro o que é **urgente/prioritário** sem transformar a tela num mar de cores e ícones. Use no máximo 3 níveis de prioridade (Alta, Média, Baixa).
- A visão padrão é **"Hoje"**; tarefas atrasadas aparecem em destaque no topo.
- Categorias ajudam a filtrar, mas não podem competir visualmente com a prioridade.
- Tarefas concluídas saem do foco (riscadas, esmaecidas ou agrupadas no final), mas continuam acessíveis.
- Subtarefas, se existirem, ficam visualmente subordinadas à tarefa principal (indentação, tamanho menor).

## Escopo do protótipo

**Essencial**
- Adicionar tarefa com título e, opcionalmente, data, prioridade e categoria.
- Marcar e desmarcar tarefa como concluída.
- Visões: Hoje, Próximos dias e Todas.
- Filtrar por categoria.
- Editar e excluir tarefa.

**Desejável**
- Subtarefas (checklist dentro de uma tarefa).
- Reordenar tarefas.
- Contador de progresso do dia (ex.: "3 de 7 concluídas").

**Fora do escopo**
- Login, contas, sincronização, notificações reais, colaboração entre pessoas.

## Telas e fluxos

1. **Hoje (tela inicial):** tarefas atrasadas, tarefas de hoje agrupadas por prioridade, progresso do dia e botão para adicionar.
2. **Adicionar/editar tarefa:** formulário curto (título obrigatório; o resto é opcional e pode ficar recolhido).
3. **Próximos dias:** tarefas agrupadas por data.
4. **Categorias:** lista de categorias com a quantidade de tarefas pendentes em cada uma.
5. **Estado vazio:** mensagem amigável quando não há tarefas ("Nada pendente para hoje 🎉") com chamada para adicionar.

Fluxo principal: abrir o app → ver o que é prioritário hoje → concluir uma tarefa → adicionar uma nova em menos de 10 segundos.

## Dados de exemplo

Comece com dados fictícios realistas, em português, para a interface nunca aparecer vazia na primeira vez:

- Categorias: Trabalho, Pessoal, Casa, Estudos, Saúde.
- Tarefas, por exemplo: "Enviar relatório mensal" (Trabalho, Alta, hoje), "Pagar conta de luz" (Casa, Alta, atrasada 1 dia), "Marcar consulta no dentista" (Saúde, Média, amanhã), "Ler capítulo 3 do livro" (Estudos, Baixa, sexta), "Comprar presente da Ana" (Pessoal, Média, sábado), além de 2 tarefas já concluídas.

## Diretrizes de design

- Se existir um `DESIGN.md` no projeto, siga-o à risca para cores, tipografia, espaçamentos, cantos e componentes. Ele tem prioridade sobre qualquer preferência visual sua.
- Pense primeiro no celular (mobile first) e garanta que o layout também funcione no desktop.
- Uma única ação principal por tela, bem destacada (ex.: "Adicionar tarefa").
- Considere todos os estados: vazio, carregando (se houver), erro, sucesso e item concluído.
- Acessibilidade básica: contraste adequado, áreas de toque de pelo menos 44px, rótulos em todos os campos, e prioridade indicada por texto ou ícone, nunca só por cor.

## Regras técnicas

- Protótipo apenas de front-end: **sem backend, sem banco de dados, sem autenticação**.
- Dados fictícios em memória; use `localStorage` se quiser manter os dados entre recarregamentos.
- Todas as telas precisam estar conectadas: botões e links devem levar a algum lugar. Nada de botão "morto".
- Use a stack padrão da ferramenta (por exemplo, React + Tailwind). Não adicione bibliotecas sem necessidade.
- Todo o texto da interface em **português do Brasil**, com datas no formato dd/mm.

## Como trabalhar comigo

- A pessoa que está usando você pode não ter experiência com código nem com design. Explique suas decisões em linguagem simples, sem jargão técnico.
- Se o pedido for ambíguo ou faltar informação importante, faça no máximo 3 perguntas objetivas antes de gerar.
- Trabalhe em iterações pequenas: entregue algo navegável cedo e melhore a partir do feedback.
- Ao pedir um ajuste, mude só o que foi pedido e preserve o resto da interface.
- Ao final de cada entrega, resuma em até 3 itens o que mudou e sugira um próximo passo.
- Não invente funcionalidades fora do escopo acima sem perguntar antes.

## Critérios de avaliação

Antes de considerar uma tela pronta, confira:

- [ ] Em até 5 segundos dá para identificar a tarefa mais importante do dia?
- [ ] Tarefas atrasadas se destacam das demais?
- [ ] Adicionar uma tarefa leva poucos toques?
- [ ] Prioridade e categoria são distinguíveis sem depender só de cor?
- [ ] Tarefas concluídas saem do foco sem sumirem?
- [ ] O estado vazio orienta a pessoa sobre o que fazer?
- [ ] O visual segue o `DESIGN.md`?
