// Ponto único de acesso à biblioteca oficial `@google/design.md` (lint no navegador).
// A versão é fixada no package.json; mudar a versão exige rodar os testes de paridade com a CLI.
import {
  contrastRatio,
  lint,
  type ComponentDef as ResolvedComponent,
  type DesignSystemState,
  type Finding,
  type ResolvedValue,
} from '@google/design.md/linter'

export type { DesignSystemState, Finding, ResolvedComponent, ResolvedValue }

/** Razão de contraste WCAG da biblioteca oficial (a mesma usada pela regra `contrast-ratio`). */
export { contrastRatio }

/** Versão fixada da CLI/biblioteca oficial usada no lint. */
export const DESIGN_MD_CLI_VERSION = '0.4.0'
/** Valor de `version` do formato gerado, conforme a especificação dessa versão da CLI. */
export const DESIGN_MD_SPEC_VERSION = 'alpha'

export type LintSummary = { errors: number; warnings: number; infos: number }

export type DesignMdLintResult = {
  findings: Finding[]
  summary: LintSummary
  /** Modelo resolvido pela biblioteca; ausente se o documento não pôde ser interpretado. */
  designSystem?: DesignSystemState
}

/** Regra atribuída quando a biblioteca não consegue interpretar o documento. */
export const PARSE_FAILURE_RULE = 'parse-failure'

export function lintDesignMd(content: string): DesignMdLintResult {
  try {
    const report = lint(content)
    return { findings: report.findings, summary: report.summary, designSystem: report.designSystem }
  } catch (error) {
    // `lint` lança exceção quando o parse falha de forma irrecuperável; nunca travar a ferramenta.
    const message = error instanceof Error ? error.message : String(error)
    return {
      findings: [{ severity: 'error', rule: PARSE_FAILURE_RULE, message }],
      summary: { errors: 1, warnings: 0, infos: 0 },
    }
  }
}

type ResolvedColor = Extract<ResolvedValue, { type: 'color' }>

const colorCache = new Map<string, ResolvedColor | null>()
const COLOR_CACHE_LIMIT = 500

/**
 * Resolve uma cor CSS com o próprio parser da biblioteca oficial (mesmas regras da spec),
 * convertida para sRGB. Devolve `undefined` se a cor for inválida.
 */
export function resolveCssColor(value: string): ResolvedColor | undefined {
  const color = value.trim()
  const cached = colorCache.get(color)
  if (cached !== undefined) return cached ?? undefined

  // JSON.stringify gera uma string YAML válida (aspas duplas) para qualquer valor.
  const probe = `---\nname: probe\ncolors:\n  probe: ${JSON.stringify(color)}\n---\n`
  const result = lintDesignMd(probe)
  const invalid = result.findings.some((finding) => finding.severity === 'error' && finding.path === 'colors.probe')
  const resolved = invalid ? undefined : result.designSystem?.colors.get('probe')

  if (colorCache.size >= COLOR_CACHE_LIMIT) colorCache.clear()
  colorCache.set(color, resolved ?? null)
  return resolved
}

/**
 * Valida uma cor CSS com o parser da biblioteca oficial.
 * A biblioteca não valida cores literais em componentes, então o editor usa esta função.
 */
export const isValidCssColor = (value: string) => resolveCssColor(value) !== undefined
