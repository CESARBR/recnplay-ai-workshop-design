import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { parse } from 'yaml'
import { describe, expect, it } from 'vitest'

import { CLI_PACKAGE_DIR, runCliLint } from '../test/cli'
import { brokenDesignMd, cesarDesignMd, oklchDesignMd } from '../test/fixtures'
import { DESIGN_MD_CLI_VERSION, DESIGN_MD_SPEC_VERSION, lintDesignMd } from '.'

describe('biblioteca oficial @google/design.md', () => {
  it('usa a versão fixada da CLI e da especificação', () => {
    const pkg = JSON.parse(readFileSync(join(CLI_PACKAGE_DIR, 'package.json'), 'utf-8'))
    const specConfig = parse(readFileSync(join(CLI_PACKAGE_DIR, 'dist', 'spec-config.yaml'), 'utf-8'))

    expect(pkg.version).toBe(DESIGN_MD_CLI_VERSION)
    expect(specConfig.version).toBe(DESIGN_MD_SPEC_VERSION)
  })

  it.each([
    ['DESIGN.md do CESAR', cesarDesignMd],
    ['referência quebrada e dimensão inválida', brokenDesignMd],
    ['cor em oklch()', oklchDesignMd],
  ])('dá o mesmo resultado que a CLI real: %s', (_, content) => {
    const app = lintDesignMd(content)
    const cli = runCliLint(content)

    expect(app.findings).toEqual(cli.findings)
    expect(app.summary).toEqual(cli.summary)
  })

  it('detecta referência quebrada e dimensão inválida', () => {
    const { findings, summary } = lintDesignMd(brokenDesignMd)

    expect(summary.errors).toBe(2)
    expect(findings).toContainEqual(
      expect.objectContaining({ rule: 'broken-ref', path: 'components.button-primary' }),
    )
    expect(findings).toContainEqual(expect.objectContaining({ path: 'rounded.sm', severity: 'error' }))
  })
})
