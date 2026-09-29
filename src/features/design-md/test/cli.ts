// Utilitário de teste: executa o binário REAL da CLI oficial (sem os shims de navegador),
// que é a referência de paridade para o lint do app.
import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { Finding, LintSummary } from '@/features/design-md/official'

// O pacote só expõe exports ESM (sem `package.json`), então o caminho é montado a partir da raiz.
export const CLI_PACKAGE_DIR = fileURLToPath(new URL('../../../../node_modules/@google/design.md/', import.meta.url))
const CLI_BIN = join(CLI_PACKAGE_DIR, 'dist', 'index.js')

export type CliLintReport = { findings: Finding[]; summary: LintSummary }

export function runCliLint(content: string): CliLintReport {
  // Apesar do README, a CLI 0.4.0 não aceita `-` (stdin) como arquivo; usa um arquivo temporário.
  const dir = mkdtempSync(join(tmpdir(), 'design-md-'))
  const file = join(dir, 'DESIGN.md')
  try {
    writeFileSync(file, content, 'utf-8')
    const result = spawnSync(process.execPath, [CLI_BIN, 'lint', file], { encoding: 'utf-8' })
    // A CLI sai com código 1 quando há erros; o relatório continua no stdout.
    if (!result.stdout) throw new Error(`CLI sem saída: ${result.stderr}`)
    return JSON.parse(result.stdout) as CliLintReport
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}
