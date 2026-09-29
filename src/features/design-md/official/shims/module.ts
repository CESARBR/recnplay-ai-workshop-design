// Substituto de `node:module`. O bundle da biblioteca usa `createRequire` para carregar
// `process`, `tty`, `util` e `buffer` — os dois últimos só em caminhos de log/debug.
import browserProcess from './process'

const modules: Record<string, unknown> = {
  process: browserProcess,
  tty: { isatty: () => false },
  util: {
    inspect: (value: unknown) => String(value),
    deprecate: <T>(fn: T) => fn,
    format: (...args: unknown[]) => args.map(String).join(' '),
  },
  buffer: {},
}

export function createRequire() {
  return (id: string) => {
    if (id in modules) return modules[id]
    throw new Error(`design-md-shims: require("${id}") não é suportado no navegador`)
  }
}

export default { createRequire }
