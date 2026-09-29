// Verificações do build publicado em docs/ (GitHub Pages, sem servidor).
// Roda depois do `vite build` no `npm run check`.
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const DOCS = new URL('../docs/', import.meta.url).pathname
const ASSETS = join(DOCS, 'assets')
const failures = []
const check = (ok, message) => ok || failures.push(message)

const html = readFileSync(join(DOCS, 'index.html'), 'utf-8')
const chunks = readdirSync(ASSETS).filter((file) => file.endsWith('.js'))
const read = (file) => readFileSync(join(ASSETS, file), 'utf-8')

// 1. Caminhos relativos: o site precisa funcionar em usuario.github.io/<repo>/.
for (const [, url] of html.matchAll(/(?:src|href)="([^"]+)"/g))
  check(url.startsWith('./') || url.startsWith('https://'), `index.html usa caminho absoluto: ${url}`)

// 2. Nenhum import de módulo do Node no navegador (os shims do @google/design.md funcionaram).
for (const file of chunks)
  check(!/\bfrom\s*["']node:|require\(["']node:/.test(read(file)), `${file} importa um módulo do Node`)

// 3. O gerador é um chunk separado, carregado sob demanda pelo chunk principal.
const designMdChunks = chunks.filter((file) => file.startsWith('design-md-'))
check(designMdChunks.length === 1, `esperado 1 chunk design-md, encontrados ${designMdChunks.length}`)
const entry = chunks.find((file) => html.includes(`assets/${file}`))
check(Boolean(entry), 'chunk principal não referenciado no index.html')
if (entry && designMdChunks[0])
  check(read(entry).includes(designMdChunks[0]), 'o chunk principal não referencia o chunk do gerador')

// 4. Sem rede depois de carregado: o gerador não faz chamadas de rede.
if (designMdChunks[0]) {
  const code = read(designMdChunks[0])
  for (const api of ['fetch(', 'XMLHttpRequest', 'WebSocket', 'sendBeacon', 'EventSource', 'importScripts'])
    check(!code.includes(api), `o chunk do gerador usa ${api}`)
}

// 5. Larguras não podem vir da escala de espaçamento do DESIGN.md (sm/md/lg = 8/24/32px):
//    `max-w-lg` virou `max-width: var(--spacing-lg)` e quebrou o diálogo de confirmação.
for (const file of readdirSync(ASSETS).filter((name) => name.endsWith('.css'))) {
  const sizing = readFileSync(join(ASSETS, file), 'utf-8').match(/(?:max-|min-)?(?:width|height):var\(--spacing-(?:sm|md|lg)\)/g)
  check(!sizing, `${file} usa a escala de espaçamento como largura/altura: ${sizing?.join(', ')}`)
}

// 6. Cursor de clique nos botões (o preflight do Tailwind v4 deixa o cursor padrão).
const css = readdirSync(ASSETS).filter((name) => name.endsWith('.css')).map((name) => readFileSync(join(ASSETS, name), 'utf-8')).join('')
check(/button:not\(:disabled\)[^{]*\{[^}]*cursor:pointer/.test(css), 'regra de cursor: pointer para botões ausente do CSS')

// 7. Arquivos estáticos do site, inclusive os 5 projetos (ZIP) oferecidos para download.
const listed = (dir) => readdirSync(join(DOCS, dir))
for (const file of ['.nojekyll', 'favicon.svg', 'logo.webp']) check(listed('.').includes(file), `docs/${file} ausente`)
const zips = listed('projects').filter((file) => file.endsWith('.zip'))
check(zips.length === 5, `esperados 5 projetos em docs/projects, encontrados ${zips.length}`)

if (failures.length) {
  console.error(`verify-build: ${failures.length} problema(s)\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
console.log(`verify-build: ok (${chunks.length} chunks; gerador em ${designMdChunks[0]})`)
