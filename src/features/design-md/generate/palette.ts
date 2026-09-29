// Geração rápida a partir de uma cor de marca (RF-02). Determinística: a mesma cor gera o
// mesmo DESIGN.md. Substitui cores, escalas e componentes; nome, descrição, tipografia e
// textos livres são preservados pelo reducer.
import { createId } from '../model/ids'
import type { ColorToken, ComponentDef, Draft, PropertyValue, ScaleToken, TokenGroup } from '../model/types'
import { contrastRatio, resolveCssColor } from '../official'
import { oklchToRgb, relativeLuminance, rgbToHex, rgbToOklch, type Oklch, type Rgb } from './color-math'

export type GeneratedSystem = Pick<Draft, 'colors' | 'rounded' | 'spacing' | 'components'>

const WHITE: Rgb = { r: 255, g: 255, b: 255 }
const BLACK: Rgb = { r: 0, g: 0, b: 0 }
const ERROR_RED = '#B3261E'

/** Contraste com a mesma função da biblioteca oficial (a da regra `contrast-ratio`). */
export function contrast(a: Rgb, b: Rgb): number {
  const resolved = (rgb: Rgb) => ({ type: 'color' as const, hex: rgbToHex(rgb), ...rgb, luminance: relativeLuminance(rgb) })
  return contrastRatio(resolved(a), resolved(b))
}

/** Branco ou preto, o que tiver mais contraste (um dos dois sempre passa de 4,5:1). */
const bestTextOn = (background: Rgb): Rgb => (contrast(background, WHITE) >= contrast(background, BLACK) ? WHITE : BLACK)

const hexFromOklch = (color: Oklch) => rgbToHex(oklchToRgb(color))
const hexToRgb = (hex: string): Rgb => ({
  r: parseInt(hex.slice(1, 3), 16),
  g: parseInt(hex.slice(3, 5), 16),
  b: parseInt(hex.slice(5, 7), 16),
})
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const SPACING: [string, string][] = [
  ['xs', '4px'],
  ['sm', '8px'],
  ['md', '16px'],
  ['lg', '24px'],
  ['xl', '32px'],
]
const ROUNDED: [string, string][] = [
  ['none', '0px'],
  ['sm', '4px'],
  ['md', '8px'],
  ['lg', '12px'],
  ['full', '9999px'],
]

/** Nomes de tipografia usados nos componentes gerados, se já existirem no rascunho. */
const LABEL_TYPOGRAPHY = ['label-md', 'label', 'label-lg', 'label-caps', 'button']
const BODY_TYPOGRAPHY = ['body-md', 'body', 'body-lg', 'text']

export function generateFromColor(brandInput: string, draft: Draft): GeneratedSystem | undefined {
  const brandValue = brandInput.trim()
  const resolved = resolveCssColor(brandValue)
  if (!resolved) return undefined

  const brand: Rgb = { r: resolved.r, g: resolved.g, b: resolved.b }
  const { l, c, h } = rgbToOklch(brand)
  const onPrimary = bestTextOn(brand)
  // Hover afasta a cor do texto: escurece se o texto é branco, clareia se é preto (o contraste só aumenta).
  const primaryHover = hexFromOklch({ l: clamp(l + (onPrimary === WHITE ? -0.08 : 0.08), 0, 1), c, h })

  const secondary = hexFromOklch({ l: clamp(l, 0.35, 0.6), c: c * 0.35, h })
  const tertiary = hexFromOklch({ l: clamp(l, 0.45, 0.65), c: Math.max(c, 0.08), h: (h + 60) % 360 })
  const tint = Math.min(c * 0.1, 0.015)
  const neutral = hexFromOklch({ l: 0.97, c: tint, h })
  const border = hexFromOklch({ l: 0.9, c: tint, h })
  const onSurface = hexFromOklch({ l: 0.22, c: Math.min(c * 0.15, 0.02), h })
  const surface = '#FFFFFF'
  // Botão secundário sobre `surface`: texto na cor da marca se ela tiver contraste suficiente; senão, on-surface.
  const secondaryButtonText = contrast(brand, hexToRgb(surface)) >= 4.5 ? 'primary' : 'on-surface'

  const colorEntries: [string, string][] = [
    ['primary', brandValue],
    ['on-primary', rgbToHex(onPrimary)],
    ['primary-hover', primaryHover],
    ['secondary', secondary],
    ['on-secondary', rgbToHex(bestTextOn(hexToRgb(secondary)))],
    ['tertiary', tertiary],
    ['neutral', neutral],
    ['surface', surface],
    ['on-surface', onSurface],
    ['border', border],
    ['error', ERROR_RED],
    ['on-error', rgbToHex(bestTextOn(hexToRgb(ERROR_RED)))],
  ]

  const colors: ColorToken[] = colorEntries.map(([name, value]) => ({ id: createId(), name, value }))
  const spacing: ScaleToken[] = SPACING.map(([name, value]) => ({ id: createId(), name, value }))
  const rounded: ScaleToken[] = ROUNDED.map(([name, value]) => ({ id: createId(), name, value }))

  const byName = { colors, spacing, rounded, typography: draft.typography }
  const ref = (group: TokenGroup, name: string): PropertyValue => {
    const token = byName[group].find((candidate) => candidate.name === name)
    if (!token) throw new Error(`Geração: token inexistente ${group}.${name}`)
    return { kind: 'ref', group, tokenId: token.id }
  }
  const typographyRef = (candidates: string[]): Partial<ComponentDef['properties']> => {
    const token = draft.typography.find((candidate) => candidates.includes(candidate.name) && candidate.name.trim())
    return token ? { typography: { kind: 'ref', group: 'typography', tokenId: token.id } } : {}
  }
  const literal = (value: string): PropertyValue => ({ kind: 'literal', value })

  const component = (name: string, properties: ComponentDef['properties']): ComponentDef => ({
    id: createId(),
    name,
    properties,
  })

  const components: ComponentDef[] = [
    component('button-primary', {
      backgroundColor: ref('colors', 'primary'),
      textColor: ref('colors', 'on-primary'),
      ...typographyRef(LABEL_TYPOGRAPHY),
      rounded: ref('rounded', 'md'),
      padding: literal('12px 20px'),
    }),
    component('button-primary-hover', {
      backgroundColor: ref('colors', 'primary-hover'),
      textColor: ref('colors', 'on-primary'),
    }),
    component('button-secondary', {
      backgroundColor: ref('colors', 'surface'),
      textColor: ref('colors', secondaryButtonText),
      ...typographyRef(LABEL_TYPOGRAPHY),
      rounded: ref('rounded', 'md'),
      padding: literal('12px 20px'),
    }),
    component('card', {
      backgroundColor: ref('colors', 'surface'),
      textColor: ref('colors', 'on-surface'),
      ...typographyRef(BODY_TYPOGRAPHY),
      rounded: ref('rounded', 'lg'),
      padding: ref('spacing', 'lg'),
    }),
    component('input', {
      backgroundColor: ref('colors', 'surface'),
      textColor: ref('colors', 'on-surface'),
      ...typographyRef(BODY_TYPOGRAPHY),
      rounded: ref('rounded', 'md'),
      padding: literal('10px 14px'),
    }),
  ]

  return { colors, spacing, rounded, components }
}

