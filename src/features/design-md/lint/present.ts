// Apresentação dos problemas em pt-BR: achados do lint oficial (CLI), validação do editor
// e checagens de contraste da ferramenta. A mensagem original da CLI é mantida como detalhe.
import { fieldIds, type TokenField } from '../model/field-ids'
import { PROPERTY_LABEL } from '../model/rules'
import { COMPONENT_PROPERTIES, GUIDANCE_KEYS, type Draft, type GuidanceKey, type TokenGroup } from '../model/types'
import { GROUP_LABEL, TYPOGRAPHY_FIELDS } from '../model/validation'
import { DESIGN_MD_CLI_VERSION, PARSE_FAILURE_RULE, type Finding } from '../official'
import { WCAG_AA_MINIMUM, type DesignMdBuild } from '../pipeline'

export type ProblemSeverity = 'error' | 'warning' | 'info'
export type ProblemOrigin = 'editor' | 'cli'

export type Problem = {
  key: string
  severity: ProblemSeverity
  origin: ProblemOrigin
  rule?: string
  title: string
  message: string
  /** Mensagem original da CLI, quando traduzida. */
  original?: string
  fieldId?: string
  location?: string
}

export const ORIGIN_LABEL: Record<ProblemOrigin, string> = {
  editor: 'Editor',
  cli: `CLI ${DESIGN_MD_CLI_VERSION}`,
}

const formatRatio = (ratio: number | string) => String(ratio).replace('.', ',')

type Translation = { pattern: RegExp; message: (match: RegExpExecArray) => string }

/** Traduções das mensagens da CLI 0.4.0 (texto exato em `@google/design.md/dist/linter`). */
const TRANSLATIONS: Translation[] = [
  {
    pattern: /^'(.*)' is not a valid color\./,
    message: ([, value]) =>
      `“${value}” não é uma cor válida. Use um valor CSS, como #FFFFFF, rgb(0 0 0) ou oklch(0.6 0.2 40).`,
  },
  {
    pattern: /^'(.*)' has an invalid unit '(.*)'\./,
    message: ([, value, unit]) => `“${value}” usa a unidade “${unit}”, que não é aceita. Use px, em ou rem.`,
  },
  {
    pattern: /^'(.*)' is not a valid dimension\./,
    message: ([, value]) => `“${value}” não é uma medida válida. Use um número com px, em ou rem (ex.: 16px).`,
  },
  {
    pattern: /^'(.*)' is not a valid font weight\./,
    message: ([, value]) => `“${value}” não é um peso de fonte válido. Use um número (ex.: 400 ou 700).`,
  },
  {
    pattern: /^'(.*)' appears to be a color, not a valid font family\./,
    message: ([, value]) => `“${value}” parece uma cor, não o nome de uma fonte.`,
  },
  {
    pattern: /has contrast ratio ([\d.]+):1, below WCAG AA minimum of ([\d.]+):1/,
    message: ([, ratio, minimum]) =>
      `Contraste de ${formatRatio(ratio)}:1 entre texto e fundo, abaixo do mínimo de ${formatRatio(minimum)}:1 (WCAG AA) para texto normal.`,
  },
  {
    pattern: /^Reference (\{[^}]+\}) does not resolve/,
    message: ([, ref]) => `A referência ${ref} aponta para um token que não existe. Escolha outro token.`,
  },
  {
    pattern: /^No 'primary' color defined\./,
    message: () =>
      'Não há uma cor chamada “primary”. Sem ela, a IA vai escolher sozinha a cor principal, e você perde controle sobre a paleta.',
  },
  {
    pattern: /^'(.*)' is defined but never referenced by any component\./,
    message: ([, name]) =>
      `A cor “${name}” não é usada por nenhum componente. Use-a em um componente ou remova-a, se não for necessária.`,
  },
  {
    pattern: /^No typography tokens defined\./,
    message: () => 'Nenhum estilo de texto definido. A IA vai usar fontes padrão, fora da identidade da marca.',
  },
  {
    pattern: /^No '(spacing|rounded)' section defined\./,
    message: ([, group]) =>
      group === 'spacing'
        ? 'Nenhum espaçamento definido. A IA vai usar espaçamentos padrão.'
        : 'Nenhum arredondamento definido. A IA vai usar cantos padrão.',
  },
  {
    pattern: /^Section '(.*)' appears before '(.*)', which is out of order\./,
    message: ([, current, next]) => `A seção “${current}” aparece antes de “${next}”, fora da ordem da especificação.`,
  },
  {
    pattern: /^Design system defines (.*)\.$/,
    message: ([, parts]) => `O design system define ${translateSummary(parts)}.`,
  },
  {
    pattern: /^Unknown key "(.*)" — did you mean "(.*)"\?/,
    message: ([, key, suggestion]) => `Chave desconhecida “${key}”. Você quis dizer “${suggestion}”?`,
  },
  {
    pattern: /^"(.*)" looks like a design-token map but is not a recognized schema key/,
    message: ([, key]) => `“${key}” parece um grupo de tokens, mas não é um grupo da especificação e será ignorado.`,
  },
]

const SUMMARY_TERMS: [RegExp, string, string][] = [
  [/^(\d+) colors?$/, 'cor', 'cores'],
  [/^(\d+) typography scales?$/, 'estilo de texto', 'estilos de texto'],
  [/^(\d+) rounding levels?$/, 'nível de arredondamento', 'níveis de arredondamento'],
  [/^(\d+) spacing tokens?$/, 'espaçamento', 'espaçamentos'],
  [/^(\d+) components?$/, 'componente', 'componentes'],
]

function translateSummary(parts: string): string {
  const translated = parts.split(', ').map((part) => {
    for (const [pattern, singular, plural] of SUMMARY_TERMS) {
      const match = pattern.exec(part)
      if (match) return `${match[1]} ${Number(match[1]) === 1 ? singular : plural}`
    }
    return part
  })
  return translated.length > 1 ? `${translated.slice(0, -1).join(', ')} e ${translated.at(-1)}` : translated[0]
}

function translate(message: string): string | undefined {
  for (const { pattern, message: build } of TRANSLATIONS) {
    const match = pattern.exec(message)
    if (match) return build(match)
  }
  return undefined
}

/** Mensagem curta em pt-BR para um achado do lint; cai na original se não houver tradução. */
export function fieldMessage(finding: Finding): string {
  return translate(finding.message) ?? finding.message
}

const RULE_TITLE: Record<string, string> = {
  'broken-ref': 'Referência quebrada',
  'missing-primary': 'Sem cor primary',
  'contrast-ratio': 'Contraste insuficiente',
  'orphaned-tokens': 'Cor sem uso',
  'missing-typography': 'Sem tipografia',
  'missing-sections': 'Escala ausente',
  'section-order': 'Seções fora de ordem',
  'token-summary': 'Resumo dos tokens',
  'unknown-key': 'Chave desconhecida',
  'token-like-ignored': 'Grupo de tokens ignorado',
  'omitted-rules': 'Seção omitida',
  [PARSE_FAILURE_RULE]: 'Não foi possível ler o DESIGN.md',
}

// ---------------------------------------------------------------------------
// Localização: rótulos legíveis para cada campo do editor.

const TOKEN_SINGULAR: Record<TokenGroup, string> = {
  colors: 'Cor',
  typography: 'Estilo',
  rounded: 'Arredondamento',
  spacing: 'Espaçamento',
}

const TOKEN_FIELD_LABEL: Record<TokenField, string> = {
  name: 'Nome',
  value: 'Valor',
  fontFamily: 'Fonte',
  fontSize: 'Tamanho',
  fontWeight: 'Peso',
  lineHeight: 'Altura da linha',
  letterSpacing: 'Espaço entre letras',
}

const GUIDANCE_LABEL: Record<GuidanceKey, string> = {
  overview: 'Visão geral',
  colors: 'Nota de cores',
  typography: 'Nota de tipografia',
  layout: 'Nota de layout',
  elevation: 'Elevação e profundidade',
  shapes: 'Nota de formas',
  components: 'Nota de componentes',
  dosAndDonts: 'O que fazer e o que evitar',
}

/** Mapa `fieldId → rótulo` (ex.: "Componente card · Texto"). */
export function fieldLabels(draft: Draft): Map<string, string> {
  const labels = new Map<string, string>([
    [fieldIds.identity('name'), 'Identidade · Nome'],
    [fieldIds.identity('description'), 'Identidade · Descrição'],
    [fieldIds.group('components'), GROUP_LABEL.components],
  ])
  for (const group of ['colors', 'typography', 'rounded', 'spacing'] as const) {
    labels.set(fieldIds.group(group), GROUP_LABEL[group])
    const fields: TokenField[] = group === 'typography' ? ['name', ...TYPOGRAPHY_FIELDS] : ['name', 'value']
    for (const token of draft[group]) {
      const name = token.name.trim() || 'sem nome'
      for (const field of fields)
        labels.set(fieldIds.token(group, token.id, field), `${TOKEN_SINGULAR[group]} ${name} · ${TOKEN_FIELD_LABEL[field]}`)
    }
  }
  for (const component of draft.components) {
    const name = component.name.trim() || 'sem nome'
    labels.set(fieldIds.component(component.id, 'name'), `Componente ${name} · Nome`)
    for (const property of COMPONENT_PROPERTIES)
      labels.set(fieldIds.component(component.id, property), `Componente ${name} · ${PROPERTY_LABEL[property]}`)
  }
  for (const key of GUIDANCE_KEYS) labels.set(fieldIds.guidance(key), GUIDANCE_LABEL[key])
  return labels
}

/** Rótulo de um `path` da CLI quando não há campo correspondente (ex.: "components.card"). */
function pathLabel(path: string | undefined): string | undefined {
  if (!path) return undefined
  const [root, name] = path.split('.')
  if (root === 'components') return name ? `Componente ${name}` : GROUP_LABEL.components
  if (root in TOKEN_SINGULAR) {
    const group = root as TokenGroup
    return name ? `${TOKEN_SINGULAR[group]} ${name}` : GROUP_LABEL[group]
  }
  return path
}

// ---------------------------------------------------------------------------

const SEVERITY_ORDER: Record<ProblemSeverity, number> = { error: 0, warning: 1, info: 2 }

/**
 * Regras da CLI que não são relatadas ao participante. `orphaned-tokens` ("cor sem uso") foi
 * removida a pedido: cores de apoio (neutral, border…) são esperadas mesmo sem componente.
 * O lint oficial continua igual; o filtro vale só para a apresentação.
 */
export const IGNORED_RULES = new Set(['orphaned-tokens'])

/** Todos os problemas do resultado atual, na ordem: erros, avisos, informações. */
export function collectProblems(build: DesignMdBuild): Problem[] {
  const labels = fieldLabels(build.draft)
  const problems: Problem[] = []

  build.editorIssues.forEach((issue, index) =>
    problems.push({
      key: `editor-${index}`,
      severity: issue.severity,
      origin: 'editor',
      title: issue.severity === 'error' ? 'Campo inválido' : 'Atenção',
      message: issue.message,
      fieldId: issue.fieldId,
      location: labels.get(issue.fieldId),
    }),
  )

  build.findings.forEach((finding, index) => {
    if (finding.rule && IGNORED_RULES.has(finding.rule)) return
    const translated = translate(finding.message)
    problems.push({
      key: `cli-${index}`,
      severity: finding.severity as ProblemSeverity,
      origin: 'cli',
      rule: finding.rule,
      title: (finding.rule && RULE_TITLE[finding.rule]) ?? 'Valor inválido',
      message: translated ?? finding.message,
      original: translated ? finding.message : undefined,
      fieldId: finding.fieldId,
      location: (finding.fieldId && labels.get(finding.fieldId)) || pathLabel(finding.path),
    })
  })

  // Contrastes que a CLI não reporta: aprovados e não verificáveis (com transparência).
  const componentIds = new Map(build.draft.components.map((component) => [component.name, component.id]))
  build.contrastChecks.forEach((check) => {
    if (check.status === 'fail') return
    const componentId = componentIds.get(check.componentName)
    const fieldId = componentId ? fieldIds.component(componentId, 'textColor') : undefined
    const ratio = `${formatRatio(check.ratio.toFixed(2))}:1`
    problems.push({
      key: `contrast-${check.componentName}`,
      // Não verificável é aviso: a transparência pode esconder um contraste reprovado.
      severity: check.status === 'pass' ? 'info' : 'warning',
      origin: 'editor',
      rule: 'contrast-ratio',
      title: check.status === 'pass' ? 'Contraste aprovado' : 'Contraste não verificável',
      message:
        check.status === 'pass'
          ? `Texto e fundo têm contraste de ${ratio}, acima do mínimo de ${formatRatio(WCAG_AA_MINIMUM)}:1 (WCAG AA).`
          : `O fundo ou o texto tem transparência, e o contraste real depende do que estiver atrás. A CLI calcula ${ratio} ignorando a transparência; confira sobre o fundo real da tela.`,
      fieldId,
      location: (fieldId && labels.get(fieldId)) || pathLabel(`components.${check.componentName}`),
    })
  })

  // A prévia desenha componentes pelos nomes usuais; os ausentes usam um estilo neutro.
  build.preview.missingComponents.forEach((name) =>
    problems.push({
      key: `preview-${name}`,
      severity: 'info',
      origin: 'editor',
      rule: 'preview-fallback',
      title: 'Prévia com estilo neutro',
      message: `Não há um componente “${name}”, então a prévia usa um estilo neutro no lugar dele. Crie um componente com esse nome para ver seus tokens aplicados.`,
      fieldId: fieldIds.group('components'),
      location: GROUP_LABEL.components,
    }),
  )

  return problems.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
}

export function countProblems(problems: Problem[]) {
  return {
    errors: problems.filter((problem) => problem.severity === 'error').length,
    warnings: problems.filter((problem) => problem.severity === 'warning').length,
    infos: problems.filter((problem) => problem.severity === 'info').length,
  }
}
