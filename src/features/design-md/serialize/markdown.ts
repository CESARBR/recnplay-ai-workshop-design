// Utilitários de Markdown para o corpo do DESIGN.md.

/**
 * Prepara um texto livre para entrar numa seção sem alterar a estrutura do documento:
 * - linhas iniciadas por `#` viram texto (senão criariam seções novas ou fora de ordem);
 * - linhas só com `===` ou `---` são escapadas (senão transformariam a linha anterior num título);
 * - quebras de linha são preservadas.
 */
export function escapeFreeText(text: string): string {
  return text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => {
      if (/^\s{0,3}#/.test(line)) return line.replace('#', '\\#')
      if (/^\s{0,3}(?:=+|-+)\s*$/.test(line)) return line.replace(/[=-]/, (char) => `\\${char}`)
      return line
    })
    .join('\n')
    .trim()
}

/** Código inline seguro mesmo que o valor contenha crase. */
export function inlineCode(value: string): string {
  if (!value.includes('`')) return `\`${value}\``
  return `\`\` ${value} \`\``
}
