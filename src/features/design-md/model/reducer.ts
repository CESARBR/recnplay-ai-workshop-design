// Ações do editor. Todas as funções são puras; o estado é o `Draft`.
import { createId } from './ids'
import { createInitialDraft } from './initial-state'
import { breakReferences, getTokens, reconnectReferences } from './references'
import type {
  AnyToken,
  ComponentDef,
  ComponentProperty,
  Draft,
  GuidanceKey,
  Id,
  PropertyValue,
  TokenByGroup,
  TokenGroup,
} from './types'

/** `patch` tipado de acordo com o grupo do token. */
type UpdateTokenAction = {
  [G in TokenGroup]: { type: 'updateToken'; group: G; id: Id; patch: Partial<Omit<TokenByGroup[G], 'id'>> }
}[TokenGroup]

export type DraftAction =
  | { type: 'setName'; name: string }
  | { type: 'setDescription'; description: string }
  | { type: 'addToken'; group: TokenGroup; id?: Id }
  | UpdateTokenAction
  | { type: 'removeToken'; group: TokenGroup; id: Id }
  | { type: 'addComponent'; id?: Id }
  | { type: 'renameComponent'; id: Id; name: string }
  | { type: 'removeComponent'; id: Id }
  | { type: 'setComponentProperty'; id: Id; property: ComponentProperty; value: PropertyValue | undefined }
  | { type: 'addComponentState'; id: Id; state: string; newId?: Id }
  | { type: 'setGuidance'; key: GuidanceKey; text: string }
  /** Geração rápida: substitui cores, escalas e componentes; preserva o resto. */
  | { type: 'applyGenerated'; generated: Pick<Draft, 'colors' | 'rounded' | 'spacing' | 'components'> }
  | { type: 'replaceDraft'; draft: Draft }
  | { type: 'reset' }

const NEW_TOKEN_PREFIX: Record<TokenGroup, string> = {
  colors: 'cor',
  typography: 'texto',
  rounded: 'raio',
  spacing: 'espaco',
}

/** Primeiro nome livre na forma `prefixo-1`, `prefixo-2`… */
export function nextFreeName(prefix: string, taken: string[]): string {
  const names = new Set(taken)
  for (let index = 1; ; index++) {
    const candidate = `${prefix}-${index}`
    if (!names.has(candidate)) return candidate
  }
}

function newToken(group: TokenGroup, id: Id, name: string): AnyToken {
  switch (group) {
    case 'colors':
      return { id, name, value: '#000000' }
    case 'typography':
      return { id, name, fontFamily: '', fontSize: '1rem', fontWeight: '400', lineHeight: '', letterSpacing: '' }
    case 'rounded':
      return { id, name, value: '4px' }
    case 'spacing':
      return { id, name, value: '8px' }
  }
}

const withTokens = <G extends TokenGroup>(draft: Draft, group: G, tokens: TokenByGroup[G][]): Draft => ({
  ...draft,
  [group]: tokens,
})

const updateComponent = (draft: Draft, id: Id, update: (component: ComponentDef) => ComponentDef): Draft => ({
  ...draft,
  components: draft.components.map((component) => (component.id === id ? update(component) : component)),
})

export function draftReducer(draft: Draft, action: DraftAction): Draft {
  switch (action.type) {
    case 'setName':
      return { ...draft, name: action.name }

    case 'setDescription':
      return { ...draft, description: action.description }

    case 'addToken': {
      const tokens = getTokens(draft, action.group)
      const id = action.id ?? createId()
      const name = nextFreeName(NEW_TOKEN_PREFIX[action.group], tokens.map((token) => token.name))
      return withTokens(draft, action.group, [...tokens, newToken(action.group, id, name)] as never)
    }

    case 'updateToken': {
      const tokens = getTokens(draft, action.group)
      const next = withTokens(
        draft,
        action.group,
        tokens.map((token) => (token.id === action.id ? { ...token, ...action.patch } : token)) as never,
      )
      const newName = action.patch.name
      return newName === undefined
        ? next
        : { ...next, components: reconnectReferences(next.components, action.group, newName, action.id) }
    }

    case 'removeToken': {
      const tokens = getTokens(draft, action.group)
      const removed = tokens.find((token) => token.id === action.id)
      if (!removed) return draft
      return {
        ...withTokens(draft, action.group, tokens.filter((token) => token.id !== action.id) as never),
        components: breakReferences(draft.components, action.group, action.id, removed.name),
      }
    }

    case 'addComponent': {
      const name = nextFreeName('componente', draft.components.map((component) => component.name))
      return { ...draft, components: [...draft.components, { id: action.id ?? createId(), name, properties: {} }] }
    }

    case 'renameComponent':
      return updateComponent(draft, action.id, (component) => ({ ...component, name: action.name }))

    case 'removeComponent':
      return { ...draft, components: draft.components.filter((component) => component.id !== action.id) }

    case 'setComponentProperty':
      return updateComponent(draft, action.id, (component) => {
        const properties = { ...component.properties }
        if (action.value === undefined) delete properties[action.property]
        else properties[action.property] = action.value
        return { ...component, properties }
      })

    case 'addComponentState': {
      // Estados (hover, active…) são componentes separados, relacionados pelo nome: `button-primary-hover`.
      const index = draft.components.findIndex((component) => component.id === action.id)
      if (index === -1) return draft
      const base = draft.components[index]
      const taken = new Set(draft.components.map((component) => component.name))
      let name = `${base.name}-${action.state}`
      for (let suffix = 2; taken.has(name); suffix++) name = `${base.name}-${action.state}-${suffix}`
      const state: ComponentDef = { id: action.newId ?? createId(), name, properties: { ...base.properties } }
      const components = [...draft.components]
      components.splice(index + 1, 0, state)
      return { ...draft, components }
    }

    case 'setGuidance':
      return { ...draft, guidance: { ...draft.guidance, [action.key]: action.text } }

    case 'applyGenerated':
      return { ...draft, ...action.generated }

    case 'replaceDraft':
      return action.draft

    case 'reset':
      return createInitialDraft()
  }
}
