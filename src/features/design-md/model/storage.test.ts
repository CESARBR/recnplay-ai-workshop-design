import { describe, expect, it } from 'vitest'

import { apply, initialDraft } from '../test/draft-helpers'
import { clearDraft, DRAFT_STORAGE_KEY, loadDraft, saveDraft } from './storage'

/** Storage em memória com a mesma interface do localStorage. */
function memoryStorage(initial: Record<string, string> = {}): Storage {
  const data = new Map(Object.entries(initial))
  return {
    get length() {
      return data.size
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => void data.delete(key),
    setItem: (key, value) => void data.set(key, value),
  }
}

describe('rascunho no localStorage', () => {
  it('salva e restaura o rascunho completo', () => {
    const storage = memoryStorage()
    const draft = apply(initialDraft(), { type: 'setName', name: 'Meu sistema' }, { type: 'addComponent' })

    expect(saveDraft(draft, storage)).toBe(true)
    const loaded = loadDraft(storage)

    expect(loaded.status).toBe('loaded')
    expect(loaded.status === 'loaded' && loaded.draft).toEqual(draft)
  })

  it('usa uma chave com prefixo do projeto e versão', () => {
    expect(DRAFT_STORAGE_KEY).toBe('recnplay-designmd:draft:v1')
  })

  it('sem rascunho: começa vazio', () => {
    expect(loadDraft(memoryStorage())).toEqual({ status: 'empty' })
  })

  it.each([
    ['JSON corrompido', '{ não é json'],
    ['versão diferente', JSON.stringify({ version: 99, savedAt: 'x', draft: {} })],
    ['forma inválida', JSON.stringify({ version: 1, savedAt: 'x', draft: { name: 'X', colors: 'nada' } })],
    [
      'propriedade de componente inválida',
      JSON.stringify({
        version: 1,
        savedAt: 'x',
        draft: { ...initialDraft(), components: [{ id: 'a', name: 'b', properties: { textColor: { kind: 'x' } } }] },
      }),
    ],
  ])('%s: descarta com segurança', (_, raw) => {
    const storage = memoryStorage({ [DRAFT_STORAGE_KEY]: raw })

    expect(loadDraft(storage)).toEqual({ status: 'discarded' })
    expect(storage.getItem(DRAFT_STORAGE_KEY)).toBeNull()
  })

  it('não quebra se o navegador bloquear o storage', () => {
    const blocked = memoryStorage()
    blocked.setItem = () => {
      throw new DOMException('QuotaExceededError')
    }

    expect(saveDraft(initialDraft(), blocked)).toBe(false)
    expect(() => clearDraft(undefined)).not.toThrow()
    expect(loadDraft(undefined)).toEqual({ status: 'empty' })
  })
})
