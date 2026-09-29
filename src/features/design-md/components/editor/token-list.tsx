// Estrutura comum das listas de tokens: contagem, adicionar, remover (com confirmação
// quando o token está em uso) e foco previsível depois de cada ação.
import { useState, type ReactNode } from 'react'
import { Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { fieldIds } from '../../model/field-ids'
import { createId } from '../../model/ids'
import type { DraftAction } from '../../model/reducer'
import { findTokenUsages, type TokenUsage } from '../../model/references'
import type { Draft, TokenByGroup, TokenGroup } from '../../model/types'
import { ConfirmDialog } from '../confirm-dialog'
import { focusFieldSoon } from './focus'

export const TOKEN_LABEL: Record<TokenGroup, { singular: string; add: string; empty: string }> = {
  colors: { singular: 'cor', add: 'Adicionar cor', empty: 'Nenhuma cor definida.' },
  typography: { singular: 'estilo', add: 'Adicionar estilo', empty: 'Nenhum estilo de texto definido.' },
  rounded: { singular: 'nível', add: 'Adicionar nível', empty: 'Nenhum nível de arredondamento definido.' },
  spacing: { singular: 'nível', add: 'Adicionar nível', empty: 'Nenhum nível de espaçamento definido.' },
}

type TokenListProps<G extends TokenGroup> = {
  group: G
  draft: Draft
  dispatch: (action: DraftAction) => void
  /** Texto de ajuda sobre os valores aceitos no grupo. */
  hint?: ReactNode
  renderFields: (token: TokenByGroup[G]) => ReactNode
}

export function TokenList<G extends TokenGroup>({ group, draft, dispatch, hint, renderFields }: TokenListProps<G>) {
  const labels = TOKEN_LABEL[group]
  const tokens = draft[group] as TokenByGroup[G][]
  const [pendingRemoval, setPendingRemoval] = useState<{ token: TokenByGroup[G]; usages: TokenUsage[] }>()

  const add = () => {
    const id = createId()
    dispatch({ type: 'addToken', group, id })
    focusFieldSoon(fieldIds.token(group, id, 'name'))
  }

  const remove = (token: TokenByGroup[G]) => {
    dispatch({ type: 'removeToken', group, id: token.id })
    focusFieldSoon(fieldIds.group(group))
  }

  const requestRemoval = (token: TokenByGroup[G]) => {
    const usages = findTokenUsages(draft, group, token.id)
    if (usages.length) setPendingRemoval({ token, usages })
    else remove(token)
  }

  return (
    <div className="flex flex-col gap-md">
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}

      {tokens.length ? (
        <ul className="flex flex-col gap-sm">
          {tokens.map((token) => {
            const tokenName = token.name.trim() || 'sem nome'
            return (
              <li key={token.id}>
                <fieldset className="flex items-start gap-sm rounded-sm border bg-neutral p-4">
                  <legend className="sr-only">
                    {labels.singular} {tokenName}
                  </legend>
                  <div className="min-w-0 flex-1">{renderFields(token)}</div>
                  <Button
                    type="button"
                    variant="destructive-ghost"
                    size="icon"
                    className="mt-5 shrink-0"
                    aria-label={`Remover ${labels.singular} ${tokenName}`}
                    onClick={() => requestRemoval(token)}
                  >
                    <Trash2 />
                  </Button>
                </fieldset>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">{labels.empty}</p>
      )}

      <div>
        <Button type="button" variant="outline" id={fieldIds.group(group)} onClick={add}>
          <Plus /> {labels.add}
        </Button>
      </div>

      <ConfirmDialog
        open={pendingRemoval !== undefined}
        onOpenChange={(open) => !open && setPendingRemoval(undefined)}
        title={`Remover “${pendingRemoval?.token.name}”?`}
        description={
          <>
            <span>Este token é usado por:</span>
            <ul className="list-disc pl-5">
              {pendingRemoval?.usages.map((usage) => (
                <li key={`${usage.componentId}-${usage.property}`}>
                  <code>{usage.componentName}</code> ({usage.property})
                </li>
              ))}
            </ul>
            <span>
              As referências ficarão quebradas e aparecerão como erro até você escolher outro token nesses
              componentes.
            </span>
          </>
        }
        confirmLabel="Remover mesmo assim"
        onConfirm={() => pendingRemoval && remove(pendingRemoval.token)}
      />
    </div>
  )
}
