// Rascunho do editor no localStorage.
// No GitHub Pages todos os sites de `usuario.github.io/*` dividem o mesmo localStorage,
// por isso a chave tem prefixo do projeto e versão do formato do rascunho.
import { GUIDANCE_KEYS, type Draft } from './types'

export const DRAFT_STORAGE_KEY = 'recnplay-designmd:draft:v1'
const DRAFT_FORMAT_VERSION = 1

type StoredDraft = { version: typeof DRAFT_FORMAT_VERSION; savedAt: string; draft: Draft }

export type LoadDraftResult =
  | { status: 'empty' }
  | { status: 'loaded'; draft: Draft; savedAt: string }
  /** Havia um rascunho, mas ilegível ou de outro formato: foi descartado. */
  | { status: 'discarded' }

/** Storage do navegador, se disponível (pode estar bloqueado em modo privado ou por política). */
function browserStorage(): Storage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage
  } catch {
    return undefined
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
const isString = (value: unknown): value is string => typeof value === 'string'
const hasStrings = (value: unknown, keys: readonly string[]) =>
  isRecord(value) && keys.every((key) => isString(value[key]))

const PROPERTY_VALUE_KEYS = { ref: ['group', 'tokenId'], broken: ['group', 'name'], literal: ['value'] } as const

/** Verifica a forma do rascunho salvo, para nunca carregar dados que quebrem o editor. */
export function isDraft(value: unknown): value is Draft {
  if (!hasStrings(value, ['name', 'description'])) return false
  const draft = value as Record<string, unknown>
  const tokenList = (keys: readonly string[]) => (list: unknown) =>
    Array.isArray(list) && list.every((token) => hasStrings(token, ['id', 'name', ...keys]))

  return (
    tokenList(['value'])(draft.colors) &&
    tokenList(['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing'])(draft.typography) &&
    tokenList(['value'])(draft.rounded) &&
    tokenList(['value'])(draft.spacing) &&
    Array.isArray(draft.components) &&
    draft.components.every(
      (component) =>
        hasStrings(component, ['id', 'name']) &&
        isRecord(component.properties) &&
        Object.values(component.properties).every((property) => {
          if (!isRecord(property) || !isString(property.kind)) return false
          const keys = PROPERTY_VALUE_KEYS[property.kind as keyof typeof PROPERTY_VALUE_KEYS]
          return keys !== undefined && hasStrings(property, keys)
        }),
    ) &&
    hasStrings(draft.guidance, GUIDANCE_KEYS)
  )
}

export function loadDraft(storage: Storage | undefined = browserStorage()): LoadDraftResult {
  if (!storage) return { status: 'empty' }
  let raw: string | null
  try {
    raw = storage.getItem(DRAFT_STORAGE_KEY)
  } catch {
    return { status: 'empty' }
  }
  if (raw === null) return { status: 'empty' }

  try {
    const stored = JSON.parse(raw) as Partial<StoredDraft>
    if (stored.version === DRAFT_FORMAT_VERSION && isDraft(stored.draft) && isString(stored.savedAt))
      return { status: 'loaded', draft: stored.draft, savedAt: stored.savedAt }
  } catch {
    // JSON corrompido: descarta abaixo.
  }
  clearDraft(storage)
  return { status: 'discarded' }
}

/** Salva o rascunho; devolve `false` se o navegador não permitir (cota, modo privado…). */
export function saveDraft(draft: Draft, storage: Storage | undefined = browserStorage()): boolean {
  if (!storage) return false
  const stored: StoredDraft = { version: DRAFT_FORMAT_VERSION, savedAt: new Date().toISOString(), draft }
  try {
    storage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(stored))
    return true
  } catch {
    return false
  }
}

export function clearDraft(storage: Storage | undefined = browserStorage()): void {
  try {
    storage?.removeItem(DRAFT_STORAGE_KEY)
  } catch {
    // Sem acesso ao storage: nada a limpar.
  }
}
