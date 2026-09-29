/** Move o foco para um campo depois que o React renderizar a mudança (ex.: item recém-criado). */
export function focusFieldSoon(fieldId: string) {
  requestAnimationFrame(() => document.getElementById(fieldId)?.focus())
}

/**
 * Leva a pessoa até um campo que pode ainda não estar na tela (ex.: seção do acordeão
 * recém-aberta): espera o elemento existir, rola até ele e move o foco.
 */
export function revealFieldWhenReady(fieldId: string, attempts = 30) {
  const element = document.getElementById(fieldId)
  if (element) {
    element.scrollIntoView?.({ block: 'center' })
    element.focus({ preventScroll: true })
    return
  }
  if (attempts > 0) requestAnimationFrame(() => revealFieldWhenReady(fieldId, attempts - 1))
}

/** Seção do acordeão que contém um campo, pelo prefixo do `fieldId`. */
export function sectionForField(fieldId: string): string | undefined {
  const prefix = fieldId.replace(/^group-/, '').split('-')[0]
  return ['identity', 'colors', 'typography', 'spacing', 'rounded', 'components', 'guidance'].includes(prefix)
    ? prefix
    : undefined
}
