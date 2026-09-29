import { describe, expect, it } from 'vitest'

import { buildDesignMd } from '../pipeline'
import { serializeDesignMd } from '../serialize/design-md'
import { runCliLint } from '../test/cli'
import { apply, initialDraft, parseFrontmatter } from '../test/draft-helpers'
import { oklchToRgb, rgbToOklch } from './color-math'
import { generateFromColor } from './palette'

function generatedDraft(color: string) {
  const draft = initialDraft()
  const generated = generateFromColor(color, draft)
  if (!generated) throw new Error(`cor inválida: ${color}`)
  return apply(draft, { type: 'applyGenerated', generated })
}

const BRAND_COLORS = ['#F76003', '#0055AA', '#FFEB3B', '#000000', '#FFFFFF', '#2E7D32', 'oklch(0.68 0.2 45)', 'rebeccapurple']

describe('geração a partir de uma cor', () => {
  it('é determinística: a mesma cor gera o mesmo DESIGN.md', () => {
    expect(serializeDesignMd(generatedDraft('#0055AA'))).toBe(serializeDesignMd(generatedDraft('#0055AA')))
  })

  it('cores diferentes geram sistemas diferentes', () => {
    expect(serializeDesignMd(generatedDraft('#0055AA'))).not.toBe(serializeDesignMd(generatedDraft('#F76003')))
  })

  it.each(BRAND_COLORS)('mantém a cor informada (%s) exatamente como digitada em primary', (color) => {
    expect(parseFrontmatter(serializeDesignMd(generatedDraft(color))).colors.primary).toBe(color)
  })

  it.each(BRAND_COLORS)('%s: todos os pares texto/fundo passam de 4,5:1 e a CLI real não aponta erros', (color) => {
    const build = buildDesignMd(generatedDraft(color))

    expect(build.contrastChecks.map((check) => [check.componentName, check.status])).toEqual([
      ['button-primary', 'pass'],
      ['button-primary-hover', 'pass'],
      ['button-secondary', 'pass'],
      ['card', 'pass'],
      ['input', 'pass'],
    ])
    expect(build.canExport).toBe(true)
    expect(runCliLint(build.content).summary.errors).toBe(0)
  })

  it('o hover nunca tem menos contraste que o estado normal', () => {
    for (const color of BRAND_COLORS) {
      const checks = buildDesignMd(generatedDraft(color)).contrastChecks
      const ratio = (name: string) => checks.find((check) => check.componentName === name)!.ratio
      expect(ratio('button-primary-hover')).toBeGreaterThanOrEqual(ratio('button-primary'))
    }
  })

  it('gera tokens, escalas e componentes com referências aos tokens', () => {
    const data = parseFrontmatter(serializeDesignMd(generatedDraft('#0055AA')))

    expect(Object.keys(data.colors)).toEqual([
      'primary',
      'on-primary',
      'primary-hover',
      'secondary',
      'on-secondary',
      'tertiary',
      'neutral',
      'surface',
      'on-surface',
      'border',
      'error',
      'on-error',
    ])
    expect(data.spacing).toEqual({ xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' })
    expect(data.rounded).toEqual({ none: '0px', sm: '4px', md: '8px', lg: '12px', full: '9999px' })
    expect(data.components['button-primary']).toMatchObject({
      backgroundColor: '{colors.primary}',
      textColor: '{colors.on-primary}',
      rounded: '{rounded.md}',
    })
    expect(data.components.card).toMatchObject({ padding: '{spacing.lg}', typography: '{typography.body-md}' })
    expect(data.components['button-primary'].typography).toBe('{typography.label-caps}')
  })

  it.each([
    ['#0055AA', '{colors.primary}'],
    ['#FFEB3B', '{colors.on-surface}'],
  ])('botão secundário com fundo surface; texto %s → %s', (color, text) => {
    const data = parseFrontmatter(serializeDesignMd(generatedDraft(color)))

    expect(data.components['button-secondary']).toMatchObject({ backgroundColor: '{colors.surface}', textColor: text })
  })

  it('preserva nome, descrição, tipografia e orientações', () => {
    const before = initialDraft()
    const after = generatedDraft('#0055AA')

    expect(after.name).toBe(before.name)
    expect(after.description).toBe(before.description)
    expect(after.guidance).toEqual(before.guidance)
    expect(after.typography.map(({ id: _id, ...token }) => token)).toEqual(before.typography.map(({ id: _id, ...token }) => token))
  })

  it('sem tipografia compatível, os componentes não referenciam tipografia', () => {
    let draft = initialDraft()
    draft = apply(draft, ...draft.typography.map((token) => ({ type: 'removeToken' as const, group: 'typography' as const, id: token.id })))
    const generated = generateFromColor('#0055AA', draft)!

    expect(generated.components.every((component) => !component.properties.typography)).toBe(true)
  })

  it.each(['', 'azul-marca', '#12'])('cor inválida (%s) não gera nada', (color) => {
    expect(generateFromColor(color, initialDraft())).toBeUndefined()
  })
})

describe('conversão OKLCH', () => {
  it.each([
    { r: 247, g: 96, b: 3 },
    { r: 0, g: 85, b: 170 },
    { r: 255, g: 255, b: 255 },
    { r: 0, g: 0, b: 0 },
  ])('ida e volta preserva a cor %o', (rgb) => {
    expect(oklchToRgb(rgbToOklch(rgb))).toEqual(rgb)
  })

  it('cores fora do gamut são trazidas para sRGB válido', () => {
    const { r, g, b } = oklchToRgb({ l: 0.7, c: 0.5, h: 150 })
    for (const channel of [r, g, b]) expect(channel).toBeGreaterThanOrEqual(0)
    for (const channel of [r, g, b]) expect(channel).toBeLessThanOrEqual(255)
  })
})
