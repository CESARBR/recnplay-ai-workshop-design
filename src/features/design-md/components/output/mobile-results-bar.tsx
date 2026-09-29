// Barra fixa no celular (layout de uma coluna): no celular o painel de resultado fica
// depois do editor inteiro; a barra mostra a contagem e leva direto a ele.
import { ArrowDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { countProblems, type Problem } from '../../lint/present'
import { countLabel, SEVERITY_META } from '../lint/lint-panel'

type MobileResultsBarProps = { problems: Problem[]; onShowResults: () => void }

export function MobileResultsBar({ problems, onShowResults }: MobileResultsBarProps) {
  const counts = countProblems(problems)
  const items = [
    { severity: 'error' as const, count: counts.errors },
    { severity: 'warning' as const, count: counts.warnings },
  ]
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-surface px-md py-sm lg:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-sm">
        <p className="flex flex-wrap gap-x-md text-sm font-semibold">
          {items.map(({ severity, count }, index) => (
            <span key={severity} className={count > 0 ? SEVERITY_META[severity].className : 'text-muted-foreground'}>
              {countLabel(severity, count)}
              {index < items.length - 1 && <span className="sr-only">,</span>}
            </span>
          ))}
        </p>
        <Button type="button" variant="outline" size="sm" className={cn('min-h-11 shrink-0')} onClick={onShowResults}>
          Ver resultado <ArrowDown aria-hidden />
        </Button>
      </div>
    </div>
  )
}
