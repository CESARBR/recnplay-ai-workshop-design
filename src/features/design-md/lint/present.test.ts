import { describe, expect, it } from 'vitest'

import { fieldIds } from '../model/field-ids'
import { buildDesignMd, type DesignMdBuild } from '../pipeline'
import { apply, componentId, initialDraft, tokenId } from '../test/draft-helpers'
import { collectProblems, countProblems, fieldMessage, type Problem } from './present'

const problemsOf = (build: DesignMdBuild) => collectProblems(build)
const byTitle = (problems: Problem[], title: string) => problems.filter((problem) => problem.title === title)

describe('problemas do exemplo da ACME', () => {
  const build = buildDesignMd(initialDraft())
  const problems = problemsOf(build)

  it('conta erros, avisos e informações (CLI + checagens de contraste da ferramenta)', () => {
    expect(countProblems(problems)).toEqual({ errors: 0, warnings: 0, infos: 5 })
  })

  it('ordena por gravidade: erros, avisos, informações', () => {
    const order = problems.map((problem) => problem.severity)
    expect(order).toEqual([...order].sort((a, b) => ['error', 'warning', 'info'].indexOf(a) - ['error', 'warning', 'info'].indexOf(b)))
  })

  it('o laranja do exemplo passa no contraste com texto branco', () => {
    expect(byTitle(problems, 'Contraste insuficiente')).toEqual([])
  })

  it('traduz o contraste reprovado, mantém a original e aponta o campo Texto', () => {
    // Laranja original (#F76003) com texto branco: 3,17:1.
    let draft = initialDraft()
    draft = apply(draft, {
      type: 'updateToken',
      group: 'colors',
      id: tokenId(draft, 'colors', 'tertiary'),
      patch: { value: '#F76003' },
    })
    const [contrast] = byTitle(problemsOf(buildDesignMd(draft)), 'Contraste insuficiente')

    expect(contrast).toMatchObject({
      severity: 'warning',
      origin: 'cli',
      rule: 'contrast-ratio',
      message: 'Contraste de 3,17:1 entre texto e fundo, abaixo do mínimo de 4,5:1 (WCAG AA) para texto normal.',
      original: expect.stringContaining('has contrast ratio 3.17:1'),
      fieldId: fieldIds.component(componentId(draft, 'button-primary'), 'textColor'),
      location: 'Componente button-primary · Texto',
    })
  })

  it('não relata "cor sem uso" (orphaned-tokens), embora a CLI continue apontando', () => {
    expect(build.findings.filter((finding) => finding.rule === 'orphaned-tokens').map((finding) => finding.path)).toEqual([
      'colors.neutral',
      'colors.border',
    ])
    expect(problems.some((problem) => problem.rule === 'orphaned-tokens')).toBe(false)
  })

  it('traduz o resumo dos tokens', () => {
    expect(byTitle(problems, 'Resumo dos tokens')[0].message).toBe(
      'O design system define 7 cores, 3 estilos de texto, 2 níveis de arredondamento, 3 espaçamentos e 4 componentes.',
    )
  })

  it('mostra os contrastes aprovados, que a CLI não reporta', () => {
    expect(byTitle(problems, 'Contraste aprovado').map((problem) => [problem.location, problem.message])).toEqual([
      ['Componente button-primary · Texto', 'Texto e fundo têm contraste de 4,54:1, acima do mínimo de 4,5:1 (WCAG AA).'],
      ['Componente button-secondary · Texto', 'Texto e fundo têm contraste de 4,54:1, acima do mínimo de 4,5:1 (WCAG AA).'],
      ['Componente card · Texto', 'Texto e fundo têm contraste de 17,48:1, acima do mínimo de 4,5:1 (WCAG AA).'],
      ['Componente input · Texto', 'Texto e fundo têm contraste de 17,48:1, acima do mínimo de 4,5:1 (WCAG AA).'],
    ])
  })

  it('sinaliza como aviso o contraste com fundo transparente, que a CLI aprova ignorando o alfa', () => {
    let draft = initialDraft()
    draft = apply(draft, {
      type: 'setComponentProperty',
      id: componentId(draft, 'button-secondary'),
      property: 'backgroundColor',
      value: { kind: 'literal', value: 'transparent' },
    })
    const edited = buildDesignMd(draft)
    const [unverified] = byTitle(problemsOf(edited), 'Contraste não verificável')

    expect(unverified).toMatchObject({ severity: 'warning', origin: 'editor', location: 'Componente button-secondary · Texto' })
    expect(edited.findings.some((finding) => finding.path === 'components.button-secondary')).toBe(false)
  })
})

describe('problemas em estados editados', () => {
  it('validação do editor: origem, título e local do campo', () => {
    const problems = problemsOf(buildDesignMd(apply(initialDraft(), { type: 'setName', name: '' })))

    expect(problems[0]).toMatchObject({
      severity: 'error',
      origin: 'editor',
      title: 'Campo inválido',
      message: 'O nome do design system é obrigatório.',
      fieldId: fieldIds.identity('name'),
      location: 'Identidade · Nome',
    })
  })

  it('referência quebrada aponta a propriedade exata', () => {
    let draft = initialDraft()
    draft = apply(draft, { type: 'removeToken', group: 'colors', id: tokenId(draft, 'colors', 'surface') })
    const broken = byTitle(problemsOf(buildDesignMd(draft)), 'Referência quebrada')

    expect(broken.map((problem) => [problem.location, problem.message])).toEqual([
      ['Componente button-secondary · Fundo', 'A referência {colors.surface} aponta para um token que não existe. Escolha outro token.'],
      ['Componente card · Fundo', 'A referência {colors.surface} aponta para um token que não existe. Escolha outro token.'],
      ['Componente input · Fundo', 'A referência {colors.surface} aponta para um token que não existe. Escolha outro token.'],
    ])
  })

  it('traduz as regras de grupos ausentes', () => {
    let draft = initialDraft()
    const remove = (group: 'colors' | 'typography' | 'spacing' | 'rounded') =>
      draft[group].map((token) => ({ type: 'removeToken' as const, group, id: token.id }))
    draft = apply(
      draft,
      { type: 'removeToken', group: 'colors', id: tokenId(draft, 'colors', 'primary') },
      ...remove('typography'),
      ...remove('spacing'),
      ...remove('rounded'),
    )
    const messages = problemsOf(buildDesignMd(draft)).map((problem) => `${problem.title}: ${problem.message}`)

    expect(messages).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^Sem cor primary: Não há uma cor chamada “primary”/),
        expect.stringMatching(/^Sem tipografia: Nenhum estilo de texto definido/),
        'Escala ausente: Nenhum espaçamento definido. A IA vai usar espaçamentos padrão.',
        'Escala ausente: Nenhum arredondamento definido. A IA vai usar cantos padrão.',
      ]),
    )
  })

  it('valor inválido do lint vira título genérico com mensagem traduzida', () => {
    let draft = initialDraft()
    draft = apply(draft, { type: 'updateToken', group: 'rounded', id: tokenId(draft, 'rounded', 'md'), patch: { value: '12pt' } })
    const [invalid] = byTitle(problemsOf(buildDesignMd(draft)), 'Valor inválido')

    expect(invalid).toMatchObject({
      severity: 'error',
      message: '“12pt” usa a unidade “pt”, que não é aceita. Use px, em ou rem.',
      location: 'Arredondamento md · Valor',
    })
  })

  it('mensagem sem tradução é mostrada como veio, sem duplicar a original', () => {
    expect(fieldMessage({ severity: 'warning', message: 'Something new in a future CLI.' })).toBe(
      'Something new in a future CLI.',
    )
  })
})
