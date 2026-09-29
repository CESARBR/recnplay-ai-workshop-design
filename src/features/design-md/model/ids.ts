import type { Id } from './types'

/** Id interno estável de tokens e componentes (nunca aparece no DESIGN.md). */
export const createId = (): Id => crypto.randomUUID()
