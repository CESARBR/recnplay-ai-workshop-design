// Modelo do editor do gerador de DESIGN.md.
// Todos os valores editáveis são strings (espelham os campos da interface); a conversão
// para números e referências acontece só na serialização.

export type Id = string

/** Grupos de tokens do frontmatter, na ordem canônica da especificação. */
export const TOKEN_GROUPS = ['colors', 'typography', 'rounded', 'spacing'] as const
export type TokenGroup = (typeof TOKEN_GROUPS)[number]

export type ColorToken = { id: Id; name: string; value: string }
export type ScaleToken = { id: Id; name: string; value: string }
export type TypographyToken = {
  id: Id
  name: string
  fontFamily: string
  fontSize: string
  fontWeight: string
  lineHeight: string
  letterSpacing: string
}

export type TokenByGroup = {
  colors: ColorToken
  typography: TypographyToken
  rounded: ScaleToken
  spacing: ScaleToken
}
export type AnyToken = TokenByGroup[TokenGroup]

/** Propriedades de componente da especificação (CLI 0.4.0), na ordem de serialização. */
export const COMPONENT_PROPERTIES = [
  'backgroundColor',
  'textColor',
  'typography',
  'rounded',
  'padding',
  'size',
  'height',
  'width',
] as const
export type ComponentProperty = (typeof COMPONENT_PROPERTIES)[number]

/**
 * Valor de uma propriedade de componente:
 * - `ref`: referência a um token pelo id (renomear o token atualiza a referência);
 * - `broken`: referência a um token que foi removido — serializada como `{grupo.nome}`
 *   e sinalizada como `broken-ref` pelo lint;
 * - `literal`: valor digitado (cor ou dimensão).
 */
export type PropertyValue =
  | { kind: 'ref'; group: TokenGroup; tokenId: Id }
  | { kind: 'broken'; group: TokenGroup; name: string }
  | { kind: 'literal'; value: string }

export type ComponentDef = {
  id: Id
  name: string
  properties: Partial<Record<ComponentProperty, PropertyValue>>
}

/** Textos livres, um por seção canônica do corpo do DESIGN.md. */
export const GUIDANCE_KEYS = [
  'overview',
  'colors',
  'typography',
  'layout',
  'elevation',
  'shapes',
  'components',
  'dosAndDonts',
] as const
export type GuidanceKey = (typeof GUIDANCE_KEYS)[number]
export type Guidance = Record<GuidanceKey, string>

export type Draft = {
  name: string
  description: string
  colors: ColorToken[]
  typography: TypographyToken[]
  rounded: ScaleToken[]
  spacing: ScaleToken[]
  components: ComponentDef[]
  guidance: Guidance
}
