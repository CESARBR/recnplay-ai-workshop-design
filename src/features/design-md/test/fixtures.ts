import { readFileSync } from 'node:fs'

/** O DESIGN.md do CESAR, na raiz do projeto. */
export const cesarDesignMd = readFileSync(new URL('../../../../DESIGN.md', import.meta.url), 'utf-8')

/** Variação com referência quebrada e dimensão inválida, para exercitar erros. */
export const brokenDesignMd = cesarDesignMd
  .replace('"{colors.tertiary}"', '"{colors.nao-existe}"')
  .replace('  sm: 6px', '  sm: 6xx')

/** Variação com cor em formato não-hex (a spec aceita qualquer cor CSS). */
export const oklchDesignMd = cesarDesignMd.replace('primary: "#201813"', 'primary: "oklch(0.25 0.02 50)"')
