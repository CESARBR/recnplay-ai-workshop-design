# AGENTS.md — App de Meditação e Foco (Pomodoro)

Este arquivo dá contexto ao agente de IA que vai construir este protótipo. Leia tudo antes de gerar qualquer tela e siga estas instruções em todas as respostas.

## Visão geral do projeto

Um app que ajuda a pessoa a se concentrar ou relaxar com temporizadores (ciclos de foco e descanso no método Pomodoro) ou sessões guiadas de meditação e respiração. Tem sons ambientes, lembretes de pausa e acompanhamento de quanto tempo a pessoa dedicou a foco e relaxamento.

Este é um **protótipo navegável** criado na oficina "Do Prompt ao Protótipo: Criando Interfaces com IA" (CESAR). O objetivo é validar a interface e o fluxo, não entregar um produto final.

## Público e contexto de uso

- Pessoas que estudam ou trabalham e se distraem com facilidade, ou que querem pausas para reduzir a ansiedade.
- O app fica aberto durante a sessão, muitas vezes num canto da tela ou com o celular sobre a mesa.
- Muitas nunca meditaram nem conhecem o método Pomodoro.

## Desafio de design (foco principal)

**Onboarding simples, estados de espera e minimalismo.** Toda decisão de interface deve responder: "isso ajuda a pessoa a se concentrar ou só a distrai?"

- **Onboarding:** no máximo 3 telas curtas explicando o essencial (o que é o ciclo foco/pausa), com opção de pular. A pessoa precisa começar a primeira sessão em menos de 30 segundos.
- **Estados de espera:** durante a sessão, a tela é quase vazia. Mostre só o tempo restante, o progresso (anel ou barra) e o controle de pausa. Nada pisca, nada chama atenção sem necessidade.
- As transições entre estados (foco → pausa → foco) precisam ser claras e suaves, com mudança de cor ou mensagem calma.
- **Minimalismo:** poucos elementos, muito espaço em branco, tipografia grande para o tempo. Cada elemento extra precisa justificar a sua existência.
- Tom de voz calmo e acolhedor ("Hora de uma pausa. Respire fundo.").

## Escopo do protótipo

**Essencial**
- Onboarding curto (pulável).
- Temporizador Pomodoro com os estados pronto, em foco, pausado, em pausa curta, em pausa longa e concluído.
- Configurar durações (padrão: 25 min de foco, 5 de pausa curta, 15 de pausa longa após 4 ciclos).
- Sessão guiada de respiração com animação simples (inspire, segure, expire).
- Histórico simples: tempo total de foco hoje e na semana.

**Desejável**
- Sons ambientes (chuva, café, floresta) com controle de volume. Pode ser só a interface, sem áudio real.
- Nomear a tarefa da sessão ("Estudar para a prova").
- Modo tela cheia ou foco total.

**Fora do escopo**
- Login, bloqueio real de apps ou sites, notificações reais do sistema, biblioteca extensa de meditações, planos pagos.

## Telas e fluxos

1. **Onboarding (primeira visita):** até 3 telas e o botão "Começar".
2. **Início:** escolher entre Foco e Respirar, com o botão principal "Iniciar" em destaque.
3. **Sessão de foco (estado de espera):** tempo grande, anel de progresso, pausar/retomar e encerrar.
4. **Transição/pausa:** mensagem calma, contagem da pausa e opção de pular.
5. **Sessão de respiração:** animação guiada com o ritmo da respiração em texto.
6. **Resumo/histórico:** sessão concluída ("Você focou 50 minutos hoje") e visão da semana.
7. **Configurações:** durações e som ambiente.

Fluxo principal: abrir o app → tocar em "Iniciar" → focar sem distração → receber a pausa → ver o tempo acumulado.

## Dados de exemplo

Comece com dados fictícios realistas, em português, para as telas de histórico não aparecerem vazias:

- Hoje: 3 ciclos concluídos (75 min de foco) e 1 sessão de respiração (5 min).
- Semana: seg 50 min, ter 100 min, qua 25 min, qui 75 min, sex 0, sáb 0, dom 0.
- Sessões nomeadas: "Estudar para a prova", "Escrever relatório", "Leitura".
- Sons: Chuva, Cafeteria, Floresta, Ondas, Silêncio.

## Diretrizes de design

- Se existir um `DESIGN.md` no projeto, siga-o à risca para cores, tipografia, espaçamentos, cantos e componentes. Ele tem prioridade sobre qualquer preferência visual sua. Use a cor de destaque com moderação, principalmente durante a sessão.
- Pense primeiro no celular (mobile first) e garanta que o layout também funcione no desktop.
- Uma única ação principal por tela, bem destacada ("Iniciar", "Pausar").
- Considere todos os estados do temporizador (pronto, em andamento, pausado, pausa, concluído), além de "sessão interrompida".
- Acessibilidade básica: contraste adequado, áreas de toque de pelo menos 44px, tempo restante legível por leitores de tela e animações que respeitem a preferência de movimento reduzido do sistema.

## Regras técnicas

- Protótipo apenas de front-end: **sem backend, sem banco de dados, sem autenticação**.
- Dados fictícios em memória; use `localStorage` se quiser manter o histórico entre recarregamentos.
- O temporizador deve funcionar de verdade. Para facilitar a demonstração, ofereça um "modo demo" em que 1 minuto dura alguns segundos.
- Todas as telas precisam estar conectadas: botões e links devem levar a algum lugar. Nada de botão "morto".
- Use a stack padrão da ferramenta (por exemplo, React + Tailwind). Não adicione bibliotecas sem necessidade.
- Todo o texto da interface em **português do Brasil**, com tempo no formato `mm:ss`.

## Como trabalhar comigo

- A pessoa que está usando você pode não ter experiência com código nem com design. Explique suas decisões em linguagem simples, sem jargão técnico.
- Se o pedido for ambíguo ou faltar informação importante, faça no máximo 3 perguntas objetivas antes de gerar.
- Trabalhe em iterações pequenas: entregue algo navegável cedo e melhore a partir do feedback.
- Ao pedir um ajuste, mude só o que foi pedido e preserve o resto da interface.
- Ao final de cada entrega, resuma em até 3 itens o que mudou e sugira um próximo passo.
- Não invente funcionalidades fora do escopo acima sem perguntar antes.

## Critérios de avaliação

Antes de considerar uma tela pronta, confira:

- [ ] Quem nunca usou o app começa a primeira sessão em menos de 30 segundos?
- [ ] Durante a sessão, a tela tem só o essencial?
- [ ] Dá para saber de relance em que estado o temporizador está (foco, pausa, pausado)?
- [ ] As transições entre foco e pausa são claras sem serem bruscas?
- [ ] O tom dos textos é calmo e acolhedor?
- [ ] As animações respeitam a preferência de movimento reduzido?
- [ ] O visual segue o `DESIGN.md`?
