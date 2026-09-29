// Substituto de `node:url`. Usado apenas para montar o caminho do spec-config.
export const fileURLToPath = (url: string | URL) => String(url)

export default { fileURLToPath }
