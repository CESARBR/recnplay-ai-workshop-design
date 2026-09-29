import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Plugin } from 'vite'

// A biblioteca oficial `@google/design.md` foi feita para Node: ao carregar, lê o
// `spec-config.yaml` do disco e importa módulos `node:*`. Este plugin permite rodá-la
// no navegador (o site é estático, no GitHub Pages):
// - troca os imports `node:*` por substitutos simples, APENAS quando quem importa é a
//   própria biblioteca — o resto do app e os testes em Node continuam com os módulos reais;
// - embute o `spec-config.yaml` no bundle como texto (módulo virtual).

const LIB_DIR = `${join('node_modules', '@google', 'design.md')}`
const SHIMS_DIR = fileURLToPath(new URL('../src/features/design-md/official/shims/', import.meta.url))
const SPEC_CONFIG_ID = 'virtual:design-md-spec-config'
const RESOLVED_SPEC_CONFIG_ID = `\0${SPEC_CONFIG_ID}`

const SHIMMED_MODULES = ['fs', 'path', 'url', 'process', 'module'] as const

export function designMdShims(): Plugin {
  // Caminho do spec-config.yaml ao lado do bundle do linter que importou `node:fs`.
  let specConfigPath: string | undefined

  return {
    name: 'design-md-shims',
    enforce: 'pre',
    resolveId(source, importer) {
      if (source === SPEC_CONFIG_ID) return RESOLVED_SPEC_CONFIG_ID
      if (!importer?.includes(LIB_DIR) || !source.startsWith('node:')) return null

      const name = source.slice('node:'.length) as (typeof SHIMMED_MODULES)[number]
      if (!SHIMMED_MODULES.includes(name)) {
        this.error(`design-md-shims: import não previsto "${source}" em ${importer}`)
      }
      if (name === 'fs') specConfigPath = join(dirname(importer), 'spec-config.yaml')
      return join(SHIMS_DIR, `${name}.ts`)
    },
    load(id) {
      if (id !== RESOLVED_SPEC_CONFIG_ID) return null
      if (!specConfigPath) this.error('design-md-shims: spec-config.yaml não localizado')
      this.addWatchFile(specConfigPath)
      return `export default ${JSON.stringify(readFileSync(specConfigPath, 'utf-8'))}`
    },
  }
}
