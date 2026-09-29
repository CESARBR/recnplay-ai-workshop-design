// Estado do gerador: reducer do editor + pipeline derivado + rascunho no localStorage.
import { useCallback, useDeferredValue, useEffect, useMemo, useReducer, useRef, useState } from 'react'

import { createInitialDraft } from '../model/initial-state'
import { draftReducer, type DraftAction } from '../model/reducer'
import { clearDraft, loadDraft, saveDraft, type LoadDraftResult } from '../model/storage'
import type { Draft } from '../model/types'
import { buildDesignMd } from '../pipeline'

const AUTOSAVE_DELAY_MS = 500

type InitialState = { draft: Draft; origin: LoadDraftResult['status'] }

function loadInitialState(): InitialState {
  const stored = loadDraft()
  return stored.status === 'loaded'
    ? { draft: stored.draft, origin: 'loaded' }
    : { draft: createInitialDraft(), origin: stored.status }
}

export function useDesignSystem() {
  const [initial] = useState(loadInitialState)
  const [draft, dispatchDraft] = useReducer(draftReducer, initial.draft)
  // Rascunho "intocado" (exemplo recém-carregado ou restaurado) não é salvo.
  const pristine = useRef(initial.origin !== 'loaded')
  const latestDraft = useRef(draft)
  latestDraft.current = draft

  // O pipeline (serialização + lint) roda sobre o valor adiado: a digitação nunca trava.
  const deferredDraft = useDeferredValue(draft)
  const build = useMemo(() => buildDesignMd(deferredDraft), [deferredDraft])
  const isUpdating = deferredDraft !== draft

  const dispatch = useCallback((action: DraftAction) => {
    pristine.current = action.type === 'reset'
    if (action.type === 'reset') clearDraft()
    dispatchDraft(action)
  }, [])

  useEffect(() => {
    if (pristine.current) return
    const timer = setTimeout(() => saveDraft(draft), AUTOSAVE_DELAY_MS)
    return () => clearTimeout(timer)
  }, [draft])

  // Garante que a última edição seja salva ao fechar ou trocar de aba.
  useEffect(() => {
    const flush = () => {
      if (!pristine.current) saveDraft(latestDraft.current)
    }
    window.addEventListener('pagehide', flush)
    return () => {
      window.removeEventListener('pagehide', flush)
      flush()
    }
  }, [])

  return {
    draft,
    dispatch,
    build,
    /** A prévia/lint ainda refletem uma versão anterior (atualização em andamento). */
    isUpdating,
    /** Como o editor começou: rascunho salvo, exemplo, ou exemplo após descartar rascunho inválido. */
    initialOrigin: initial.origin,
  }
}
