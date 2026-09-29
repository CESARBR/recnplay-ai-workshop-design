import { describe, expect, it } from 'vitest'

import { buildDesignMd } from '../pipeline'
import { apply, componentId, initialDraft, parseFrontmatter, tokenId } from '../test/draft-helpers'
import { fieldIds } from './field-ids'
import { findTokenUsages } from './references'

describe('referências entre componentes e tokens', () => {
  it('fluxo encadeado: adicionar, renomear, associar e alterar a cor mantém a referência válida', () => {
    const newId = 'cor-nova'
    let draft = apply(initialDraft(), { type: 'addToken', group: 'colors', id: newId })
    draft = apply(
      draft,
      { type: 'updateToken', group: 'colors', id: newId, patch: { name: 'accent' } },
      {
        type: 'setComponentProperty',
        id: componentId(draft, 'card'),
        property: 'backgroundColor',
        value: { kind: 'ref', group: 'colors', tokenId: newId },
      },
      { type: 'updateToken', group: 'colors', id: newId, patch: { value: '#123456' } },
    )
    const build = buildDesignMd(draft)
    const data = parseFrontmatter(build.content)

    expect(draft.colors).toHaveLength(8)
    expect(data.colors.accent).toBe('#123456')
    expect(data.components.card.backgroundColor).toBe('{colors.accent}')
    expect(build.findings.filter((finding) => finding.rule === 'broken-ref')).toEqual([])
    expect(build.canExport).toBe(true)
  })

  it('renomear um token atualiza todas as referências', () => {
    let draft = initialDraft()
    draft = apply(draft, {
      type: 'updateToken',
      group: 'colors',
      id: tokenId(draft, 'colors', 'tertiary'),
      patch: { name: 'brand' },
    })
    const data = parseFrontmatter(buildDesignMd(draft).content)

    expect(data.colors).toHaveProperty('brand')
    expect(data.colors).not.toHaveProperty('tertiary')
    expect(data.components['button-primary'].backgroundColor).toBe('{colors.brand}')
    expect(data.components['button-secondary'].textColor).toBe('{colors.brand}')
  })

  it('remover um token em uso gera broken-ref visível e localizado no campo', () => {
    let draft = initialDraft()
    const tertiary = tokenId(draft, 'colors', 'tertiary')
    expect(findTokenUsages(draft, 'colors', tertiary).map((usage) => usage.componentName)).toEqual([
      'button-primary',
      'button-secondary',
    ])

    draft = apply(draft, { type: 'removeToken', group: 'colors', id: tertiary })
    const build = buildDesignMd(draft)
    const brokenRefs = build.findings.filter((finding) => finding.rule === 'broken-ref')

    expect(brokenRefs.map((finding) => finding.path)).toEqual(['components.button-primary', 'components.button-secondary'])
    expect(brokenRefs[0].fieldId).toBe(fieldIds.component(componentId(draft, 'button-primary'), 'backgroundColor'))
    expect(brokenRefs[1].fieldId).toBe(fieldIds.component(componentId(draft, 'button-secondary'), 'textColor'))
    expect(build.canExport).toBe(false)
  })

  it('recriar um token com o nome removido reconecta as referências', () => {
    let draft = initialDraft()
    draft = apply(draft, { type: 'removeToken', group: 'colors', id: tokenId(draft, 'colors', 'tertiary') })
    draft = apply(draft, { type: 'addToken', group: 'colors', id: 'recriado' })
    draft = apply(draft, { type: 'updateToken', group: 'colors', id: 'recriado', patch: { name: 'tertiary' } })

    const background = draft.components.find((component) => component.name === 'button-primary')?.properties.backgroundColor
    expect(background).toEqual({ kind: 'ref', group: 'colors', tokenId: 'recriado' })
    expect(buildDesignMd(draft).findings.filter((finding) => finding.rule === 'broken-ref')).toEqual([])
  })

  it('cria estados de componente como entradas separadas relacionadas pelo nome', () => {
    let draft = initialDraft()
    const buttonId = componentId(draft, 'button-primary')
    draft = apply(draft, { type: 'addComponentState', id: buttonId, state: 'hover', newId: 'hover' })
    draft = apply(draft, { type: 'addComponentState', id: buttonId, state: 'hover', newId: 'hover-2' })

    expect(draft.components.map((component) => component.name).slice(0, 3)).toEqual([
      'button-primary',
      'button-primary-hover-2',
      'button-primary-hover',
    ])
    expect(parseFrontmatter(buildDesignMd(draft).content).components['button-primary-hover']).toEqual(
      parseFrontmatter(buildDesignMd(draft).content).components['button-primary'],
    )
  })

  it('novos tokens recebem nomes livres', () => {
    const draft = apply(initialDraft(), { type: 'addToken', group: 'colors' }, { type: 'addToken', group: 'colors' })

    expect(draft.colors.slice(-2).map((token) => token.name)).toEqual(['cor-1', 'cor-2'])
  })

  it('restaurar volta ao exemplo completo', () => {
    let draft = apply(initialDraft(), { type: 'setName', name: 'Outro' }, { type: 'addComponent' })
    draft = apply(draft, { type: 'removeToken', group: 'spacing', id: tokenId(draft, 'spacing', 'md') })
    draft = apply(draft, { type: 'reset' })

    expect(buildDesignMd(draft).content).toBe(buildDesignMd(initialDraft()).content)
  })
})
