# Do Prompt ao Protótipo: Criando Interfaces com IA

Site de apoio da oficina do CESAR. React + Vite + Tailwind CSS v4 + shadcn/ui, com identidade visual definida em [`DESIGN.md`](./DESIGN.md). Site estático, publicado no GitHub Pages a partir da pasta `docs/`.

## Rotas

- `/#/` — início
- `/#/projetos` — download dos 5 projetos (ZIP), um por proposta de app (`/#/agentsmd` redireciona para cá)
- `/#/designmd` — gerador de DESIGN.md

## Desenvolvimento

```bash
npm install
npm run dev     # abre em http://localhost:5173/#/
```

## Verificação

```bash
npm test        # Vitest: unidade + interface (jsdom)
npm run check   # testes + build + verificação do docs/ — rode sempre antes de publicar
```

O `npm run check` termina com `scripts/verify-build.mjs`, que confere o build publicado:
caminhos relativos, nenhum módulo do Node no navegador, gerador num chunk separado
carregado sob demanda e sem chamadas de rede.

## Publicação (GitHub Pages)

O build é gerado em `docs/` e **commitado** no repositório — não há GitHub Actions, então os
testes não rodam no push: use `npm run check` antes de commitar.

```bash
npm run check
git add docs && git commit -m "build: atualiza site"
git push
```

No GitHub: **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `/docs`**.

> Nesta máquina o npm usa um mirror interno; antes de commitar, confira se o `package-lock.json`
> não ficou com endereços `npm.apple.com` (troque por `registry.npmjs.org`).

## Onde editar

- Projetos: ZIPs em `public/projects/<slug>.zip` e metadados em `src/data/projects.ts`
  (o teste `src/pages/projects.test.tsx` confere se cada projeto listado tem o seu ZIP).
- Tokens de design: `src/index.css` (mapeia o `DESIGN.md` para as variáveis do shadcn/ui).
- Componentes shadcn/ui: `src/components/ui/` (configuração em `components.json`).
- Gerador de DESIGN.md: `src/features/design-md/` (ver abaixo).

## Gerador de DESIGN.md

Ferramenta para montar, visualizar, validar e exportar um `DESIGN.md`, a partir dos requisitos em
[`REQUISITOS_DESIGN_MD_GENERATOR.md`](./REQUISITOS_DESIGN_MD_GENERATOR.md) e do plano em
[`PLANO_DESIGN_MD_GENERATOR.md`](./PLANO_DESIGN_MD_GENERATOR.md).

### Versão da especificação e da CLI

| Item | Versão |
|---|---|
| Formato gerado (`version:`) | `alpha` |
| CLI/biblioteca oficial | [`@google/design.md`](https://www.npmjs.com/package/@google/design.md) **0.4.0** (fixada, sem `^`) |

O lint roda no navegador com a **própria biblioteca oficial**. Ela foi feita para Node (lê um YAML
do disco e importa módulos `node:*`); o plugin `vite/design-md-shims.ts` troca esses módulos por
substitutos simples só para ela. Os testes comparam o resultado do app com o **binário real da CLI**
e executam o lint empacotado num contexto sem APIs do Node.

Para atualizar a versão: mude-a no `package.json` e em `src/features/design-md/official/index.ts`,
confira as traduções das mensagens em `src/features/design-md/lint/present.ts` e rode `npm run check`.

### Como funciona

```
Editor (estado com ids estáveis) ⇄ rascunho no localStorage
   → texto DESIGN.md (frontmatter YAML + corpo em pt-BR, seções na ordem da spec)
   → lint oficial → painel de problemas, prévia e exportação
```

Tudo roda no navegador: nada é enviado a servidor. Depois de carregada, a ferramenta funciona
sem rede (enquanto a aba estiver aberta; não há service worker).

| Pasta | Conteúdo |
|---|---|
| `official/` | acesso à biblioteca oficial e shims de Node |
| `model/` | tipos, exemplo da ACME, reducer, referências, validação, rascunho |
| `serialize/` | geração do texto DESIGN.md |
| `lint/` | problemas em pt-BR (traduções, locais, contraste) |
| `preview/` | modelo da prévia |
| `generate/` | geração da paleta a partir de uma cor (OKLCH) |
| `export/` | copiar e baixar |
| `components/` | interface (editor, prévia, painel, exportação) |

### Diferenças deliberadas em relação aos requisitos e à referência

- **Só a saída `DESIGN.md`** (copiar e baixar). CSS Variables, Tailwind v4 e DTCG JSON (RF-11) ficaram fora do escopo.
- **Orientações simplificadas**: só "Visão geral" (`## Overview`) e "O que fazer e o que evitar" (`## Do's and Don'ts`), em texto comum, sem Markdown (cada linha das regras vira um item de lista). "Elevation & Depth" (pedida no RF-07) e as notas complementares das seções derivadas foram removidas a pedido.
- **Texto em pt-BR**: o corpo derivado dos tokens e as mensagens do lint são em pt-BR; os títulos das seções seguem os nomes canônicos em inglês exigidos pela spec. A mensagem original da CLI aparece como detalhe.
- **Referências por id**: renomear um token atualiza as referências; remover um token em uso pede confirmação e deixa o erro `broken-ref` visível.
- **Regras da CLI 0.4.0** (11 regras), não as 8 da página de referência.
- **Validação complementar**: a CLI 0.4.0 não valida nome vazio, chaves duplicadas, valores de `spacing` nem valores literais de componentes; o editor cobre essas lacunas (cores literais usam o parser da própria biblioteca).
- **"Cor sem uso" não é relatada**: o aviso `orphaned-tokens` da CLI fica fora do painel e das contagens (cores de apoio, como `neutral` e `border`, são esperadas sem componente). A CLI real continua apontando esse aviso no arquivo.
- **Contraste**: a CLI só reporta pares reprovados e ignora transparência; a ferramenta mostra os aprovados como informação e os com transparência como aviso de "contraste não verificável".
- **Prévia**: usa as cores resolvidas pela biblioteca, mas medidas e tipografia do editor (a biblioteca descarta `lineHeight` sem unidade e padding com várias medidas). Não baixa fontes.
- **Uso sem rede** vale enquanto a aba estiver aberta.
- A página de referência (design.dev) não pôde ser consultada; controles e fluxo seguem o texto dos requisitos.

### Roteiro de verificação manual (Safari, Chrome ou Firefox)

Os testes automatizados rodam em jsdom; estes pontos dependem de um navegador real.
Abra `npm run dev` → `http://localhost:5173/#/designmd` (e, depois de publicar, o endereço do GitHub Pages).

1. **Visual e layout**: editor à esquerda e painel "Resultado" fixo à direita (≥ 1024px); abaixo disso, uma coluna com a barra "Ver resultado" no rodapé. Teste também em 375px.
2. **Prévia**: botões, card, campo e amostras aplicam os tokens; passar o mouse no botão principal mostra o `button-primary-hover` (depois de gerar um sistema).
3. **Seletor de cor nativo**: escolher uma cor atualiza o campo de texto e a prévia.
4. **Teclado**: Tab percorre o editor; setas trocam as abas; Esc fecha as confirmações; "Ir para o campo" leva o foco ao campo certo.
5. **Leitor de tela (VoiceOver: ⌘F5)**: campos com erro anunciam "Erro: …"; o resumo e "DESIGN.md copiado…" são anunciados.
6. **Copiar e baixar**: o arquivo baixado se chama `DESIGN.md` e é idêntico à aba DESIGN.md; o texto colado também.
7. **Sem rede**: carregue a home, desligue a rede (DevTools → Network → Offline, ou Wi-Fi), navegue até `/#/designmd`, edite, copie e baixe.
8. **Rascunho**: edite, recarregue a página e confira "Continuando o rascunho salvo…"; "Restaurar exemplo" volta ao exemplo da ACME.
9. **CLI real**: `npx @google/design.md@0.4.0 lint DESIGN.md` no arquivo baixado não aponta erros.
