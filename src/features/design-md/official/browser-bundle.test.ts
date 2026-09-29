// Garante que o lint oficial funciona no NAVEGADOR (site estático no GitHub Pages):
// empacota o módulo com o mesmo plugin de shims do build e o executa num contexto
// isolado, sem `process`, `Buffer`, `require` nem qualquer API do Node.
import { fileURLToPath } from 'node:url'
import { createContext, runInContext } from 'node:vm'

import { build, type Rolldown } from 'vite'
import { beforeAll, describe, expect, it } from 'vitest'

import { designMdShims } from '../../../../vite/design-md-shims.ts'
import { runCliLint } from '../test/cli'
import { brokenDesignMd, cesarDesignMd } from '../test/fixtures'
import type * as Official from '.'

let official: typeof Official
let bundleCode: string
let nodeGlobalsInContext: string

beforeAll(async () => {
  const output = (await build({
    configFile: false,
    logLevel: 'silent',
    plugins: [designMdShims()],
    build: {
      write: false,
      minify: false,
      lib: { entry: fileURLToPath(new URL('./index.ts', import.meta.url)), formats: ['iife'], name: 'DesignMdOfficial' },
    },
  })) as Rolldown.RolldownOutput[]
  bundleCode = output[0].output[0].code

  // Apenas globais que existem em qualquer navegador moderno.
  const browserGlobals = { console, URL, TextEncoder, TextDecoder, structuredClone, queueMicrotask, setTimeout, clearTimeout }
  const context = createContext({ ...browserGlobals })
  nodeGlobalsInContext = runInContext('[typeof process, typeof Buffer, typeof require].join()', context)
  runInContext(`${bundleCode}\nglobalThis.DesignMdOfficial = DesignMdOfficial;`, context)
  official = (context as { DesignMdOfficial: typeof Official }).DesignMdOfficial
}, 60_000)

describe('lint oficial empacotado para o navegador', () => {
  it('executa num contexto sem as APIs do Node', () => {
    expect(nodeGlobalsInContext).toBe('undefined,undefined,undefined')
  })

  it('não contém imports de módulos do Node', () => {
    expect(bundleCode).not.toMatch(/\bfrom\s*["']node:/)
    expect(bundleCode).not.toMatch(/\brequire\(["'](?:node:)?(?:fs|path|url|module)["']\)/)
  })

  it.each([
    ['DESIGN.md do CESAR', cesarDesignMd],
    ['referência quebrada e dimensão inválida', brokenDesignMd],
  ])('roda sem APIs do Node e bate com a CLI real: %s', (_, content) => {
    const result = official.lintDesignMd(content)
    const cli = runCliLint(content)

    // O contexto isolado tem outro `Array`/`Object`; normaliza antes de comparar.
    expect(JSON.parse(JSON.stringify(result.findings))).toEqual(cli.findings)
    expect(JSON.parse(JSON.stringify(result.summary))).toEqual(cli.summary)
  })
})
