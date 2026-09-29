// Regras do formato usadas pelo editor, pelo serializador e pela validação.
import type { ComponentProperty, TokenGroup } from './types'

/** Nome seguro como chave YAML e dentro de `{grupo.nome}`. */
export const TOKEN_NAME_PATTERN = /^[a-z0-9][a-z0-9-]*$/

/** Grupo de tokens que cada propriedade de componente pode referenciar. */
export const PROPERTY_REF_GROUP: Record<ComponentProperty, TokenGroup> = {
  backgroundColor: 'colors',
  textColor: 'colors',
  typography: 'typography',
  rounded: 'rounded',
  padding: 'spacing',
  size: 'spacing',
  height: 'spacing',
  width: 'spacing',
}

/** `typography` só aceita referência; as demais aceitam também um valor literal. */
export const PROPERTY_ACCEPTS_LITERAL: Record<ComponentProperty, boolean> = {
  backgroundColor: true,
  textColor: true,
  typography: false,
  rounded: true,
  padding: true,
  size: true,
  height: true,
  width: true,
}

/** Número sem unidade (ex.: `8`, `1.5`), serializado como número no YAML. */
export const UNITLESS_NUMBER_PATTERN = /^-?\d+(?:\.\d+)?$/

/** Dimensão da spec: número + unidade `px`, `em` ou `rem` (ex.: `8px`, `-0.02em`, `.5rem`). */
export const DIMENSION_PATTERN = /^-?(?:\d+(?:\.\d+)?|\.\d+)(?:px|em|rem)$/

/** Valor aceito em `spacing`: dimensão ou número sem unidade. */
export const isDimensionOrNumber = (value: string) =>
  DIMENSION_PATTERN.test(value) || UNITLESS_NUMBER_PATTERN.test(value)

/**
 * Medida literal de componente (`padding`, `rounded`, `size`…): de 1 a 4 dimensões separadas
 * por espaço, como no atalho CSS (ex.: `12px 20px`, usado no exemplo inicial).
 */
export const isDimensionList = (value: string) => {
  const parts = value.trim().split(/\s+/)
  return parts.length <= 4 && parts.every(isDimensionOrNumber)
}

/** Rótulos em pt-BR das propriedades de componente (editor e texto do DESIGN.md). */
export const PROPERTY_LABEL: Record<ComponentProperty, string> = {
  backgroundColor: 'Fundo',
  textColor: 'Texto',
  typography: 'Tipografia',
  rounded: 'Arredondamento',
  padding: 'Espaçamento interno',
  size: 'Tamanho',
  height: 'Altura',
  width: 'Largura',
}

export const refString = (group: TokenGroup, name: string) => `{${group}.${name}}`
