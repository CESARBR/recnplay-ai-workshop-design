import { describe, expect, it } from 'vitest'

import { collectProblems } from '../lint/present'
import { buildDesignMd } from '../pipeline'
import { apply, componentId, initialDraft, tokenId } from '../test/draft-helpers'
import type { Draft } from '../model/types'

const previewOf = (draft: Draft) => buildDesignMd(draft).preview

describe('modelo da prévia', () => {
  it('aplica os tokens do exemplo da ACME', () => {
    const preview = previewOf(initialDraft())

    expect(preview.page).toMatchObject({ backgroundColor: 'rgb(247 248 249 / 1)', color: 'rgb(32 24 19 / 1)' })
    expect(preview.title).toMatchObject({
      fontFamily: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
      fontSize: '3rem',
      fontWeight: '700',
    })
    expect(preview.body).toMatchObject({ fontSize: '1rem', fontWeight: '400' })
    expect(preview.missingComponents).toEqual([])
  })

  it('componentes usam cores resolvidas e medidas do editor (inclusive várias medidas)', () => {
    const { components } = previewOf(initialDraft())

    expect(components['button-primary'].style).toEqual({
      borderRadius: '6px',
      padding: '12px 20px',
      '--preview-bg': 'rgb(204 77 0 / 1)',
      '--preview-fg': 'rgb(255 255 255 / 1)',
    })
    expect(components['button-secondary'].style).toMatchObject({ '--preview-bg': 'rgb(255 255 255 / 1)' })
    expect(components.card.style).toMatchObject({ borderRadius: '12px', padding: '20px' })
  })

  it('usa o estado -hover quando existe', () => {
    let draft = initialDraft()
    const button = componentId(draft, 'button-primary')
    draft = apply(draft, { type: 'addComponentState', id: button, state: 'hover', newId: 'hover' })
    draft = apply(draft, {
      type: 'setComponentProperty',
      id: 'hover',
      property: 'backgroundColor',
      value: { kind: 'literal', value: '#C24A00' },
    })
    const button_ = previewOf(draft).components['button-primary']

    expect(button_.hasHover).toBe(true)
    expect(button_.style).toMatchObject({ '--preview-hover-bg': 'rgb(194 74 0 / 1)' })
  })

  it('converte cores em outros formatos para sRGB', () => {
    let draft = initialDraft()
    draft = apply(draft, {
      type: 'updateToken',
      group: 'colors',
      id: tokenId(draft, 'colors', 'tertiary'),
      patch: { value: 'oklch(0.6 0.2 40)' },
    })

    expect(previewOf(draft).components['button-primary'].style).toMatchObject({
      '--preview-bg': expect.stringMatching(/^rgb\(\d+ \d+ \d+ \/ 1\)$/),
    })
  })

  it('sem altura de linha no token, usa valores relativos (título 1.2, texto 1.5)', () => {
    const preview = previewOf(initialDraft())

    expect(preview.title.lineHeight).toBe('1.2')
    expect(preview.body.lineHeight).toBe('1.5')
    expect(preview.page.lineHeight).toBe('1.5')
  })

  it('mantém a altura da linha sem unidade (que a biblioteca descarta)', () => {
    let draft = initialDraft()
    draft = apply(draft, {
      type: 'updateToken',
      group: 'typography',
      id: tokenId(draft, 'typography', 'h1'),
      patch: { lineHeight: '1.2', letterSpacing: '-0.02em' },
    })

    expect(previewOf(draft).title).toMatchObject({ lineHeight: '1.2', letterSpacing: '-0.02em' })
  })

  it('escolhe o maior estilo para o título quando não há nome conhecido', () => {
    let draft = initialDraft()
    draft = apply(draft, {
      type: 'updateToken',
      group: 'typography',
      id: tokenId(draft, 'typography', 'h1'),
      patch: { name: 'grande' },
    })

    expect(previewOf(draft).title).toMatchObject({ fontSize: '3rem' })
  })

  it('componente ausente: estilo neutro e informação no painel de problemas', () => {
    let draft = initialDraft()
    draft = apply(draft, { type: 'renameComponent', id: componentId(draft, 'card'), name: 'painel' })
    const build = buildDesignMd(draft)

    expect(build.preview.components.card.missing).toBe(true)
    expect(build.preview.missingComponents).toEqual(['card'])
    expect(collectProblems(build)).toContainEqual(
      expect.objectContaining({ severity: 'info', title: 'Prévia com estilo neutro', message: expect.stringContaining('“card”') }),
    )
  })

  it('referência quebrada não quebra a prévia: a cor fica de fora', () => {
    let draft = initialDraft()
    draft = apply(draft, { type: 'removeToken', group: 'colors', id: tokenId(draft, 'colors', 'surface') })
    const card = previewOf(draft).components.card

    expect(card.missing).toBe(false)
    expect(card.style).not.toHaveProperty('--preview-bg')
    expect(card.style).toMatchObject({ '--preview-fg': 'rgb(32 24 19 / 1)' })
  })

  it('amostras de cor incluem valor original e marcam cores inválidas', () => {
    let draft = initialDraft()
    draft = apply(draft, { type: 'updateToken', group: 'colors', id: tokenId(draft, 'colors', 'border'), patch: { value: 'cinza' } })
    const swatches = previewOf(draft).swatches

    expect(swatches).toHaveLength(7)
    expect(swatches[0]).toEqual({ name: 'primary', value: '#201813', css: 'rgb(32 24 19 / 1)', translucent: false })
    expect(swatches.find((swatch) => swatch.name === 'border')).toMatchObject({ value: 'cinza', css: undefined })
  })
})
