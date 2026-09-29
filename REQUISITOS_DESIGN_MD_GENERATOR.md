# Requisitos — DESIGN.md Generator

## 1. Objetivo

Criar uma ferramenta independente para montar, visualizar, validar e exportar um sistema de design no formato `DESIGN.md`. O documento produzido deve ser útil a agentes de programação e compatível com a especificação aberta do formato. Esta especificação descreve **funcionalidades e comportamento**, sem definir aparência da interface, paleta, fontes ou estilo visual da ferramenta.

Este projeto deve ser tratado como novo. Não reutilizar requisitos, decisões ou código de projetos anteriores como fonte de verdade.

## 2. Referências e regra de precedência

- **Referência principal de funcionalidades e fluxo:** [DESIGN.md Generator, design.dev](https://design.dev/ai/design-md-generator/), consultado em 23/09/2026.
- **Referência normativa para o arquivo gerado:** [especificação oficial DESIGN.md](https://github.com/google-labs-code/design.md/blob/main/docs/spec.md) e [CLI oficial](https://github.com/google-labs-code/design.md).
- Quando a página de referência e a especificação oficial divergirem sobre **validade do arquivo, esquema, lint ou exportação**, seguir a especificação/CLI oficial. Para os controles e o fluxo de edição, seguir a página de referência.
- A página de referência descreve oito regras de lint; a documentação oficial consultada lista onze. Implementar a compatibilidade com a versão **fixada** da CLI oficial escolhida durante a implementação e documentar essa versão. Não presumir que o formato `alpha` permanecerá estável.

## 3. Escopo e fluxo principal

O usuário deve conseguir:

1. Informar o nome e uma descrição opcional do sistema.
2. Começar com dados de exemplo editáveis **ou** gerar uma configuração inicial a partir de uma cor informada.
3. Editar cores, tipografia, escalas de espaçamento e arredondamento, componentes e orientações textuais.
4. Ver uma prévia de interface e os resultados do lint atualizados conforme edita.
5. Alternar entre quatro saídas: `DESIGN.md`, variáveis CSS, tema Tailwind v4 e JSON DTCG.
6. Copiar ou baixar a saída selecionada e, quando necessário, restaurar os dados iniciais.

A ferramenta não precisa de cadastro, integração com repositório, importação de Figma, geração de modo escuro, análise de projetos existentes ou edição colaborativa para cumprir este escopo. Os links da página de referência para outras ferramentas não fazem parte do produto solicitado.

## 4. Requisitos funcionais

### RF-01 — Estado inicial e identificação

- Abrir com um exemplo completo e editável, suficiente para demonstrar prévia, lint e todos os formatos de exportação. Os valores do exemplo são decisão de implementação, não requisitos de identidade visual.
- Permitir editar `name` (obrigatório) e `description` (opcional).
- Refletir nome e descrição no arquivo `DESIGN.md` e, quando pertinente, nos cabeçalhos informativos das saídas.
- Impedir exportação de um `DESIGN.md` sem nome válido; mostrar o problema próximo ao campo e no lint, sem gerar conteúdo YAML inválido.

### RF-02 — Geração rápida a partir de uma cor

- Oferecer entrada de cor de marca por seletor e/ou valor editável e uma ação explícita de gerar.
- Ao gerar, criar uma paleta inicial de tokens semânticos, escalas de espaçamento e arredondamento e componentes de exemplo que usem referências aos tokens.
- A cor informada deve aparecer no conjunto gerado. A ferramenta deve escolher cores de texto adequadas para os pares de contraste dos componentes gerados sempre que possível.
- A ação deve atualizar imediatamente editor, prévia, lint e todas as saídas.
- Como a geração substitui os tokens e componentes atuais, deixar claro esse efeito antes ou no momento da ação. Preservar nome, descrição, tipografia e textos livres já escritos, salvo se a interface informar explicitamente outra escolha.
- Não exigir um algoritmo específico de harmonização cromática; exigir resultado válido, determinístico para a mesma entrada e verificável pelo lint.

### RF-03 — Cores

- Listar a quantidade de tokens de cor e permitir adicionar, renomear, editar valor e remover cada token.
- Oferecer seletor visual e campo textual sincronizados para o valor da cor.
- Aceitar os formatos de cor CSS válidos conforme a especificação oficial, mantendo o valor original no arquivo/exportações quando possível. O seletor visual pode representar apenas formatos que o navegador consiga editar diretamente.
- Nomes devem ser únicos dentro do grupo `colors` e seguros como chaves YAML e referências `{colors.nome}`.
- Mudanças de nome ou remoção que afetem componentes devem atualizar referências existentes **ou** produzir um erro claro de referência quebrada; nunca deixar uma exportação aparentemente válida com referência inválida não sinalizada.

### RF-04 — Tipografia

- Listar a quantidade de estilos e permitir adicionar, renomear, editar e remover tokens de tipografia.
- Cada estilo deve editar, no mínimo, `fontFamily`, `fontSize` e `fontWeight`, como no gerador de referência.
- Validar `fontSize` como dimensão aceita pelo formato e `fontWeight` como número. Nomes devem ser únicos dentro de `typography`.
- Exportar apenas propriedades preenchidas e válidas. Propriedades opcionais adicionais do esquema oficial (`lineHeight`, `letterSpacing`, `fontFeature`, `fontVariation`) podem ser implementadas sem alterar o fluxo mínimo.

### RF-05 — Escalas

- Oferecer grupos separados para `spacing` e `rounded`, cada um com contagem de níveis.
- Permitir adicionar, renomear, editar valor e remover níveis em cada grupo.
- Aceitar em `spacing` dimensões ou números unitários conforme o esquema oficial; aceitar em `rounded` dimensões válidas.
- Manter nomes únicos por grupo e refletir as alterações nas referências de componentes, na prévia, no lint e nas exportações.

### RF-06 — Componentes

- Permitir adicionar, renomear e remover componentes e editar suas propriedades.
- Disponibilizar, no mínimo, `backgroundColor`, `textColor`, `typography`, `rounded` e `padding`, correspondentes aos controles da referência.
- Para propriedades com tokens, oferecer seleção de referências existentes (`{colors.*}`, `{typography.*}`, `{rounded.*}`) e permitir valores literais quando aceitos pela especificação. Campos vazios não devem virar propriedades inválidas no YAML.
- Permitir componentes de estado como entradas separadas relacionadas por nome, por exemplo, variante de hover.
- A estrutura gerada deve respeitar `components.<nome>.<propriedade>` e as propriedades reconhecidas pela versão fixada da especificação. Se propriedades oficiais adicionais forem suportadas, documentá-las no produto.

### RF-07 — Orientações em linguagem natural

- Oferecer campos de texto livre para, no mínimo, `Overview`, `Elevation & Depth` e `Do's and Don'ts`.
- Gerar seções de Markdown em ordem canônica: `Overview`, `Colors`, `Typography`, `Layout`, `Elevation & Depth`, `Shapes`, `Components`, `Do's and Don'ts`. O conteúdo estrutural de cores, tipografia, layout, formas e componentes deve ser derivado dos tokens; os textos livres complementam esse conteúdo.
- Omitir seções sem conteúdo relevante ou produzir conteúdo consistente e não enganoso quando um grupo estiver vazio. Não inventar orientações visuais a partir de campos vazios.
- Preservar quebras de linha e escapar corretamente texto que possa interferir no YAML ou na estrutura Markdown.

### RF-08 — Prévia em tempo real

- Mostrar uma prévia funcional com, no mínimo, título, texto, ação primária, ação secundária, cartão, campo de entrada e amostras dos tokens de cor.
- Aplicar à prévia os tokens e mapeamentos de componentes atuais. Alterações nos campos devem ser refletidas sem recarregar a página ou pressionar um botão de atualização.
- Quando faltar um token necessário, manter a prévia utilizável com fallback explícito e sinalizar o problema no lint; não travar a ferramenta.
- A prévia serve para inspeção do sistema editado. Não introduzir valores da prévia como requisitos visuais do produto.

### RF-09 — Lint e contraste

- Recalcular o lint a cada alteração relevante e mostrar contagem por severidade, identificação da regra, localização do problema e mensagem acionável.
- Cobrir as regras da página de referência: `broken-ref`, `missing-primary`, `contrast-ratio`, `orphaned-tokens`, `missing-typography`, `missing-sections`, `section-order` e `token-summary`.
- Alinhar-se também às regras adicionais da CLI oficial na versão fixada: `unknown-key`, `token-like-ignored` e `omitted-rules`, quando aplicáveis ao documento produzido.
- Verificar contraste WCAG AA dos pares `backgroundColor`/`textColor` dos componentes, resolvendo referências antes do cálculo. Usar o limiar de **4,5:1** para texto normal indicado pela referência; exibir proporção calculada e componente afetado. Pares aprovados podem aparecer como informação, como na página observada.
- Diferenciar erros, avisos e informações. A ausência de achados deve ter estado explícito.
- Erros de sintaxe, valores inválidos ou referências quebradas não devem ser escondidos por uma exportação bem formatada.

### RF-10 — Geração de `DESIGN.md`

- Gerar arquivo UTF-8 com YAML frontmatter delimitado por linhas `---`, seguido do corpo Markdown.
- Incluir `version` compatível com a versão fixada da especificação, `name`, `description` quando presente e grupos de tokens presentes: `colors`, `typography`, `rounded`, `spacing`, `components`.
- Serializar strings, números e referências corretamente; valores com `#`, `:`, aspas ou caracteres especiais não podem corromper o YAML.
- No corpo, incluir título opcional com o nome e as seções na ordem canônica; expressar tokens e orientação textual de maneira legível para agentes.
- O resultado de um estado válido deve passar pelo comando `lint` da CLI oficial na versão fixada sem erros. Avisos informativos do conteúdo escolhido pelo usuário podem permanecer visíveis, sem serem ocultados.
- Nome de download: `DESIGN.md`.

### RF-11 — Exportações alternativas

- Oferecer abas para visualizar o conteúdo integral de cada formato, gerado a partir do mesmo estado atual:
  - **CSS Variables:** propriedades customizadas em `:root` para cores, espaçamento, arredondamento e tipografia suportada. Nome de download sugerido: `design-tokens.css`.
  - **Tailwind v4:** bloco `@theme` com namespaces de tokens compatíveis com o exportador oficial. Nome sugerido: `tailwind-theme.css`.
  - **DTCG JSON:** objeto de tokens com `$type` e `$value` para grupos compatíveis, no mínimo cores, tipografia, espaçamento e arredondamento. Nome sugerido: `tokens.json`.
- Não inserir comentários ou propriedades que tornem CSS/JSON inválido. O JSON deve ser parseável e os formatos devem refletir o último estado editado.
- Para `DESIGN.md`, Tailwind e DTCG, comparar a estrutura com a CLI oficial fixada. Se um formato não representar determinada propriedade (por exemplo, mapeamentos de componentes na saída DTCG da referência), não inventar uma representação incompatível; manter essa propriedade no `DESIGN.md`.

### RF-12 — Copiar, baixar e restaurar

- Copiar para a área de transferência exatamente o conteúdo da aba ativa e informar sucesso ou falha.
- Baixar exatamente o conteúdo da aba ativa, com a extensão e o nome apropriados.
- Permitir restaurar os dados iniciais. Antes de descartar edições, solicitar confirmação clara. Após restaurar, editor, prévia, lint e exportações devem concordar entre si.

## 5. Requisitos de funcionamento

- Processar geração de paleta, edição, prévia, lint e exportações localmente no navegador; não transmitir o sistema de design a servidor para essas funções.
- Depois de carregada, a ferramenta deve continuar utilizável sem rede, inclusive cópia e download dos arquivos. Recursos indispensáveis ao funcionamento não podem depender de chamadas remotas posteriores.
- Campos, botões, abas e mensagens de lint devem ser operáveis por teclado e ter nomes acessíveis. O foco e o estado da aba ativa devem ser perceptíveis. Mensagens de erro precisam apontar o campo ou token afetado.
- Atualizações devem ser responsivas à edição, sem perda de texto em digitação normal e sem inconsistência temporária persistente entre editor, prévia e saídas.
- A implementação pode escolher tecnologia, armazenamento local e organização interna. Estes requisitos não exigem backend nem persistência entre sessões.

## 6. Critérios de aceitação

1. **Edição encadeada:** adicionar uma cor, renomeá-la, associá-la a um componente e alterar seu valor atualiza contagem, prévia, lint e quatro saídas; a referência exportada permanece válida.
2. **Referência quebrada:** remover um token usado por componente produz reparo automático ou erro `broken-ref` visível e identificável; nenhuma falha silenciosa.
3. **Contraste:** definir um par de texto/fundo abaixo de 4,5:1 gera achado `contrast-ratio` com proporção e componente; ajustar o par remove o aviso.
4. **Geração rápida:** informar uma cor válida e acionar geração cria tokens, escalas e componentes utilizáveis; repetir a operação com a mesma entrada produz o mesmo resultado.
5. **Exportação sincronizada:** editar um valor e alternar entre as quatro abas mostra o valor atualizado em cada formato aplicável; copiar e baixar correspondem exatamente ao conteúdo mostrado.
6. **Arquivo oficial:** um `DESIGN.md` válido gerado pela ferramenta é aceito pelo `lint` da versão fixada de `@google/design.md`, e suas seções aparecem na ordem prevista pela especificação.
7. **Dados inválidos:** nome vazio, chave duplicada, cor inválida e dimensão inválida geram mensagens específicas; não resultam em arquivo apresentado como válido.
8. **Restauração:** depois de editar múltiplos grupos, restaurar mediante confirmação devolve o estado inicial completo e atualiza prévia, lint e exportações.
9. **Uso sem rede:** após a primeira carga, editar, validar, copiar e baixar continuam funcionando com a conexão desativada.

## 7. Entrega esperada da implementação

- Ferramenta executável com os fluxos acima.
- Instruções curtas para executar e verificar localmente.
- Registro da versão da especificação/CLI usada e de eventuais diferenças deliberadas em relação ao gerador de referência.
- Verificação automatizada dos casos que envolvem serialização, referências, contraste e exportações, pois erros nessas áreas podem produzir arquivos aparentemente corretos mas inutilizáveis.
