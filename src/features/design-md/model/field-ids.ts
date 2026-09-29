// Ids dos campos do editor. São usados como `id` no DOM e permitem que um problema
// de validação ou do lint leve o foco até o campo afetado.
import type { ComponentProperty, GuidanceKey, Id, TokenGroup, TypographyToken } from './types'

export type TokenField = 'name' | 'value' | keyof Omit<TypographyToken, 'id' | 'name'>

export const fieldIds = {
  identity: (field: 'name' | 'description') => `identity-${field}`,
  token: (group: TokenGroup, id: Id, field: TokenField) => `${group}-${id}-${field}`,
  component: (id: Id, field: 'name' | ComponentProperty) => `components-${id}-${field}`,
  guidance: (key: GuidanceKey) => `guidance-${key}`,
  /** Seção inteira de um grupo (ex.: botão "Adicionar" quando o grupo está vazio). */
  group: (group: TokenGroup | 'components') => `group-${group}`,
}
