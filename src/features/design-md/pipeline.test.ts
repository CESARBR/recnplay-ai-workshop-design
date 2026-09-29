import { describe, expect, it } from 'vitest'

import { fieldIds } from './model/field-ids'
import { buildDesignMd } from './pipeline'
import { runCliLint } from './test/cli'
import { apply, componentId, initialDraft, parseFrontmatter, tokenId } from './test/draft-helpers'

describe('validação e bloqueio de exportação', () => {
  it('nome vazio: erro no campo, sem exportação, e YAML continua válido', () => {
    const build = buildDesignMd(apply(initialDraft(), { type: 'setName', name: '  ' }))

    expect(build.editorIssues).toContainEqual({
      severity: 'error',
      fieldId: fieldIds.identity('name'),
      message: 'O nome do design system é obrigatório.',
    })
    expect(build.canExport).toBe(false)
    expect(parseFrontmatter(build.content)).not.toHaveProperty('name')
  })

  it('chave duplicada: erro no token repetido e só a primeira entra no arquivo', () => {
    let draft = initialDraft()
    const secondary = tokenId(draft, 'colors', 'secondary')
    draft = apply(draft, { type: 'updateToken', group: 'colors', id: secondary, patch: { name: 'primary' } })
    const build = buildDesignMd(draft)

    expect(build.editorIssues).toContainEqual(
      expect.objectContaining({ severity: 'error', fieldId: fieldIds.token('colors', secondary, 'name') }),
    )
    expect(build.canExport).toBe(false)
    // `parseFrontmatter` usa `uniqueKeys: true`: falharia se houvesse chave duplicada.
    expect(parseFrontmatter(build.content).colors.primary).toBe('#201813')
  })

  it.each([
    ['vazio', '', 'Dê um nome.'],
    ['com maiúsculas', 'Primary', 'Use só letras minúsculas'],
    ['com espaço', 'cor nova', 'Use só letras minúsculas'],
  ])('nome de token %s é rejeitado e fica fora do arquivo', (_, name, message) => {
    let draft = initialDraft()
    const neutral = tokenId(draft, 'colors', 'neutral')
    draft = apply(draft, { type: 'updateToken', group: 'colors', id: neutral, patch: { name } })
    const build = buildDesignMd(draft)

    expect(build.editorIssues).toContainEqual(
      expect.objectContaining({ fieldId: fieldIds.token('colors', neutral, 'name'), message: expect.stringContaining(message) }),
    )
    expect(Object.keys(parseFrontmatter(build.content).colors)).not.toContain(name)
  })

  it('cor inválida: erro do lint oficial localizado no campo do valor', () => {
    let draft = initialDraft()
    const border = tokenId(draft, 'colors', 'border')
    draft = apply(draft, { type: 'updateToken', group: 'colors', id: border, patch: { value: 'cinza-claro' } })
    const build = buildDesignMd(draft)

    expect(build.findings).toContainEqual(
      expect.objectContaining({ severity: 'error', path: 'colors.border', fieldId: fieldIds.token('colors', border, 'value') }),
    )
    expect(build.canExport).toBe(false)
  })

  it('dimensão inválida: erro do lint oficial localizado no campo', () => {
    let draft = initialDraft()
    const md = tokenId(draft, 'spacing', 'md')
    const h1 = tokenId(draft, 'typography', 'h1')
    draft = apply(
      draft,
      { type: 'updateToken', group: 'spacing', id: md, patch: { value: '24 px' } },
      { type: 'updateToken', group: 'typography', id: h1, patch: { fontWeight: 'negrito' } },
    )
    const build = buildDesignMd(draft)

    // A biblioteca não valida `spacing`: quem sinaliza é o editor.
    expect(build.editorIssues).toContainEqual(
      expect.objectContaining({ severity: 'error', fieldId: fieldIds.token('spacing', md, 'value') }),
    )
    expect(build.findings).toContainEqual(
      expect.objectContaining({ severity: 'error', fieldId: fieldIds.token('typography', h1, 'fontWeight') }),
    )
  })

  it.each([
    ['cor', 'backgroundColor', 'nope', 'Cor inválida'],
    ['medida', 'padding', 'grande', 'Use de 1 a 4 medidas'],
    ['medida com %', 'rounded', '50%', 'Use de 1 a 4 medidas'],
  ] as const)('%s literal inválida em componente: erro do editor', (_, property, value, message) => {
    let draft = initialDraft()
    const card = componentId(draft, 'card')
    draft = apply(draft, { type: 'setComponentProperty', id: card, property, value: { kind: 'literal', value } })
    const build = buildDesignMd(draft)

    expect(build.editorIssues).toContainEqual(
      expect.objectContaining({ fieldId: fieldIds.component(card, property), message: expect.stringContaining(message) }),
    )
    expect(build.canExport).toBe(false)
  })

  it.each(['transparent', 'oklch(0.6 0.2 40)', 'rgb(0 0 0 / 50%)', '#FFF'])('aceita a cor literal %s', (value) => {
    let draft = initialDraft()
    const card = componentId(draft, 'card')
    draft = apply(draft, {
      type: 'setComponentProperty',
      id: card,
      property: 'backgroundColor',
      value: { kind: 'literal', value },
    })

    expect(buildDesignMd(draft).editorIssues.filter((issue) => issue.severity === 'error')).toEqual([])
  })

  it('valor vazio: erro do editor e token fora do arquivo', () => {
    let draft = initialDraft()
    const lg = tokenId(draft, 'spacing', 'lg')
    draft = apply(draft, { type: 'updateToken', group: 'spacing', id: lg, patch: { value: ' ' } })
    const build = buildDesignMd(draft)

    expect(build.editorIssues).toContainEqual(
      expect.objectContaining({ fieldId: fieldIds.token('spacing', lg, 'value'), message: 'Informe um valor.' }),
    )
    expect(parseFrontmatter(build.content).spacing).not.toHaveProperty('lg')
  })

  it('componente sem propriedades: aviso, sem bloquear, e fora do arquivo', () => {
    const draft = apply(initialDraft(), { type: 'addComponent', id: 'vazio' })
    const build = buildDesignMd(draft)

    expect(build.editorIssues).toContainEqual(
      expect.objectContaining({ severity: 'warning', fieldId: fieldIds.component('vazio', 'name') }),
    )
    expect(build.canExport).toBe(true)
    expect(parseFrontmatter(build.content).components).not.toHaveProperty('componente-1')
  })
})

describe('contraste', () => {
  it('par abaixo de 4,5:1 gera contrast-ratio com proporção e componente; ajustar remove o achado', () => {
    let draft = initialDraft()
    const card = componentId(draft, 'card')
    const contrastFor = (current: typeof draft) =>
      buildDesignMd(current).findings.filter(
        (finding) => finding.rule === 'contrast-ratio' && finding.path === 'components.card',
      )

    draft = apply(draft, {
      type: 'setComponentProperty',
      id: card,
      property: 'textColor',
      value: { kind: 'ref', group: 'colors', tokenId: tokenId(draft, 'colors', 'border') },
    })
    const [finding] = contrastFor(draft)
    expect(finding.message).toMatch(/contrast ratio 1\.\d+:1/)
    expect(finding.fieldId).toBe(fieldIds.component(card, 'textColor'))

    draft = apply(draft, {
      type: 'setComponentProperty',
      id: card,
      property: 'textColor',
      value: { kind: 'ref', group: 'colors', tokenId: tokenId(draft, 'colors', 'primary') },
    })
    expect(contrastFor(draft)).toEqual([])
  })
})

describe('paridade com a CLI real', () => {
  it('estado com vários problemas tem os mesmos achados que a CLI', () => {
    let draft = initialDraft()
    draft = apply(
      draft,
      { type: 'removeToken', group: 'colors', id: tokenId(draft, 'colors', 'surface') },
      { type: 'updateToken', group: 'rounded', id: tokenId(draft, 'rounded', 'md'), patch: { value: 'grande' } },
    )
    const build = buildDesignMd(draft)
    const cli = runCliLint(build.content)

    expect(build.findings.map(({ fieldId: _fieldId, ...finding }) => finding)).toEqual(cli.findings)
    expect(build.lint.summary).toEqual(cli.summary)
  })
})
