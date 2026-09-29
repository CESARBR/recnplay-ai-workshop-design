// Problemas por campo do editor (validação do editor + erros do lint oficial localizados).
import { createContext, useContext, useMemo, type ReactNode } from 'react'

import { fieldMessage } from '../../lint/present'
import type { DesignMdBuild } from '../../pipeline'

export type FieldIssue = { severity: 'error' | 'warning'; message: string }

const FieldIssuesContext = createContext<ReadonlyMap<string, FieldIssue[]>>(new Map())

/** Junta os problemas que devem aparecer junto dos campos: todos do editor e os erros do lint. */
export function collectFieldIssues(build: DesignMdBuild): Map<string, FieldIssue[]> {
  const byField = new Map<string, FieldIssue[]>()
  const add = (fieldId: string | undefined, issue: FieldIssue) => {
    if (!fieldId) return
    byField.set(fieldId, [...(byField.get(fieldId) ?? []), issue])
  }
  for (const issue of build.editorIssues) add(issue.fieldId, issue)
  // Do lint, entram junto dos campos os erros e o aviso de contraste (útil ao escolher cores
  // do componente). Os demais avisos e informações ficam só no painel de problemas.
  for (const finding of build.findings)
    if (finding.severity === 'error' || finding.rule === 'contrast-ratio')
      add(finding.fieldId, { severity: finding.severity === 'error' ? 'error' : 'warning', message: fieldMessage(finding) })
  return byField
}

export function FieldIssuesProvider({ build, children }: { build: DesignMdBuild; children: ReactNode }) {
  const issues = useMemo(() => collectFieldIssues(build), [build])
  return <FieldIssuesContext.Provider value={issues}>{children}</FieldIssuesContext.Provider>
}

export const useFieldIssues = (fieldId: string) => useContext(FieldIssuesContext).get(fieldId) ?? []

/** Quantidade de erros em campos cujo id começa com algum dos prefixos (para o título da seção). */
export function useErrorCount(prefixes: string[]) {
  const issues = useContext(FieldIssuesContext)
  let count = 0
  for (const [fieldId, list] of issues)
    if (prefixes.some((prefix) => fieldId.startsWith(prefix)))
      count += list.filter((issue) => issue.severity === 'error').length
  return count
}
