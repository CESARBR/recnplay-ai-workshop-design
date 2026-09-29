// Copiar para a área de transferência. O GitHub Pages usa HTTPS, então a API assíncrona
// costuma estar disponível; o fallback com `execCommand` cobre navegadores antigos ou
// permissões negadas.

function copyWithSelection(text: string): boolean {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  // Fora da tela, sem roubar a rolagem nem aparecer para leitores de tela.
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  textarea.setAttribute('aria-hidden', 'true')
  const previousFocus = document.activeElement as HTMLElement | null
  document.body.appendChild(textarea)
  textarea.select()
  try {
    return document.execCommand('copy')
  } catch {
    return false
  } finally {
    textarea.remove()
    previousFocus?.focus()
  }
}

/** Copia o texto exatamente como recebido. Devolve `true` em caso de sucesso. */
export async function copyText(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // Permissão negada ou contexto inseguro: tenta o método antigo.
    }
  }
  return copyWithSelection(text)
}
