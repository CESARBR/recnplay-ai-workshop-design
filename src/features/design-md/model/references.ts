// Referências de componentes a tokens. Internamente apontam para o id do token;
// no DESIGN.md viram `{grupo.nome}` com o nome atual.
import { refString } from './rules'
import type {
  AnyToken,
  ComponentDef,
  ComponentProperty,
  Draft,
  Id,
  PropertyValue,
  TokenByGroup,
  TokenGroup,
} from './types'

export const getTokens = <G extends TokenGroup>(draft: Draft, group: G) =>
  draft[group] as TokenByGroup[G][]

export const findToken = (draft: Draft, group: TokenGroup, tokenId: Id): AnyToken | undefined =>
  getTokens(draft, group).find((token) => token.id === tokenId)

/** Texto de um valor de propriedade como aparece no DESIGN.md. */
export function propertyValueToString(draft: Draft, value: PropertyValue): string {
  switch (value.kind) {
    case 'literal':
      return value.value
    case 'broken':
      return refString(value.group, value.name)
    case 'ref': {
      // Um ref para token inexistente não deveria ocorrer (o reducer converte em `broken`),
      // mas, se ocorrer, vira uma referência obviamente quebrada, sinalizada pelo lint.
      const token = findToken(draft, value.group, value.tokenId)
      return refString(value.group, token?.name ?? `token-removido-${value.tokenId.slice(0, 8)}`)
    }
  }
}

export type TokenUsage = { componentId: Id; componentName: string; property: ComponentProperty }

/** Componentes e propriedades que referenciam um token (para confirmar a remoção). */
export function findTokenUsages(draft: Draft, group: TokenGroup, tokenId: Id): TokenUsage[] {
  return draft.components.flatMap((component) =>
    Object.entries(component.properties)
      .filter(([, value]) => value?.kind === 'ref' && value.group === group && value.tokenId === tokenId)
      .map(([property]) => ({
        componentId: component.id,
        componentName: component.name,
        property: property as ComponentProperty,
      })),
  )
}

const mapProperties = (
  components: ComponentDef[],
  mapValue: (value: PropertyValue) => PropertyValue,
): ComponentDef[] =>
  components.map((component) => {
    let changed = false
    const properties: ComponentDef['properties'] = {}
    for (const [property, value] of Object.entries(component.properties)) {
      if (!value) continue
      const next = mapValue(value)
      if (next !== value) changed = true
      properties[property as ComponentProperty] = next
    }
    return changed ? { ...component, properties } : component
  })

/** Ao remover um token, as referências a ele passam a ser referências quebradas pelo nome. */
export const breakReferences = (
  components: ComponentDef[],
  group: TokenGroup,
  tokenId: Id,
  name: string,
) =>
  mapProperties(components, (value) =>
    value.kind === 'ref' && value.group === group && value.tokenId === tokenId
      ? { kind: 'broken', group, name }
      : value,
  )

/** Ao criar ou renomear um token, referências quebradas com o mesmo nome voltam a apontar para ele. */
export const reconnectReferences = (
  components: ComponentDef[],
  group: TokenGroup,
  name: string,
  tokenId: Id,
) =>
  mapProperties(components, (value) =>
    value.kind === 'broken' && value.group === group && value.name === name
      ? { kind: 'ref', group, tokenId }
      : value,
  )
