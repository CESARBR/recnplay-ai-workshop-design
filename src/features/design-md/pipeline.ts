// Pipeline único do gerador: estado do editor → texto DESIGN.md → lint oficial.
// Prévia, painel de problemas e exportação derivam todos deste resultado.
import { fieldIds } from './model/field-ids'
import { propertyValueToString } from './model/references'
import { COMPONENT_PROPERTIES, TOKEN_GROUPS, type Draft, type TokenGroup } from './model/types'
import {
  emittableComponents,
  emittableProperties,
  emittableTokens,
  TYPOGRAPHY_FIELDS,
  validateDraft,
  type EditorIssue,
} from './model/validation'
import { contrastRatio, lintDesignMd, type DesignMdLintResult, type DesignSystemState, type Finding } from './official'
import { derivePreview, type PreviewModel } from './preview/model'
import { serializeDesignMd } from './serialize/design-md'

export type LocatedFinding = Finding & {
  /** Campo do editor ligado ao achado, quando for possível localizá-lo. */
  fieldId?: string
}

/** Mínimo do WCAG AA para texto normal, o mesmo da regra `contrast-ratio` da CLI. */
export const WCAG_AA_MINIMUM = 4.5

/**
 * Par texto/fundo de um componente. A CLI só reporta os reprovados; os aprovados e os não
 * verificáveis (cor com transparência, que a CLI avalia ignorando o alfa) são calculados aqui.
 */
export type ContrastCheck = {
  componentName: string
  ratio: number
  status: 'pass' | 'fail' | 'unverified'
}

export type DesignMdBuild = {
  /** Estado que gerou este resultado (o pipeline roda sobre o valor adiado). */
  draft: Draft
  content: string
  editorIssues: EditorIssue[]
  lint: DesignMdLintResult
  findings: LocatedFinding[]
  contrastChecks: ContrastCheck[]
  preview: PreviewModel
  /** Erros bloqueantes (editor + lint). Com erros, o DESIGN.md não pode ser exportado. */
  errorCount: number
  canExport: boolean
}

const REF_IN_MESSAGE = /\{([a-z]+)\.([^}\s]+)\}/

/** Liga um achado do lint oficial (`path` do DESIGN.md) ao campo correspondente do editor. */
export function locateFinding(draft: Draft, finding: Finding): string | undefined {
  if (!finding.path) return undefined
  const [root, name, field] = finding.path.split('.')

  if (TOKEN_GROUPS.includes(root as TokenGroup)) {
    const group = root as TokenGroup
    if (!name) return fieldIds.group(group)
    const token = emittableTokens(draft, group).find((candidate) => candidate.name === name)
    if (!token) return undefined
    if (group === 'typography')
      return fieldIds.token(group, token.id, TYPOGRAPHY_FIELDS.find((candidate) => candidate === field) ?? 'name')
    return fieldIds.token(group, token.id, 'value')
  }

  if (root === 'components') {
    if (!name) return fieldIds.group('components')
    const component = emittableComponents(draft).find((candidate) => candidate.name === name)
    if (!component) return undefined

    const property = COMPONENT_PROPERTIES.find((candidate) => candidate === field)
    if (property) return fieldIds.component(component.id, property)

    if (finding.rule === 'broken-ref') {
      const ref = REF_IN_MESSAGE.exec(finding.message)?.[0]
      const broken = emittableProperties(component).find(([, value]) => propertyValueToString(draft, value) === ref)
      if (broken) return fieldIds.component(component.id, broken[0])
    }
    if (finding.rule === 'contrast-ratio') return fieldIds.component(component.id, 'textColor')
    return fieldIds.component(component.id, 'name')
  }

  return undefined
}

export function checkContrast(designSystem: DesignSystemState | undefined): ContrastCheck[] {
  if (!designSystem) return []
  const checks: ContrastCheck[] = []
  for (const [componentName, component] of designSystem.components) {
    const background = component.properties.get('backgroundColor')
    const text = component.properties.get('textColor')
    const isColor = (value: unknown) => typeof value === 'object' && value !== null && 'type' in value && value.type === 'color'
    if (!isColor(background) || !isColor(text)) continue
    const [bg, fg] = [background, text] as Extract<typeof background, { type: 'color' }>[]
    const ratio = contrastRatio(bg, fg)
    const translucent = (bg.a ?? 1) < 1 || (fg.a ?? 1) < 1
    checks.push({
      componentName,
      ratio,
      status: ratio < WCAG_AA_MINIMUM ? 'fail' : translucent ? 'unverified' : 'pass',
    })
  }
  return checks
}

export function buildDesignMd(draft: Draft): DesignMdBuild {
  const content = serializeDesignMd(draft)
  const editorIssues = validateDraft(draft)
  const lint = lintDesignMd(content)
  const findings = lint.findings.map((finding) => ({ ...finding, fieldId: locateFinding(draft, finding) }))
  const errorCount = editorIssues.filter((issue) => issue.severity === 'error').length + lint.summary.errors

  return {
    draft,
    content,
    editorIssues,
    lint,
    findings,
    contrastChecks: checkContrast(lint.designSystem),
    preview: derivePreview(draft, lint.designSystem),
    errorCount,
    canExport: errorCount === 0,
  }
}
