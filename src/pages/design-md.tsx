import { useCallback, useMemo, useState } from 'react'

import { PageHeader } from '@/components/layout/page-header'
import { Accordion } from '@/components/ui/accordion'
import { DraftBar, type DraftNotice } from '@/features/design-md/components/draft-bar'
import { HowToUse } from '@/features/design-md/components/how-to-use'
import { FieldIssuesProvider } from '@/features/design-md/components/editor/field-issues'
import { revealFieldWhenReady, sectionForField } from '@/features/design-md/components/editor/focus'
import { ComponentsSection } from '@/features/design-md/components/editor/components-section'
import { GuidanceSection } from '@/features/design-md/components/editor/guidance-section'
import { IdentitySection } from '@/features/design-md/components/editor/identity-section'
import { QuickGenerateSection } from '@/features/design-md/components/editor/quick-generate-section'
import {
  ColorsSection,
  ScaleSection,
  TypographySection,
} from '@/features/design-md/components/editor/token-sections'
import { MobileResultsBar } from '@/features/design-md/components/output/mobile-results-bar'
import { ResultsPanel } from '@/features/design-md/components/output/results-panel'
import { useDesignSystem } from '@/features/design-md/hooks/use-design-system'
import { collectProblems } from '@/features/design-md/lint/present'
import { DESIGN_MD_CLI_VERSION, DESIGN_MD_SPEC_VERSION } from '@/features/design-md/official'

export function DesignMdPage() {
  const { draft, dispatch, build, isUpdating, initialOrigin } = useDesignSystem()
  const [openSections, setOpenSections] = useState(['identity', 'generate', 'colors'])
  const [resultTab, setResultTab] = useState('preview')
  const [notice, setNotice] = useState<DraftNotice>(initialOrigin)
  // Muda a cada restauração, para recriar o estado local das seções (ex.: campo da cor da marca).
  const [resetCount, setResetCount] = useState(0)

  const restoreExample = useCallback(() => {
    dispatch({ type: 'reset' })
    setNotice('restored')
    setResetCount((count) => count + 1)
  }, [dispatch])

  // "Ir para o campo" no painel de problemas: abre a seção do campo e leva o foco até ele.
  const revealField = useCallback((fieldId: string) => {
    const section = sectionForField(fieldId)
    if (section) setOpenSections((current) => (current.includes(section) ? current : [...current, section]))
    revealFieldWhenReady(fieldId)
  }, [])

  const problems = useMemo(() => collectProblems(build), [build])

  const showResults = useCallback(() => {
    const results = document.getElementById('resultado')
    results?.scrollIntoView?.({ block: 'start' })
    results?.focus({ preventScroll: true })
  }, [])

  // Cores resolvidas pelo lint oficial (sRGB), para o seletor visual de valores não-hex.
  const resolvedColors = useMemo(() => {
    const colors = new Map<string, string>()
    build.lint.designSystem?.colors.forEach((color, name) => colors.set(name, color.hex))
    return colors
  }, [build])

  return (
    <div className="flex flex-col gap-lg pb-20 lg:pb-0">
      <title>Gerador de DESIGN.md · Do Prompt ao Protótipo · CESAR</title>
      <PageHeader
        eyebrow="Ferramenta"
        title="Gerador de DESIGN.md"
        description="Monte o DESIGN.md com cores, tipografia e componentes do seu protótipo para que a ferramenta de IA gere telas consistentes com a sua identidade visual."
      />

      <HowToUse />

      <DraftBar notice={notice} onRestore={restoreExample} />

      <FieldIssuesProvider build={build}>
        <div className="grid items-start gap-lg lg:grid-cols-12">
          <section aria-labelledby="editor-titulo" className="flex flex-col gap-md lg:col-span-7">
            <h2 id="editor-titulo" className="sr-only">
              Editor
            </h2>
            <Accordion
              key={resetCount}
              type="multiple"
              value={openSections}
              onValueChange={setOpenSections}
              className="flex flex-col gap-md"
            >
              <IdentitySection draft={draft} dispatch={dispatch} />
              <QuickGenerateSection draft={draft} dispatch={dispatch} />
              <ColorsSection draft={draft} dispatch={dispatch} resolvedColors={resolvedColors} />
              <TypographySection draft={draft} dispatch={dispatch} />
              <ScaleSection group="spacing" draft={draft} dispatch={dispatch} />
              <ScaleSection group="rounded" draft={draft} dispatch={dispatch} />
              <ComponentsSection
                draft={draft}
                dispatch={dispatch}
                resolvedComponents={build.lint.designSystem?.components}
              />
              <GuidanceSection draft={draft} dispatch={dispatch} />
            </Accordion>
          </section>

          <aside
            id="resultado"
            aria-label="Resultado"
            tabIndex={-1}
            // No desktop o painel acompanha a rolagem, limitado à altura da janela.
            className="focus:outline-none lg:sticky lg:top-md lg:col-span-5 lg:max-h-[calc(100svh-2*var(--spacing-md))] lg:overflow-y-auto"
          >
            <ResultsPanel
              build={build}
              problems={problems}
              isUpdating={isUpdating}
              tab={resultTab}
              onTabChange={setResultTab}
              onReveal={revealField}
            />
          </aside>
        </div>
      </FieldIssuesProvider>

      <MobileResultsBar problems={problems} onShowResults={showResults} />

      <p className="text-sm text-muted-foreground">
        Compatível com o formato DESIGN.md <code>{DESIGN_MD_SPEC_VERSION}</code> · validado com{' '}
        <code>@google/design.md {DESIGN_MD_CLI_VERSION}</code>
      </p>
    </div>
  )
}
