// Exemplo inicial do editor: uma empresa fictícia, a ACME, com conteúdo curto em cada campo
// só para mostrar aos participantes o tipo de texto esperado. Tokens e componentes seguem a
// paleta do site (com o laranja). Cada chamada gera ids novos.
import { createId } from './ids'
import type { ComponentDef, Draft, PropertyValue, TokenGroup, TypographyToken } from './types'

const scale = (entries: [string, string][]) =>
  entries.map(([name, value]) => ({ id: createId(), name, value }))

export function createInitialDraft(): Draft {
  const colors = scale([
    ['primary', '#201813'],
    ['secondary', '#7B675B'],
    ['tertiary', '#CC4D00'],
    ['neutral', '#F7F8F9'],
    ['surface', '#FFFFFF'],
    ['on-tertiary', '#FFFFFF'],
    ['border', '#E8E5E3'],
  ])
  const typography: TypographyToken[] = [
    ['h1', '3rem', '700'],
    ['body-md', '1rem', '400'],
    ['label-caps', '0.75rem', '600'],
  ].map(([name, fontSize, fontWeight]) => ({
    id: createId(),
    name,
    fontFamily: 'DM Sans',
    fontSize,
    fontWeight,
    lineHeight: '',
    letterSpacing: '',
  }))
  const rounded = scale([
    ['sm', '6px'],
    ['md', '12px'],
  ])
  const spacing = scale([
    ['sm', '8px'],
    ['md', '24px'],
    ['lg', '32px'],
  ])

  const tokensByGroup = { colors, typography, rounded, spacing }
  const ref = (group: TokenGroup, name: string): PropertyValue => {
    const token = tokensByGroup[group].find((candidate) => candidate.name === name)
    if (!token) throw new Error(`Exemplo inicial: token inexistente ${group}.${name}`)
    return { kind: 'ref', group, tokenId: token.id }
  }
  const literal = (value: string): PropertyValue => ({ kind: 'literal', value })

  const components: ComponentDef[] = [
    {
      id: createId(),
      name: 'button-primary',
      properties: {
        backgroundColor: ref('colors', 'tertiary'),
        textColor: ref('colors', 'on-tertiary'),
        rounded: ref('rounded', 'sm'),
        padding: literal('12px 20px'),
      },
    },
    {
      id: createId(),
      name: 'button-secondary',
      properties: {
        backgroundColor: ref('colors', 'surface'),
        textColor: ref('colors', 'tertiary'),
        rounded: ref('rounded', 'sm'),
        padding: literal('12px 20px'),
      },
    },
    {
      id: createId(),
      name: 'card',
      properties: {
        backgroundColor: ref('colors', 'surface'),
        textColor: ref('colors', 'primary'),
        rounded: ref('rounded', 'md'),
        padding: literal('20px'),
      },
    },
    {
      id: createId(),
      name: 'input',
      properties: {
        backgroundColor: ref('colors', 'surface'),
        textColor: ref('colors', 'primary'),
        rounded: ref('rounded', 'sm'),
        padding: literal('10px 14px'),
      },
    },
  ]

  return {
    name: 'ACME',
    description: 'A ACME cria aplicativos simples para organizar o dia a dia de pequenas empresas.',
    ...tokensByGroup,
    components,
    guidance: {
      overview:
        'Interface limpa e confiável, com um laranja vibrante para destacar o que é mais importante em cada tela.',
      colors: '',
      typography: '',
      layout: '',
      elevation: '',
      shapes: '',
      components: '',
      dosAndDonts: [
        'Use um único botão laranja por tela, na ação principal.',
        'Não use mais de dois tamanhos de título na mesma tela.',
      ].join('\n'),
    },
  }
}
