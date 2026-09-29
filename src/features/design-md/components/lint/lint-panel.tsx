import { AlertCircle, AlertTriangle, ArrowRight, Info } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { ORIGIN_LABEL, type Problem, type ProblemSeverity } from '../../lint/present'

export const SEVERITY_META: Record<
  ProblemSeverity,
  { icon: typeof AlertCircle; heading: string; empty: string; className: string; singular: string; plural: string }
> = {
  error: {
    icon: AlertCircle,
    heading: 'Erros',
    empty: 'Nenhum erro. O DESIGN.md pode ser exportado.',
    className: 'text-destructive',
    singular: 'erro',
    plural: 'erros',
  },
  warning: {
    icon: AlertTriangle,
    heading: 'Avisos',
    empty: 'Nenhum aviso.',
    className: 'text-tertiary-text',
    singular: 'aviso',
    plural: 'avisos',
  },
  info: {
    icon: Info,
    heading: 'Informações',
    empty: 'Nenhuma informação.',
    className: 'text-muted-foreground',
    singular: 'informação',
    plural: 'informações',
  },
}

export const countLabel = (severity: ProblemSeverity, count: number) =>
  `${count} ${count === 1 ? SEVERITY_META[severity].singular : SEVERITY_META[severity].plural}`

function ProblemItem({ problem, onReveal }: { problem: Problem; onReveal: (fieldId: string) => void }) {
  const meta = SEVERITY_META[problem.severity]
  const Icon = meta.icon
  return (
    <li className="flex flex-col gap-sm rounded-sm border bg-surface p-4">
      <div className="flex items-start gap-sm">
        <Icon className={cn('mt-0.5 size-4 shrink-0', meta.className)} aria-hidden />
        <div className="flex min-w-0 flex-col gap-1">
          <p className="font-semibold">
            <span className="sr-only">{meta.singular}:</span> {problem.title}
          </p>
          <p className="flex flex-wrap items-center gap-x-sm gap-y-1 text-xs text-muted-foreground">
            {problem.location && <span>{problem.location}</span>}
            <Badge variant="secondary">
              <span className="sr-only">Origem:</span> {ORIGIN_LABEL[problem.origin]}
            </Badge>
            {problem.rule && (
              <code>
                <span className="sr-only">Regra:</span> {problem.rule}
              </code>
            )}
          </p>
        </div>
      </div>
      <p className="text-sm">{problem.message}</p>
      {problem.original && (
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer rounded-sm">Mensagem original da CLI</summary>
          <p lang="en" className="mt-1 font-mono break-words">
            {problem.original}
          </p>
        </details>
      )}
      {problem.fieldId && (
        <div>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="px-0"
            // Nome explícito: texto oculto concatenado perde o espaço no cálculo do nome acessível.
            aria-label={problem.location ? `Ir para o campo ${problem.location}` : undefined}
            onClick={() => onReveal(problem.fieldId!)}
          >
            Ir para o campo
            <ArrowRight />
          </Button>
        </div>
      )}
    </li>
  )
}

type LintPanelProps = { problems: Problem[]; onReveal: (fieldId: string) => void }

export function LintPanel({ problems, onReveal }: LintPanelProps) {
  return (
    <div className="flex flex-col gap-md">
      {(['error', 'warning', 'info'] as const).map((severity) => {
        const items = problems.filter((problem) => problem.severity === severity)
        const headingId = `problemas-${severity}`
        return (
          <section key={severity} aria-labelledby={headingId} className="flex flex-col gap-sm">
            <h3 id={headingId} className="label-caps text-brand-secondary">
              {SEVERITY_META[severity].heading} ({items.length})
            </h3>
            {items.length ? (
              <ul className="flex flex-col gap-sm">
                {items.map((problem) => (
                  <ProblemItem key={problem.key} problem={problem} onReveal={onReveal} />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{SEVERITY_META[severity].empty}</p>
            )}
          </section>
        )
      })}
    </div>
  )
}
