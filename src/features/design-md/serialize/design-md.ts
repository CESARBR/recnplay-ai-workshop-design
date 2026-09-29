// Gera o texto do DESIGN.md a partir do estado do editor:
// YAML frontmatter (tokens) + corpo Markdown em pt-BR, nas seções e ordem canônicas da spec.
import { Document } from 'yaml'

import { DESIGN_MD_SPEC_VERSION } from '../official'
import { propertyValueToString } from '../model/references'
import { PROPERTY_LABEL, UNITLESS_NUMBER_PATTERN } from '../model/rules'
import type { Draft, GuidanceKey, TypographyToken } from '../model/types'
import { emittableComponents, emittableProperties, emittableTokens, TYPOGRAPHY_FIELDS } from '../model/validation'
import { escapeFreeText, inlineCode } from './markdown'

/**
 * Seções canônicas, na ordem exigida pela especificação. Só Overview e Do's and Don'ts têm texto
 * livre no editor; as demais são derivadas dos tokens (Elevation & Depth não é gerada).
 */
const SECTIONS: { heading: string; guidance?: GuidanceKey }[] = [
  { heading: 'Overview', guidance: 'overview' },
  { heading: 'Colors' },
  { heading: 'Typography' },
  { heading: 'Layout' },
  { heading: 'Shapes' },
  { heading: 'Components' },
  { heading: "Do's and Don'ts", guidance: 'dosAndDonts' },
]

/** Cada linha não vazia vira um item de lista (quem preenche não precisa saber Markdown). */
function toListItems(text: string): string {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => (/^[-*+]\s/.test(line) ? line : `- ${line}`))
    .join('\n')
}

const TYPOGRAPHY_LABEL: Record<(typeof TYPOGRAPHY_FIELDS)[number], string> = {
  fontFamily: 'fonte',
  fontSize: 'tamanho',
  fontWeight: 'peso',
  lineHeight: 'altura da linha',
  letterSpacing: 'espaçamento entre letras',
}

/** Números sem unidade viram números no YAML onde a spec aceita número. */
const numberOrString = (value: string): number | string =>
  UNITLESS_NUMBER_PATTERN.test(value) ? Number(value) : value

function typographyTokenValue(token: TypographyToken) {
  const result: Record<string, string | number> = {}
  for (const field of TYPOGRAPHY_FIELDS) {
    const value = token[field].trim()
    if (!value) continue
    result[field] = field === 'fontWeight' || field === 'lineHeight' ? numberOrString(value) : value
  }
  return result
}

function buildFrontmatter(draft: Draft): string {
  const data: Record<string, unknown> = { version: DESIGN_MD_SPEC_VERSION }
  const name = draft.name.trim()
  const description = draft.description.trim()
  if (name) data.name = name
  if (description) data.description = description

  const colors = emittableTokens(draft, 'colors')
  if (colors.length) data.colors = Object.fromEntries(colors.map((token) => [token.name, token.value.trim()]))

  const typography = emittableTokens(draft, 'typography')
  if (typography.length)
    data.typography = Object.fromEntries(typography.map((token) => [token.name, typographyTokenValue(token)]))

  const rounded = emittableTokens(draft, 'rounded')
  if (rounded.length) data.rounded = Object.fromEntries(rounded.map((token) => [token.name, token.value.trim()]))

  const spacing = emittableTokens(draft, 'spacing')
  if (spacing.length)
    data.spacing = Object.fromEntries(spacing.map((token) => [token.name, numberOrString(token.value.trim())]))

  const components = emittableComponents(draft)
  if (components.length)
    data.components = Object.fromEntries(
      components.map((component) => [
        component.name,
        Object.fromEntries(
          emittableProperties(component).map(([property, value]) => [
            property,
            propertyValueToString(draft, value).trim(),
          ]),
        ),
      ]),
    )

  // A biblioteca `yaml` cuida de aspas e escapes (`#`, `:`, aspas, quebras de linha).
  return new Document(data).toString({ lineWidth: 0 }).trimEnd()
}

/** Conteúdo derivado dos tokens para cada seção (em pt-BR). */
function derivedSection(draft: Draft, heading: string): string[] {
  switch (heading) {
    case 'Colors':
      return emittableTokens(draft, 'colors').map((token) => `- **${token.name}:** ${inlineCode(token.value.trim())}`)

    case 'Typography':
      return emittableTokens(draft, 'typography').map((token) => {
        const parts = TYPOGRAPHY_FIELDS.filter((field) => token[field].trim()).map(
          (field) => `${TYPOGRAPHY_LABEL[field]} ${inlineCode(token[field].trim())}`,
        )
        return `- **${token.name}:** ${parts.join(', ')}`
      })

    case 'Layout':
    case 'Shapes': {
      const group = heading === 'Layout' ? 'spacing' : 'rounded'
      const tokens = emittableTokens(draft, group)
      if (!tokens.length) return []
      const title = heading === 'Layout' ? 'Escala de espaçamento:' : 'Escala de arredondamento:'
      return [title, '', ...tokens.map((token) => `- **${token.name}:** ${inlineCode(token.value.trim())}`)]
    }

    case 'Components':
      return emittableComponents(draft).flatMap((component, index) => [
        ...(index > 0 ? [''] : []),
        `### ${component.name}`,
        '',
        ...emittableProperties(component).map(
          ([property, value]) =>
            `- ${PROPERTY_LABEL[property]} (\`${property}\`): ${inlineCode(propertyValueToString(draft, value).trim())}`,
        ),
      ])

    default:
      return []
  }
}

function buildBody(draft: Draft): string {
  const blocks: string[] = []
  const name = draft.name.trim()
  if (name) blocks.push(`# ${escapeFreeText(name).replace(/\n+/g, ' ')}`)

  for (const { heading, guidance } of SECTIONS) {
    const raw = guidance ? escapeFreeText(draft.guidance[guidance]) : ''
    const text = guidance === 'dosAndDonts' ? toListItems(raw) : raw
    const derived = derivedSection(draft, heading)
    // Seções sem conteúdo são omitidas: nada de orientação inventada.
    if (!text && !derived.length) continue
    blocks.push([`## ${heading}`, ...(text ? ['', text] : []), ...(derived.length ? ['', ...derived] : [])].join('\n'))
  }

  return blocks.join('\n\n')
}

export function serializeDesignMd(draft: Draft): string {
  return `---\n${buildFrontmatter(draft)}\n---\n\n${buildBody(draft)}\n`
}
