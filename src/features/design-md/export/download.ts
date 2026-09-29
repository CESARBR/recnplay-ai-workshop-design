// Download de arquivo gerado no navegador (site estático: não há servidor para servir o arquivo).

export const DESIGN_MD_FILENAME = 'DESIGN.md'
export const DESIGN_MD_MIME = 'text/markdown;charset=utf-8'

/** Baixa o texto exatamente como recebido, codificado em UTF-8. */
export function downloadText(text: string, filename = DESIGN_MD_FILENAME, type = DESIGN_MD_MIME) {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  link.remove()
  // Alguns navegadores só iniciam o download depois do clique; libera a URL em seguida.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
