// Geração rápida: cria cores, escalas e componentes a partir de uma cor de marca.
import { useState } from 'react'
import { Check, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { generateFromColor } from '../../generate/palette'
import type { DraftAction } from '../../model/reducer'
import type { Draft } from '../../model/types'
import { resolveCssColor } from '../../official'
import { ConfirmDialog } from '../confirm-dialog'
import { toPickerHex } from './color-value-field'
import { EditorSection } from './editor-section'
import { FieldMessages, hintId, messageId } from './text-field'

const FIELD_ID = 'generate-brand-color'
const DEFAULT_BRAND = '#CC4D00'

type SectionProps = { draft: Draft; dispatch: (action: DraftAction) => void }

/** Cor inicial do campo: a `primary` atual, se for válida. */
function initialBrand(draft: Draft) {
  const primary = draft.colors.find((token) => token.name === 'primary')?.value.trim()
  return primary && resolveCssColor(primary) ? primary : DEFAULT_BRAND
}

export function QuickGenerateSection({ draft, dispatch }: SectionProps) {
  const [brand, setBrand] = useState(() => initialBrand(draft))
  const [error, setError] = useState<string>()
  const [confirming, setConfirming] = useState(false)
  const [status, setStatus] = useState<string>()

  const resolved = resolveCssColor(brand)
  const pickerHex = toPickerHex(brand) ?? (resolved ? toPickerHex(resolved.hex) : undefined) ?? '#000000'

  const changeBrand = (value: string) => {
    setBrand(value)
    setError(undefined)
    setStatus(undefined)
  }

  const requestGeneration = () => {
    if (!resolveCssColor(brand)) {
      setError('Informe uma cor válida, como #CC4D00, rgb(204 77 0) ou oklch(0.68 0.2 45).')
      return
    }
    setConfirming(true)
  }

  const generate = () => {
    const generated = generateFromColor(brand, draft)
    if (!generated) return
    dispatch({ type: 'applyGenerated', generated })
    setStatus(
      `Sistema gerado a partir de ${brand.trim()}: ${generated.colors.length} cores, ${generated.spacing.length} espaçamentos, ${generated.rounded.length} arredondamentos e ${generated.components.length} componentes.`,
    )
  }

  const issues = error ? [{ severity: 'error' as const, message: error }] : []

  return (
    <EditorSection value="generate" title="Gerar a partir de uma cor" errorPrefixes={[]}>
      <p id={hintId(FIELD_ID)} className="text-sm text-muted-foreground">
        Informe a cor da marca para criar uma paleta com contraste adequado, escalas de espaçamento e
        arredondamento e componentes de exemplo. <strong>Substitui</strong> cores, espaçamentos, arredondamentos e
        componentes; <strong>mantém</strong> nome, descrição, tipografia e orientações.
      </p>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={FIELD_ID}>Cor da marca</Label>
        <div className="flex flex-wrap items-center gap-sm">
          <input
            type="color"
            aria-label="Seletor visual da cor da marca"
            value={pickerHex}
            onChange={(event) => changeBrand(event.target.value.toUpperCase())}
            className="h-11 w-12 shrink-0 cursor-pointer rounded-sm border bg-surface p-1"
          />
          <Input
            id={FIELD_ID}
            className="max-w-56 font-mono"
            autoComplete="off"
            spellCheck={false}
            value={brand}
            onChange={(event) => changeBrand(event.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={[hintId(FIELD_ID), error ? messageId(FIELD_ID) : ''].filter(Boolean).join(' ')}
          />
          <Button type="button" variant="secondary" onClick={requestGeneration}>
            <Sparkles aria-hidden /> Gerar sistema
          </Button>
        </div>
        <FieldMessages fieldId={FIELD_ID} issues={issues} />
      </div>

      <p role="status" aria-label="Resultado da geração" className="flex items-start gap-1.5 text-sm text-muted-foreground">
        {status && <Check className="mt-0.5 size-4 shrink-0" aria-hidden />}
        {status}
      </p>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Substituir cores, escalas e componentes?"
        description={
          <>
            <span>
              A geração a partir de <code>{brand.trim()}</code> vai substituir as {draft.colors.length} cores, os{' '}
              {draft.spacing.length} espaçamentos, os {draft.rounded.length} arredondamentos e os{' '}
              {draft.components.length} componentes atuais.
            </span>
            <span>Nome, descrição, tipografia e orientações serão mantidos.</span>
          </>
        }
        confirmLabel="Gerar e substituir"
        onConfirm={generate}
      />
    </EditorSection>
  )
}
