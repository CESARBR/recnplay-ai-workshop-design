// Painel de resultado: resumo do lint sempre visível e abas com os detalhes.
import { Eye, FileText, ListChecks } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

import { countProblems, type Problem } from '../../lint/present'
import type { DesignMdBuild } from '../../pipeline'
import { countLabel, LintPanel, SEVERITY_META } from '../lint/lint-panel'
import { PreviewPanel } from '../preview/preview-panel'
import { DesignMdOutput } from './design-md-output'
import { ExportActions } from './export-actions'

type ResultsPanelProps = {
  build: DesignMdBuild
  problems: Problem[]
  isUpdating: boolean
  tab: string
  onTabChange: (tab: string) => void
  onReveal: (fieldId: string) => void
}

export function ResultsPanel({ build, problems, isUpdating, tab, onTabChange, onReveal }: ResultsPanelProps) {
  const counts = countProblems(problems)
  const problemCount = counts.errors + counts.warnings
  const summary = [
    { severity: 'error' as const, count: counts.errors },
    { severity: 'warning' as const, count: counts.warnings },
    { severity: 'info' as const, count: counts.infos },
  ]

  return (
    <Card className="gap-md">
      <CardHeader>
        <CardTitle asChild>
          <h2>Resultado</h2>
        </CardTitle>
        <ExportActions build={build} onShowProblems={() => onTabChange('problems')} />
      </CardHeader>
      {/* Linha divisória entre as ações de exportação e o resumo/abas. */}
      <CardContent className="flex flex-col gap-sm border-t pt-md">
        {/* Resumo logo acima das abas; anunciado quando as contagens mudam. */}
        <p
          role="status"
          aria-label="Resumo dos problemas"
          aria-busy={isUpdating}
          className="flex flex-wrap gap-x-md gap-y-1 text-sm"
        >
          {summary.map(({ severity, count }, index) => {
            const Icon = SEVERITY_META[severity].icon
            return (
              <span
                key={severity}
                className={cn(
                  'flex items-center gap-1.5 font-semibold',
                  count > 0 ? SEVERITY_META[severity].className : 'text-muted-foreground',
                )}
              >
                <Icon className="size-4" aria-hidden />
                {countLabel(severity, count)}
                {index < summary.length - 1 && <span className="sr-only">,</span>}
              </span>
            )
          })}
        </p>
        <Tabs value={tab} onValueChange={onTabChange}>
          <TabsList aria-label="Detalhes do resultado">
            <TabsTrigger value="preview">
              <Eye aria-hidden /> Prévia
            </TabsTrigger>
            <TabsTrigger value="problems" aria-label={`Problemas (${problemCount})`}>
              <ListChecks aria-hidden /> Problemas
              <span className="rounded-full bg-neutral px-1.5 text-xs">{problemCount}</span>
            </TabsTrigger>
            <TabsTrigger value="design-md">
              <FileText aria-hidden /> DESIGN.md
            </TabsTrigger>
          </TabsList>
          <TabsContent value="preview">
            <PreviewPanel preview={build.preview} name={build.draft.name} description={build.draft.description} />
          </TabsContent>
          <TabsContent value="problems" className="max-h-[70vh] overflow-auto">
            <LintPanel problems={problems} onReveal={onReveal} />
          </TabsContent>
          <TabsContent value="design-md">
            <DesignMdOutput build={build} isUpdating={isUpdating} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
