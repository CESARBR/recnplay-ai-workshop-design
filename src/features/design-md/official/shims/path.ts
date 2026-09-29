// Substituto de `node:path`. A biblioteca só monta caminhos (do spec-config e do VFile
// do unified), que não são usados no navegador; basta devolver algo coerente.
const join = (...parts: string[]) => parts.filter(Boolean).join('/')

export const sep = '/'
export const resolve = join
export { join }
export const dirname = (path: string) => path.split('/').slice(0, -1).join('/') || '/'
export const basename = (path: string, ext = '') => {
  const base = path.split('/').pop() ?? ''
  return ext && base.endsWith(ext) ? base.slice(0, -ext.length) : base
}
export const extname = (path: string) => {
  const base = basename(path)
  const index = base.lastIndexOf('.')
  return index > 0 ? base.slice(index) : ''
}

export default { sep, resolve, join, dirname, basename, extname }
