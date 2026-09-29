import { describe, expect, it } from 'vitest'

import { runCliLint } from '../test/cli'
import { apply, initialDraft, parseFrontmatter, sectionHeadings, tokenId } from '../test/draft-helpers'
import { lintDesignMd } from '../official'
import { serializeDesignMd } from './design-md'

/** Seções do exemplo, na ordem canônica (Elevation & Depth não é gerada pelo editor). */
const EXAMPLE_ORDER = ['Overview', 'Colors', 'Typography', 'Layout', 'Shapes', 'Components', "Do's and Don'ts"]

describe('serializeDesignMd', () => {
  it('gera o exemplo da ACME aceito pela CLI real, sem erros', () => {
    const content = serializeDesignMd(initialDraft())
    const cli = runCliLint(content)

    expect(cli.summary.errors).toBe(0)
    expect(lintDesignMd(content).findings).toEqual(cli.findings)
  })

  it('mantém os tokens e componentes do exemplo no frontmatter', () => {
    const data = parseFrontmatter(serializeDesignMd(initialDraft()))

    expect(data.version).toBe('alpha')
    expect(data.name).toBe('ACME')
    expect(data.colors.tertiary).toBe('#CC4D00')
    expect(data.typography.h1).toEqual({ fontFamily: 'DM Sans', fontSize: '3rem', fontWeight: 700 })
    expect(data.spacing).toEqual({ sm: '8px', md: '24px', lg: '32px' })
    expect(data.components['button-primary']).toEqual({
      backgroundColor: '{colors.tertiary}',
      textColor: '{colors.on-tertiary}',
      rounded: '{rounded.sm}',
      padding: '12px 20px',
    })
  })

  it('segue a ordem canônica das seções', () => {
    expect(sectionHeadings(serializeDesignMd(initialDraft()))).toEqual(EXAMPLE_ORDER)
  })

  it.each([
    ['dois-pontos e cerquilha', 'Marca: nova # versão'],
    ['aspas', 'O "melhor" design \'system\''],
    ['emoji e acentos', 'Ação ✨ coração'],
    ['cara de referência', '{colors.primary}'],
    ['cara de número', '0012'],
  ])('serializa nome e descrição com %s sem corromper o YAML', (_, text) => {
    const draft = apply(initialDraft(), { type: 'setName', name: text }, { type: 'setDescription', description: `${text}\nsegunda linha` })
    const content = serializeDesignMd(draft)
    const data = parseFrontmatter(content)

    expect(data.name).toBe(text)
    expect(data.description).toBe(`${text}\nsegunda linha`)
    expect(lintDesignMd(content).summary.errors).toBe(0)
  })

  it('não gera chaves para campos vazios', () => {
    let draft = apply(initialDraft(), { type: 'setDescription', description: '   ' })
    draft = apply(draft, {
      type: 'updateToken',
      group: 'typography',
      id: tokenId(draft, 'typography', 'h1'),
      patch: { fontWeight: '', lineHeight: '' },
    })
    const data = parseFrontmatter(serializeDesignMd(draft))

    expect(data).not.toHaveProperty('description')
    expect(data.typography.h1).toEqual({ fontFamily: 'DM Sans', fontSize: '3rem' })
  })

  it('omite seções sem conteúdo em vez de inventar orientação', () => {
    const draft = apply(
      initialDraft(),
      { type: 'setGuidance', key: 'overview', text: '' },
      { type: 'setGuidance', key: 'dosAndDonts', text: '' },
    )

    expect(sectionHeadings(serializeDesignMd(draft))).toEqual(['Colors', 'Typography', 'Layout', 'Shapes', 'Components'])
  })

  it('escapa títulos e sublinhados no texto livre para não criar seções', () => {
    const text = '## Colors\n# Título\nLinha que viraria título\n---\nFim'
    const draft = apply(initialDraft(), { type: 'setGuidance', key: 'overview', text })
    const content = serializeDesignMd(draft)
    const lint = lintDesignMd(content)

    expect(sectionHeadings(content)).toEqual(EXAMPLE_ORDER)
    expect(lint.designSystem?.sections).toEqual(EXAMPLE_ORDER)
    expect(lint.findings.filter((finding) => finding.rule === 'section-order')).toEqual([])
  })

  it('transforma cada linha de "O que fazer e o que evitar" em item de lista', () => {
    const draft = apply(initialDraft(), {
      type: 'setGuidance',
      key: 'dosAndDonts',
      text: 'Primeira regra\n\n- Segunda, já como lista\n  Terceira  ',
    })

    expect(serializeDesignMd(draft)).toContain("## Do's and Don'ts\n\n- Primeira regra\n- Segunda, já como lista\n- Terceira\n")
  })

  it('ignora textos de campos que não existem mais no editor (rascunhos antigos)', () => {
    const draft = apply(
      initialDraft(),
      { type: 'setGuidance', key: 'elevation', text: 'Texto antigo de elevação' },
      { type: 'setGuidance', key: 'colors', text: 'Nota antiga de cores' },
    )
    const content = serializeDesignMd(draft)

    expect(content).not.toContain('Texto antigo de elevação')
    expect(content).not.toContain('Nota antiga de cores')
    expect(sectionHeadings(content)).not.toContain('Elevation & Depth')
  })

  it('preserva as quebras de linha do texto livre', () => {
    const draft = apply(initialDraft(), { type: 'setGuidance', key: 'overview', text: 'Linha 1\nLinha 2\n\nParágrafo 2' })

    expect(serializeDesignMd(draft)).toContain('## Overview\n\nLinha 1\nLinha 2\n\nParágrafo 2\n')
  })

  it('escreve números sem unidade como números onde a spec aceita', () => {
    let draft = initialDraft()
    draft = apply(
      draft,
      { type: 'updateToken', group: 'spacing', id: tokenId(draft, 'spacing', 'sm'), patch: { value: '8' } },
      { type: 'updateToken', group: 'typography', id: tokenId(draft, 'typography', 'h1'), patch: { lineHeight: '1.2' } },
    )
    const data = parseFrontmatter(serializeDesignMd(draft))

    expect(data.spacing.sm).toBe(8)
    expect(data.typography.h1.lineHeight).toBe(1.2)
  })
})
