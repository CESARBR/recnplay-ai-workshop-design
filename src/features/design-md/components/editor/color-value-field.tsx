import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

import { FieldMessages, hintId, useFieldA11y } from './text-field'

const HEX_PATTERN = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i

/** Converte um hex CSS (#rgb, #rgba, #rrggbb, #rrggbbaa) para o formato #rrggbb do seletor nativo. */
export function toPickerHex(value: string): string | undefined {
  const hex = value.trim()
  if (!HEX_PATTERN.test(hex)) return undefined
  const digits = hex.slice(1)
  const rgb = digits.length <= 4 ? [...digits.slice(0, 3)].map((digit) => digit + digit).join('') : digits.slice(0, 6)
  return `#${rgb.toLowerCase()}`
}

type ColorValueFieldProps = {
  fieldId: string
  tokenName: string
  value: string
  /** Cor resolvida pelo lint oficial (sRGB), usada quando o valor não é hex. */
  resolvedHex?: string
  onChange: (value: string) => void
}

/**
 * Campo de cor: texto (aceita qualquer cor CSS da spec) sincronizado com o seletor nativo.
 * O seletor nativo só edita #rrggbb; para outros formatos mostra a aproximação sRGB, e
 * escolher uma cor nele troca o valor por hex.
 */
export function ColorValueField({ fieldId, tokenName, value, resolvedHex, onChange }: ColorValueFieldProps) {
  const directHex = toPickerHex(value)
  const pickerHex = directHex ?? toPickerHex(resolvedHex ?? '') ?? '#000000'
  const isApproximation = !directHex && value.trim() !== ''
  const hint = isApproximation
    ? 'O seletor mostra uma aproximação em sRGB; escolher uma cor nele troca o valor por hex.'
    : undefined
  const { issues, inputProps } = useFieldA11y(fieldId, hint)

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={fieldId}>Valor</Label>
      <div className="flex items-center gap-sm">
        <input
          type="color"
          aria-label={`Seletor visual da cor ${tokenName || 'sem nome'}`}
          value={pickerHex}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          className="h-11 w-12 shrink-0 cursor-pointer rounded-sm border bg-surface p-1"
        />
        <Input
          autoComplete="off"
          spellCheck={false}
          placeholder="#000000"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          {...inputProps}
          className="font-mono"
        />
      </div>
      {hint && (
        <p id={hintId(fieldId)} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      <FieldMessages fieldId={fieldId} issues={issues} />
    </div>
  )
}
