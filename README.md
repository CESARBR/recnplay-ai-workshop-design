# Do Prompt ao Protótipo: Criando Interfaces com IA

Site de apoio da oficina do CESAR. React + Vite + Tailwind CSS v4 + shadcn/ui, com identidade visual definida em [`DESIGN.md`](./DESIGN.md).

## Rotas

- `/#/` — início
- `/#/agentsmd` — download dos 5 AGENTS.md
- `/#/designmd` — gerador de DESIGN.md (em breve)

## Desenvolvimento

```bash
npm install
npm run dev
```

## Publicação (GitHub Pages)

O build é gerado em `docs/` e **commitado** no repositório — não há GitHub Actions.

```bash
npm run build
git add docs && git commit -m "build: atualiza site"
git push
```

No GitHub: **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `/docs`**.

## Onde editar

- AGENTS.md: arquivos em `public/agents/*.md` e metadados em `src/data/agents.ts`.
- Tokens de design: `src/index.css` (mapeia o `DESIGN.md` para as variáveis do shadcn/ui).
- Componentes shadcn/ui: `src/components/ui/` (configuração em `components.json`).
