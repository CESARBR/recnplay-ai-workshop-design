// Modelo da prévia: traduz o design system editado em estilos CSS para os elementos de
// exemplo. Cores vêm resolvidas pelo lint oficial (sRGB, inclusive oklch() etc.); medidas e
// tipografia vêm do editor (o CSS entende os valores como digitados — e a biblioteca descarta,
// por exemplo, `lineHeight` sem unidade e padding com várias medidas).
import type { CSSProperties } from 'react'

import { findToken } from '../model/references'
import type { ComponentDef, Draft, TypographyToken } from '../model/types'
import { emittableComponents, emittableTokens } from '../model/validation'
import type { DesignSystemState, ResolvedValue } from '../official'

type ResolvedColor = Extract<ResolvedValue, { type: 'color' }>

/** Componentes que a prévia desenha, pelos nomes usuais do formato. */
export const PREVIEW_COMPONENTS = ['button-primary', 'button-secondary', 'card', 'input'] as const
export type PreviewComponent = (typeof PREVIEW_COMPONENTS)[number]

export type PreviewComponentStyle = {
  /** Variáveis CSS do componente (fundo/texto, também do estado hover, quando existe). */
  style: CSSProperties
  /** O componente não existe no design system: a prévia usa um estilo neutro. */
  missing: boolean
  hasHover: boolean
}

export type PreviewSwatch = { name: string; value: string; css?: string; translucent: boolean }

export type PreviewModel = {
  page: CSSProperties
  title: CSSProperties
  body: CSSProperties
  components: Record<PreviewComponent, PreviewComponentStyle>
  swatches: PreviewSwatch[]
  /** Nomes dos componentes ausentes (sinalizados no painel de problemas). */
  missingComponents: PreviewComponent[]
}

const TITLE_CANDIDATES = ['headline-display', 'display', 'h1', 'headline-lg', 'headline', 'title', 'h2', 'headline-md']
const BODY_CANDIDATES = ['body-md', 'body', 'body-lg', 'text', 'paragraph', 'body-sm']
const PAGE_BACKGROUND_CANDIDATES = ['background', 'neutral', 'surface']
const PAGE_TEXT_CANDIDATES = ['on-background', 'on-neutral', 'on-surface', 'primary']
const SYSTEM_FONT_STACK = 'ui-sans-serif, system-ui, sans-serif'

export const colorToCss = (color: ResolvedColor) => `rgb(${color.r} ${color.g} ${color.b} / ${color.a ?? 1})`

const isColor = (value: ResolvedValue | undefined): value is ResolvedColor =>
  typeof value === 'object' && value !== null && value.type === 'color'

/** Tamanho aproximado em px, só para escolher estilos de título e corpo por heurística. */
function approximatePx(size: string): number | undefined {
  const match = /^(-?\d*\.?\d+)(px|rem|em)?$/.exec(size.trim())
  if (!match) return undefined
  const value = Number(match[1])
  return match[2] === 'px' || !match[2] ? value : value * 16
}

/**
 * Estilo de texto a partir de um token de tipografia (fonte com fallback do sistema, sem baixar fontes).
 * Sem `lineHeight` no token, usa uma altura de linha relativa: o site define uma altura fixa (24px)
 * no body, que, herdada por um título grande, deixaria o texto espremido.
 */
export function typographyStyle(token: TypographyToken | undefined, defaultLineHeight = '1.5'): CSSProperties {
  if (!token) return { fontFamily: SYSTEM_FONT_STACK, lineHeight: defaultLineHeight }
  const family = token.fontFamily.trim()
  return {
    fontFamily: family ? `"${family.replace(/"/g, '')}", ${SYSTEM_FONT_STACK}` : SYSTEM_FONT_STACK,
    fontSize: token.fontSize.trim() || undefined,
    fontWeight: token.fontWeight.trim() || undefined,
    lineHeight: token.lineHeight.trim() || defaultLineHeight,
    letterSpacing: token.letterSpacing.trim() || undefined,
  }
}

function pickTypography(tokens: TypographyToken[], candidates: string[], prefer: 'largest' | 'body') {
  for (const name of candidates) {
    const token = tokens.find((candidate) => candidate.name === name)
    if (token) return token
  }
  const sized = tokens
    .map((token) => ({ token, px: approximatePx(token.fontSize) }))
    .filter((entry): entry is { token: TypographyToken; px: number } => entry.px !== undefined)
  if (!sized.length) return tokens[0]
  return prefer === 'largest'
    ? sized.reduce((best, entry) => (entry.px > best.px ? entry : best)).token
    : sized.reduce((best, entry) => (Math.abs(entry.px - 16) < Math.abs(best.px - 16) ? entry : best)).token
}

function pickColor(designSystem: DesignSystemState | undefined, candidates: string[]) {
  for (const name of candidates) {
    const color = designSystem?.colors.get(name)
    if (color) return colorToCss(color)
  }
  return undefined
}

/** Valor CSS de uma medida da propriedade: o literal digitado ou o valor do token referenciado. */
function dimensionValue(draft: Draft, component: ComponentDef, property: 'rounded' | 'padding'): string | undefined {
  const value = component.properties[property]
  if (!value) return undefined
  if (value.kind === 'literal') return value.value.trim() || undefined
  if (value.kind === 'broken') return undefined
  const token = findToken(draft, value.group, value.tokenId)
  return token && 'value' in token ? token.value.trim() || undefined : undefined
}

function componentStyle(
  draft: Draft,
  designSystem: DesignSystemState | undefined,
  components: ComponentDef[],
  name: PreviewComponent,
): PreviewComponentStyle {
  const component = components.find((candidate) => candidate.name === name)
  if (!component) return { style: {}, missing: true, hasHover: false }

  const resolved = designSystem?.components.get(name)?.properties
  const hover = designSystem?.components.get(`${name}-hover`)?.properties
  const background = resolved?.get('backgroundColor')
  const text = resolved?.get('textColor')
  const hoverBackground = hover?.get('backgroundColor')
  const hoverText = hover?.get('textColor')

  const typographyRef = component.properties.typography
  const typography =
    typographyRef?.kind === 'ref'
      ? (findToken(draft, 'typography', typographyRef.tokenId) as TypographyToken | undefined)
      : undefined

  const style: Record<string, string | number | undefined> = {
    ...(typography ? typographyStyle(typography) : {}),
    borderRadius: dimensionValue(draft, component, 'rounded'),
    padding: dimensionValue(draft, component, 'padding'),
    // Fundo e texto via variáveis, para o estado hover poder sobrescrever (estilo inline venceria o :hover).
    '--preview-bg': isColor(background) ? colorToCss(background) : undefined,
    '--preview-fg': isColor(text) ? colorToCss(text) : undefined,
    '--preview-hover-bg': isColor(hoverBackground) ? colorToCss(hoverBackground) : undefined,
    '--preview-hover-fg': isColor(hoverText) ? colorToCss(hoverText) : undefined,
  }
  for (const key of Object.keys(style)) if (style[key] === undefined) delete style[key]

  return { style: style as CSSProperties, missing: false, hasHover: Boolean(hover) }
}

export function derivePreview(draft: Draft, designSystem: DesignSystemState | undefined): PreviewModel {
  const typography = emittableTokens(draft, 'typography')
  const components = emittableComponents(draft)
  const componentStyles = Object.fromEntries(
    PREVIEW_COMPONENTS.map((name) => [name, componentStyle(draft, designSystem, components, name)]),
  ) as Record<PreviewComponent, PreviewComponentStyle>

  return {
    page: {
      backgroundColor: pickColor(designSystem, PAGE_BACKGROUND_CANDIDATES) ?? '#ffffff',
      color: pickColor(designSystem, PAGE_TEXT_CANDIDATES) ?? '#000000',
      ...typographyStyle(pickTypography(typography, BODY_CANDIDATES, 'body')),
    },
    title: typographyStyle(pickTypography(typography, TITLE_CANDIDATES, 'largest'), '1.2'),
    body: typographyStyle(pickTypography(typography, BODY_CANDIDATES, 'body')),
    components: componentStyles,
    swatches: emittableTokens(draft, 'colors').map((token) => {
      const color = designSystem?.colors.get(token.name)
      return {
        name: token.name,
        value: token.value.trim(),
        css: color ? colorToCss(color) : undefined,
        translucent: color ? (color.a ?? 1) < 1 : false,
      }
    }),
    missingComponents: PREVIEW_COMPONENTS.filter((name) => componentStyles[name].missing),
  }
}
