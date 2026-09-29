// Utilitários de teste para montar e editar rascunhos pelo nome dos tokens.
import { parse } from 'yaml'

import { createInitialDraft } from '../model/initial-state'
import { draftReducer, type DraftAction } from '../model/reducer'
import { getTokens } from '../model/references'
import type { Draft, TokenGroup } from '../model/types'

export const initialDraft = () => createInitialDraft()

export const apply = (draft: Draft, ...actions: DraftAction[]) => actions.reduce(draftReducer, draft)

export function tokenId(draft: Draft, group: TokenGroup, name: string) {
  const token = getTokens(draft, group).find((candidate) => candidate.name === name)
  if (!token) throw new Error(`token ${group}.${name} não existe`)
  return token.id
}

export function componentId(draft: Draft, name: string) {
  const component = draft.components.find((candidate) => candidate.name === name)
  if (!component) throw new Error(`componente ${name} não existe`)
  return component.id
}

/** Separa o frontmatter do DESIGN.md e interpreta o YAML. */
export function parseFrontmatter(content: string) {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(content)
  if (!match) throw new Error('DESIGN.md sem frontmatter')
  return parse(match[1], { uniqueKeys: true }) as Record<string, any>
}

/** Títulos `##` do corpo, na ordem. */
export const sectionHeadings = (content: string) =>
  [...content.matchAll(/^## (.+)$/gm)].map((match) => match[1])
