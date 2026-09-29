# Plano de implementação — DESIGN.md Generator (`/#/designmd`)

> **Situação (23/09/2026):** as 11 etapas foram implementadas. Detalhes de uso, versão fixada e roteiro de verificação manual estão no [`README.md`](./README.md#gerador-de-designmd).

Plano para implementar os requisitos de [`REQUISITOS_DESIGN_MD_GENERATOR.md`](./REQUISITOS_DESIGN_MD_GENERATOR.md) dentro deste projeto (monolito React + Vite + Tailwind v4 + shadcn/ui), seguindo a identidade visual de [`DESIGN.md`](./DESIGN.md).

## 0. Premissas e decisões já tomadas

| Tema | Decisão |
|---|---|
| Hospedagem | **Site estático no GitHub Pages**, servido da pasta `docs/` do branch `main`, **sem GitHub Actions**. Não há servidor, API nem Node em produção: tudo roda no navegador, e build e testes rodam na máquina de quem publica. |
| Exportação | **Somente `DESIGN.md`** (copiar e baixar). As saídas CSS Variables, Tailwind v4 e DTCG JSON do RF-11 ficam **fora do escopo**. |
| Exemplo inicial | Os tokens e textos do `DESIGN.md` do CESAR. |
| Idioma do texto derivado | **pt-BR**. Os títulos das seções continuam com os nomes canônicos em inglês exigidos pela spec (`Overview`, `Colors`…). |
| Rascunho | Salvo automaticamente no `localStorage`. "Restaurar" também limpa o rascunho. |
| Referência design.dev | Não será consultada (bloqueada pelo sandbox). Controles e fluxo seguem só o texto dos requisitos. |

### Investigação feita

| Item | Resultado |
|---|---|
| CLI oficial | `@google/design.md`, versão mais recente **0.4.0**, formato `version: alpha`. Será **fixada em `0.4.0`** (sem `^`). |
| Regras de lint na 0.4.0 | 11 regras: `broken-ref`, `missing-primary`, `contrast-ratio`, `orphaned-tokens`, `missing-typography`, `missing-sections`, `section-order`, `token-summary`, `unknown-key`, `token-like-ignored`, `omitted-rules` (+ erros de modelo, como dimensão inválida, emitidos sem `rule`). |
| API como biblioteca | `@google/design.md/linter` exporta `lint(markdown)` → `{ findings, summary, designSystem }` (tokens já resolvidos) e `contrastRatio`. |
| Roda no navegador? | **Não diretamente**: lê `spec-config.yaml` com `readFileSync` ao carregar e usa `createRequire`, `node:path`, `node:url`, `tty` e `util`. |
| Prova de conceito | Empacotada com Vite trocando os módulos `node:*` por *shims* (substitutos simples) e embutindo o YAML como texto: **114 KB gzip, sem imports do Node**, `lint` funcionando (detectou `broken-ref` e `'6xx' is not a valid dimension`). |
| O que o lint oficial valida (verificado na etapa 2) | Cores, `rounded` e tipografia (`fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`) e referências quebradas. **Não valida:** nome vazio, chaves duplicadas (só um aviso genérico), títulos de seção duplicados, valores de `spacing` (aceita `abc`) e **nenhum valor literal de componente** (aceita `backgroundColor: nope`). O editor cobre essas lacunas; cores literais são validadas com o parser da própria biblioteca. |
| CLI e stdin | Apesar do README, a CLI 0.4.0 não aceita `-` (stdin) como arquivo; os testes usam arquivo temporário. |
| Formatos de cor da spec | Qualquer cor CSS (hex, nomes, `rgb()`, `hsl()`, `hwb()`, `oklch()`, `oklab()`, `lch()`, `lab()`, `color-mix()`). O valor original é preservado; a conversão para sRGB serve só para o contraste. |

## 1. O que muda por ser um site estático no GitHub Pages

1. **Tudo no cliente, empacotado no build.** A biblioteca oficial é embutida no bundle por `vite build`. Não há chamada a servidor nem a CDN em tempo de execução, o que já atende ao "processar localmente, sem transmitir o sistema de design".
2. **Rotas com hash.** A ferramenta fica em `/#/designmd` (o Pages não tem fallback de SPA), e os caminhos continuam relativos (`base: './'`) para funcionar em `usuario.github.io/repo/`.
3. **Carregamento sob demanda + pré-carregamento.** A página `/designmd` vira um *chunk* separado (`React.lazy`), para não pesar a home. Depois da primeira carga de qualquer página, o *chunk* é **pré-carregado em segundo plano** (`requestIdleCallback`). Assim a ferramenta continua funcionando se a rede cair antes de a pessoa navegar até ela (critério 9).
4. **Sem rede após a carga, mas não após recarregar.** O Pages não permite configurar cache, e não vamos adicionar service worker. A ferramenta funciona sem rede enquanto a aba estiver aberta; recarregar sem rede não funciona. Isso atende ao requisito ("depois de carregada"). Um service worker para uso totalmente offline fica como melhoria futura.
5. **`localStorage` compartilhado por domínio.** No Pages, todos os repositórios de um mesmo usuário ou organização (`usuario.github.io/*`) dividem o mesmo `localStorage`. Por isso a chave tem prefixo e versão, `recnplay-designmd:draft:v1`. Um rascunho de versão antiga ou corrompido é descartado com segurança, voltando ao exemplo e avisando a pessoa.
6. **HTTPS garantido.** O Pages serve por HTTPS, então a API de área de transferência (`navigator.clipboard`) funciona. Um fallback com `document.execCommand('copy')` cobre navegadores antigos, e o download usa `Blob` + `<a download>`, que funciona em site estático.
7. **Sem CI: a verificação é local.** Como não há GitHub Actions, os testes não rodam no push. Um script `npm run check` (testes + build) deve rodar antes de commitar a pasta `docs/`, e o README passa a indicar isso.
8. **Peso publicado.** A pasta `docs/` ganha o *chunk* da ferramenta (~120–150 KB gzip no total), comitado a cada build. `emptyOutDir` remove os *chunks* antigos. Nenhum limite do Pages é afetado.
9. **Fontes da prévia.** A prévia usa a `fontFamily` digitada com as fontes instaladas no sistema, **sem buscar fontes remotas**, com fallback explícito. O site em si continua usando DM Sans do Google Fonts, que não é indispensável para a ferramenta funcionar.

## 2. Decisões de arquitetura

### 2.1 Lint pela biblioteca oficial, rodando no navegador

- `lint()` da `@google/design.md@0.4.0` é empacotado com *shims*, via um plugin Vite que **só troca os imports `node:*` quando quem importa é o `@google/design.md`**. O resto do app, o `vite.config.ts` e os testes em Node não são afetados.
- Por quê: atende de forma direta ao "passar pelo `lint` da CLI oficial" (RF-10, critério 6) e evita reimplementar o parser de cores CSS e as 11 regras.
- Risco: uma atualização da biblioteca pode quebrar os *shims*. Mitigação: versão fixada e teste que compara o bundle "de navegador" com a CLI real.

### 2.2 Fluxo de dados único

```
Estado do editor (Draft, com IDs estáveis) ⇄ localStorage (rascunho)
   │  validação do editor (nome vazio, chave duplicada, cor/dimensão inválida…)
   ▼
serializeDesignMd(draft) ──► texto DESIGN.md ──► aba DESIGN.md (copiar/baixar)
   │
   ▼
lint(texto) [biblioteca oficial] ──► findings ──► painel de lint
                                  └► designSystem resolvido ──► prévia
```

- Lint, prévia e o arquivo exportado derivam **do mesmo texto**, então não ficam inconsistentes entre si.
- O processamento é derivado com `useMemo` + `useDeferredValue`: a digitação continua fluida, sem perda de texto.
- O rascunho é salvo no `localStorage` com *debounce* (~500ms) e restaurado ao abrir a página.

### 2.3 Modelo de estado com IDs estáveis

- Cada token (cor, tipografia, spacing, rounded) e cada componente tem um `id` interno. Nos componentes, as referências guardam o **id** do token.
- **Renomear** um token atualiza todas as referências automaticamente (RF-03, critério 1).
- **Remover** um token em uso pede confirmação, listando os componentes afetados. Se confirmado, a referência fica como `{colors.nome}` quebrada e aparece como erro `broken-ref`, com link para o componente (critério 2).
- Nomes válidos: `^[a-z0-9][a-z0-9-]*$`, únicos por grupo.

### 2.4 Serialização do `DESIGN.md`

- O frontmatter é gerado com a biblioteca `yaml`, que faz as aspas e o escape de `#`, `:`, aspas e quebras de linha. Nunca por concatenação.
- Ordem das chaves: `version`, `name`, `description`, `colors`, `typography`, `rounded`, `spacing`, `components`. Grupos e propriedades vazios são omitidos.
- O corpo segue a ordem canônica `Overview`, `Colors`, `Typography`, `Layout`, `Elevation & Depth`, `Shapes`, `Components`, `Do's and Don'ts`:
  - `Colors`, `Typography`, `Layout`, `Shapes` e `Components` são **derivados dos tokens, em pt-BR** (ex.: "- **primary (#201813)**", tabela de tipografia, escala de espaçamento). Podem ser complementados por texto livre.
  - `Overview`, `Elevation & Depth` e `Do's and Don'ts` são texto livre. Seções vazias são omitidas, sem inventar orientação.
  - Linhas de texto livre que começam com `#` são escapadas (`\#`), para não criarem seções novas. As quebras de linha são preservadas.
- **Erros bloqueantes** (nome vazio, chave duplicada, valor inválido): o serializador omite as entradas inválidas, para nunca gerar YAML inválido. A aba mostra "Corrija N erros para exportar", e copiar/baixar ficam desabilitados (RF-01, critério 7).

### 2.5 Geração rápida a partir de uma cor (RF-02)

- Algoritmo determinístico próprio, em OKLCH (conversão sRGB↔OKLab no projeto, ~50 linhas, sem dependência nova):
  - `primary` = a cor informada, exatamente como digitada.
  - `secondary` e `tertiary` por variação de matiz e croma; `neutral`, `surface`, `on-surface`, `border` e `error` com croma baixo.
  - `on-*`: branco ou preto, o que der maior contraste. Sempre há um dos dois ≥ 4,5:1.
- Escalas fixas: `spacing` (xs 4px, sm 8px, md 16px, lg 24px, xl 32px) e `rounded` (none 0px, sm 4px, md 8px, lg 12px, full 9999px).
- Componentes: `button-primary`, `button-primary-hover`, `button-secondary`, `card` e `input`, com referências a tokens. Referenciam tipografia apenas se já existir um token compatível.
- **Preserva** nome, descrição, tipografia e textos livres. Uma confirmação avisa que cores, escalas e componentes serão substituídos.

### 2.6 Mensagens do lint em pt-BR

- Cada achado mostra **título e dica em pt-BR por regra** (ex.: `contrast-ratio` → "Contraste insuficiente — escureça o fundo ou mude a cor do texto") e a **mensagem original da CLI** como detalhe.
- Para `contrast-ratio`, a proporção e o componente aparecem em destaque.
- A origem é identificada: "Editor" (validação de campo) ou "CLI 0.4.0".

## 3. Interface (seguindo o DESIGN.md)

### 3.1 Layout

- O `SiteLayout` ganha uma opção de página larga (`max-w-7xl`), por `handle` da rota, usada só em `/designmd`.
- **Desktop (≥ 1024px):** duas colunas.
  - Esquerda (≈ 7/12): **editor** em acordeão, com contagem no título: Identidade · Gerar a partir de uma cor · Cores (7) · Tipografia (3) · Espaçamento (3) · Arredondamento (2) · Componentes (4) · Orientações.
  - Direita (≈ 5/12, fixa ao rolar): **resumo do lint** (erros / avisos / infos) e abas **Prévia | Problemas (n) | DESIGN.md**.
  - Na aba DESIGN.md: conteúdo completo, **Copiar** e **Baixar DESIGN.md**.
- **Celular:** uma coluna. Barra fixa no rodapé com a contagem do lint e atalhos para Prévia e DESIGN.md.
- No topo, uma linha discreta: "Rascunho salvo neste navegador · Restaurar exemplo".

### 3.2 Aplicação do DESIGN.md

- **Cores:** fundo `neutral`, painéis em cards `surface` com borda `border` (sem sombra), texto `primary`, rótulos em `secondary`.
- **Uma única ação laranja sólida por tela:** **"Baixar DESIGN.md"**. As demais (Gerar, Copiar, Adicionar, Restaurar) usam o botão secundário ou o contorno.
- **Tipografia:** DM Sans. Rótulos em `label-caps`. Código em fonte monoespaçada do sistema.
- **Formas e espaçamento:** cantos de 6px em campos e botões e de 12px em cards; padding de 24px nos cards; 24px/32px entre blocos. `rounded-full` só em badges e amostras de cor.
- **Transições** de 200ms ease-out; foco com o contorno laranja do site.
- **A prévia é isolada:** os tokens editados viram variáveis CSS com escopo só no container da prévia.

### 3.3 Componentes shadcn/ui necessários

`input`, `label`, `textarea`, `native-select`, `tabs`, `accordion` e `alert-dialog`, escritos à mão no padrão new-york (a CLI do shadcn está bloqueada pelo sandbox), com pacotes `@radix-ui/react-*` do npm. Na etapa 4, o Select do Radix foi trocado pelo `native-select` (select nativo): melhor suporte a teclado, leitor de tela e celular, e listas com grupos sem código extra.

### 3.4 Acessibilidade

- Todos os campos com `<label>`; erros ligados por `aria-describedby` + `aria-invalid`.
- Abas com o padrão Radix (setas do teclado, `aria-selected`).
- Cada achado do lint é um botão que **leva o foco ao campo afetado**, abrindo a seção se necessário.
- Resumo do lint, "Copiado", "Download iniciado" e "Rascunho restaurado" anunciados em `aria-live="polite"`.
- Seletor de cor nativo com rótulo, sincronizado com o campo de texto.
- Confirmações destrutivas em `AlertDialog`, com foco inicial em "Cancelar".

## 4. Estrutura de arquivos

```
src/features/design-md/
  official/
    index.ts                 # wrapper do lint oficial + constante da versão (0.4.0)
    shims/{fs,path,url,process,module}.ts
  model/
    types.ts                 # Draft, ColorToken, TypographyToken, ScaleToken, Component, Guidance
    initial-state.ts         # exemplo do CESAR
    reducer.ts               # add/rename/update/remove por grupo, componentes, generate, reset
    references.ts            # id ↔ {grupo.nome}, uso de tokens por componente
    validation.ts            # validação do editor → EditorIssue { fieldId, message }
    storage.ts               # rascunho no localStorage (chave com prefixo e versão)
  generate/
    color-math.ts            # sRGB ↔ OKLab/OKLCH, contraste
    palette.ts               # geração determinística a partir de uma cor
  serialize/
    design-md.ts             # frontmatter (yaml) + corpo Markdown em pt-BR
    markdown.ts              # escape e seções derivadas
  lint/
    present.ts               # findings → pt-BR, severidade, fieldId
  hooks/
    use-design-system.ts     # reducer + pipeline derivado + autosave
  components/
    editor/                  # identity, quick-generate, color-list, typography-list,
                             # scale-list, component-list, component-editor, guidance
    preview/preview-panel.tsx
    lint/lint-panel.tsx
    output/design-md-output.tsx
    confirm-dialog.tsx
src/pages/design-md.tsx      # composição da página (substitui o "Em breve")
src/components/ui/           # novos componentes shadcn da seção 3.3
vite/design-md-shims.ts      # plugin Vite com alias restrito ao @google/design.md
```

## 5. Etapas de implementação

Cada etapa termina com `npm run check` passando e com algo navegável.

| # | Etapa | Entrega | Requisitos |
|---|---|---|---|
| 1 | **Infra** | `@google/design.md@0.4.0` e `yaml` fixados, pacotes Radix, plugin de *shims*, wrapper do lint, Vitest, `npm run check`, rota lazy + pré-carregamento, layout largo | Funcionamento, RF-10 |
| 2 | **Modelo e serialização** | Tipos, exemplo do CESAR, reducer, referências por id, `serializeDesignMd` em pt-BR, pipeline de lint, rascunho no `localStorage` + testes | RF-01, RF-03…07, RF-10 |
| 3 | **Editor: identidade, cores, tipografia, escalas** | Listas com contagem, adicionar/renomear/editar/remover, seletor de cor sincronizado, validação por campo | RF-01, RF-03, RF-04, RF-05 |
| 4 | **Editor: componentes** | `backgroundColor`, `textColor`, `typography`, `rounded`, `padding` (+ `size`, `height`, `width` opcionais), referência ou valor literal, "criar estado" (ex.: `-hover`) | RF-06 |
| 5 | **Orientações** | Overview, Elevation & Depth, Do's and Don'ts, com escape | RF-07 |
| 6 | **Lint** | Contagem, regra, local, mensagem pt-BR + original, estado vazio, foco no campo | RF-09 |
| 7 | **Prévia** | Título, texto, botões primário e secundário, card, input, amostras; fallback sinalizado | RF-08 |
| 8 | **Saída DESIGN.md** | Aba com o conteúdo, copiar (com fallback e aviso), baixar `DESIGN.md`, bloqueio com erros | RF-10, RF-12 |
| 9 | **Geração rápida** | Cor + "Gerar" com confirmação, preservação de nome/tipografia/textos | RF-02 |
| 10 | **Restaurar** | Confirmação, volta ao exemplo do CESAR e limpa o rascunho | RF-12 |
| 11 | **Acabamento** | Revisão de acessibilidade e responsividade, teste sem rede, README (versão fixada, diferenças, `npm run check`), build em `docs/` | Funcionamento, seção 7 |

## 6. Verificação automatizada (Vitest, rodando localmente)

| Área | Casos |
|---|---|
| Serialização | Nome/descrição com `#`, `:`, aspas, quebras de linha e emoji → `yaml.parse` do frontmatter devolve exatamente os valores; campos vazios não geram chaves; ordem canônica das seções; texto livre com `## ` não cria seção nova |
| Referências | Renomear token atualiza todas as refs; remover gera `broken-ref` com o `path` do componente |
| Contraste | Par < 4,5:1 → `contrast-ratio` com proporção; ajustar o par → o achado some |
| Geração | Mesma cor → saída idêntica (snapshot); a cor aparece em `primary`; pares `on-*` ≥ 4,5:1; sem erros de lint |
| Validação | Nome vazio, chave duplicada, cor inválida e dimensão inválida → mensagem específica + exportação bloqueada |
| Rascunho | Salva e restaura; rascunho de versão antiga ou JSON corrompido → volta ao exemplo sem quebrar |
| Paridade com a CLI | O `DESIGN.md` gerado (exemplo do CESAR e geração rápida) passa no **binário real** `designmd lint` (sem *shims*) com 0 erros, e os achados são iguais aos do bundle de navegador |
| Bundle de navegador | O módulo com *shims* carrega sem `process`, `Buffer` e `require` globais |

**Verificação manual** (documentada no README): os critérios de aceitação aplicáveis, incluindo o teste sem rede pelo DevTools (Network → Offline) e a checagem no endereço publicado do GitHub Pages. Testes de interface no navegador (Playwright) ficam de fora, porque o sandbox não permite baixar navegadores.

## 7. Diferenças deliberadas em relação aos requisitos e à referência (a documentar)

- **Só a saída `DESIGN.md`.** CSS Variables, Tailwind v4 e DTCG JSON (RF-11) foram removidos do escopo. Os critérios 1 e 5 passam a valer para o `DESIGN.md`.
- Texto derivado do `DESIGN.md` e mensagens do lint em pt-BR (mantendo a mensagem original da CLI como detalhe).
- Renomear tokens atualiza as referências automaticamente; remover um token em uso pede confirmação e deixa `broken-ref` visível.
- As regras seguem a CLI 0.4.0 (11 regras), não as 8 da página de referência.
- Contraste: a CLI 0.4.0 só reporta pares reprovados e **ignora a transparência** (o `button-secondary` do CESAR, com fundo `transparent`, é avaliado como fundo preto e passa, embora sobre branco tenha 3,17:1). A ferramenta mostra os pares aprovados como informação e os que têm transparência como aviso de "contraste não verificável" (origem "Editor"), com a mesma função `contrastRatio` da biblioteca.
- Uso sem rede vale enquanto a aba estiver aberta; não há service worker.
- Controles e fluxo definidos pelo texto dos requisitos, sem consulta à página de referência.
