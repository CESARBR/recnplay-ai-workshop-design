// Validação estrutural do editor: o que a biblioteca oficial não detecta (nome vazio,
// nomes inválidos ou repetidos, valores vazios). Formatos de cor e de dimensão ficam
// com o lint oficial. A mesma regra decide o que entra no DESIGN.md (`emittable*`),
// para o arquivo nunca ter YAML inválido nem chaves duplicadas.
import { fieldIds } from './field-ids'
import { getTokens } from './references'
import { isValidCssColor } from '../official'
import { isDimensionList, isDimensionOrNumber, PROPERTY_REF_GROUP, TOKEN_NAME_PATTERN } from './rules'
import {
  COMPONENT_PROPERTIES,
  type AnyToken,
  type ComponentDef,
  type ComponentProperty,
  type Draft,
  type PropertyValue,
  type TokenByGroup,
  type TokenGroup,
  type TypographyToken,
} from './types'

export type EditorIssue = {
  severity: 'error' | 'warning'
  fieldId: string
  message: string
}

export const GROUP_LABEL: Record<TokenGroup | 'components', string> = {
  colors: 'Cores',
  typography: 'Tipografia',
  rounded: 'Arredondamento',
  spacing: 'Espaçamento',
  components: 'Componentes',
}

const SPACING_MESSAGE = 'Use um número com unidade px, em ou rem (ex.: 8px) ou um número sem unidade (ex.: 8).'
const COLOR_MESSAGE = 'Cor inválida. Use um valor CSS, como #FFFFFF, rgb(0 0 0), oklch(0.6 0.2 40) ou transparent.'
const DIMENSION_LIST_MESSAGE = 'Use de 1 a 4 medidas em px, em ou rem separadas por espaço (ex.: 12px 20px).'

export const TYPOGRAPHY_FIELDS = ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing'] as const

function nameProblem(name: string): string | undefined {
  if (!name.trim()) return 'Dê um nome.'
  if (!TOKEN_NAME_PATTERN.test(name))
    return 'Use só letras minúsculas, números e hífen, começando por letra ou número (ex.: on-primary).'
  return undefined
}

function valueProblem(group: TokenGroup, token: AnyToken): string | undefined {
  if (group === 'typography') {
    const typography = token as TypographyToken
    return TYPOGRAPHY_FIELDS.some((field) => typography[field].trim())
      ? undefined
      : 'Preencha ao menos uma propriedade do estilo.'
  }
  return (token as TokenByGroup['colors']).value.trim() ? undefined : 'Informe um valor.'
}

/** Itens com nome válido e ainda não usado no grupo (o primeiro de cada nome vence). */
function withUniqueValidNames<T extends { name: string }>(items: T[]): { kept: T[]; duplicates: T[] } {
  const seen = new Set<string>()
  const kept: T[] = []
  const duplicates: T[] = []
  for (const item of items) {
    if (nameProblem(item.name)) continue
    if (seen.has(item.name)) duplicates.push(item)
    else {
      seen.add(item.name)
      kept.push(item)
    }
  }
  return { kept, duplicates }
}

/** Tokens que entram no DESIGN.md. */
export function emittableTokens<G extends TokenGroup>(draft: Draft, group: G): TokenByGroup[G][] {
  return withUniqueValidNames(getTokens(draft, group)).kept.filter((token) => !valueProblem(group, token))
}

/** Componentes que entram no DESIGN.md (com nome válido, único e ao menos uma propriedade). */
export function emittableComponents(draft: Draft): ComponentDef[] {
  return withUniqueValidNames(draft.components).kept.filter((component) => hasProperties(component))
}

/** Propriedades que entram no DESIGN.md, na ordem da especificação (literais vazios ficam de fora). */
export function emittableProperties(component: ComponentDef): [ComponentProperty, PropertyValue][] {
  return COMPONENT_PROPERTIES.flatMap((property) => {
    const value = component.properties[property]
    if (!value || (value.kind === 'literal' && !value.value.trim())) return []
    return [[property, value] as [ComponentProperty, PropertyValue]]
  })
}

const hasProperties = (component: ComponentDef) => emittableProperties(component).length > 0

export function validateDraft(draft: Draft): EditorIssue[] {
  const issues: EditorIssue[] = []
  const error = (fieldId: string, message: string) => issues.push({ severity: 'error', fieldId, message })

  if (!draft.name.trim()) error(fieldIds.identity('name'), 'O nome do design system é obrigatório.')

  for (const group of ['colors', 'typography', 'rounded', 'spacing'] as const) {
    const tokens = getTokens(draft, group)
    const { duplicates } = withUniqueValidNames(tokens)
    for (const token of tokens) {
      const nameField = fieldIds.token(group, token.id, 'name')
      const problem = nameProblem(token.name)
      if (problem) error(nameField, problem)
      else if (duplicates.includes(token))
        error(nameField, `Já existe outro token “${token.name}” em ${GROUP_LABEL[group]}. Use um nome diferente.`)

      const valueIssue = valueProblem(group, token)
      if (valueIssue)
        error(fieldIds.token(group, token.id, group === 'typography' ? 'fontFamily' : 'value'), valueIssue)
      // A biblioteca oficial não valida os valores de `spacing`.
      else if (group === 'spacing' && !isDimensionOrNumber((token as TokenByGroup['spacing']).value.trim()))
        error(fieldIds.token(group, token.id, 'value'), SPACING_MESSAGE)
    }
  }

  const { duplicates } = withUniqueValidNames(draft.components)
  for (const component of draft.components) {
    const nameField = fieldIds.component(component.id, 'name')
    const problem = nameProblem(component.name)
    if (problem) error(nameField, problem)
    else if (duplicates.includes(component))
      error(nameField, `Já existe outro componente “${component.name}”. Use um nome diferente.`)

    if (!Object.values(component.properties).some(Boolean))
      issues.push({
        severity: 'warning',
        fieldId: nameField,
        message: 'Componente sem propriedades não entra no DESIGN.md.',
      })

    // A biblioteca oficial não valida valores literais de componentes.
    for (const [property, value] of Object.entries(component.properties)) {
      if (value?.kind !== 'literal') continue
      const field = fieldIds.component(component.id, property as ComponentProperty)
      const literal = value.value.trim()
      if (!literal) error(field, 'Informe um valor ou remova a propriedade.')
      else if (PROPERTY_REF_GROUP[property as ComponentProperty] === 'colors') {
        if (!isValidCssColor(literal)) error(field, COLOR_MESSAGE)
      } else if (!isDimensionList(literal)) error(field, DIMENSION_LIST_MESSAGE)
    }
  }

  return issues
}
