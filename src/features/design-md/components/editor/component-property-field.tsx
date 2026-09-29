import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from '@/components/ui/native-select'
import { cn } from '@/lib/utils'

import { fieldIds } from '../../model/field-ids'
import type { DraftAction } from '../../model/reducer'
import { findToken, getTokens } from '../../model/references'
import { PROPERTY_ACCEPTS_LITERAL, PROPERTY_LABEL, PROPERTY_REF_GROUP, refString } from '../../model/rules'
import type { AnyToken, ComponentDef, ComponentProperty, Draft, PropertyValue, TokenGroup } from '../../model/types'
import { GROUP_LABEL } from '../../model/validation'
import type { ResolvedValue } from '../../official'
import { FieldMessages, TextField, useFieldA11y } from './text-field'

/** Valor padrão ao trocar para "Valor personalizado" sem um token de origem. */
const LITERAL_DEFAULT: Record<TokenGroup, string> = {
  colors: '#000000',
  typography: '',
  rounded: '4px',
  spacing: '8px',
}

const NOT_SET = ''
const LITERAL = 'literal'
const BROKEN = 'broken'
const refOption = (tokenId: string) => `ref:${tokenId}`

function selectValue(value: PropertyValue | undefined): string {
  if (!value) return NOT_SET
  if (value.kind === 'ref') return refOption(value.tokenId)
  return value.kind === 'broken' ? BROKEN : LITERAL
}

/** Resumo do valor do token para a opção do select (ex.: "primary — #201813"). */
function tokenSummary(group: TokenGroup, token: AnyToken): string {
  if (group === 'typography') {
    const typography = token as Extract<AnyToken, { fontFamily: string }>
    return [typography.fontFamily, typography.fontSize, typography.fontWeight].filter((part) => part.trim()).join(' · ')
  }
  return (token as Extract<AnyToken, { value: string }>).value
}

/** Valor bruto de um token, para pré-preencher o valor personalizado. */
function tokenRawValue(token: AnyToken | undefined): string | undefined {
  return token && 'value' in token ? token.value : undefined
}

function Swatch({ resolved }: { resolved?: ResolvedValue }) {
  const color = typeof resolved === 'object' && resolved?.type === 'color' ? resolved : undefined
  return (
    <span
      aria-hidden
      className={cn(
        'size-11 shrink-0 rounded-sm border',
        // Xadrez para cores transparentes ou não resolvidas.
        (!color || (color.a ?? 1) < 1) &&
          'bg-[repeating-conic-gradient(var(--color-border)_0_25%,var(--color-surface)_0_50%)] bg-[length:12px_12px]',
        !color && 'border-dashed',
      )}
      style={color ? { boxShadow: `inset 0 0 0 100px rgb(${color.r} ${color.g} ${color.b} / ${color.a ?? 1})` } : undefined}
    />
  )
}

type ComponentPropertyFieldProps = {
  component: ComponentDef
  property: ComponentProperty
  draft: Draft
  dispatch: (action: DraftAction) => void
  /** Valor resolvido pelo lint oficial (para a amostra de cor). */
  resolved?: ResolvedValue
  /** Presente nas propriedades opcionais: remove a linha. */
  onRemove?: () => void
}

export function ComponentPropertyField({
  component,
  property,
  draft,
  dispatch,
  resolved,
  onRemove,
}: ComponentPropertyFieldProps) {
  const group = PROPERTY_REF_GROUP[property]
  const value = component.properties[property]
  const isLiteral = value?.kind === 'literal'
  const fieldId = fieldIds.component(component.id, property)
  // Quem recebe o id (e as mensagens) é o controle ativo: o campo de texto quando o valor é personalizado.
  const selectId = isLiteral ? `${fieldId}-select` : fieldId
  const { issues, inputProps } = useFieldA11y(fieldId)
  const label = PROPERTY_LABEL[property]
  const tokens = getTokens(draft, group).filter((token) => token.name.trim())

  const setValue = (next: PropertyValue | undefined) =>
    dispatch({ type: 'setComponentProperty', id: component.id, property, value: next })

  const onSelect = (option: string) => {
    if (option === NOT_SET) setValue(undefined)
    else if (option === LITERAL) {
      const fromToken = value?.kind === 'ref' ? tokenRawValue(findToken(draft, group, value.tokenId)) : undefined
      setValue({ kind: 'literal', value: fromToken ?? LITERAL_DEFAULT[group] })
    } else if (option.startsWith('ref:')) setValue({ kind: 'ref', group, tokenId: option.slice('ref:'.length) })
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={selectId}>
        {label} <code className="font-normal text-muted-foreground">{property}</code>
      </Label>
      <div className="flex items-center gap-sm">
        {group === 'colors' && <Swatch resolved={resolved} />}
        <NativeSelect
          value={selectValue(value)}
          onChange={(event) => onSelect(event.target.value)}
          {...(isLiteral ? { id: selectId } : inputProps)}
        >
          <NativeSelectOption value={NOT_SET}>Não definido</NativeSelectOption>
          <NativeSelectOptGroup label={`Tokens de ${GROUP_LABEL[group].toLowerCase()}`}>
            {tokens.map((token) => (
              <NativeSelectOption key={token.id} value={refOption(token.id)}>
                {token.name} — {tokenSummary(group, token)}
              </NativeSelectOption>
            ))}
          </NativeSelectOptGroup>
          {value?.kind === 'broken' && (
            <NativeSelectOption value={BROKEN}>{refString(value.group, value.name)} — token removido</NativeSelectOption>
          )}
          {PROPERTY_ACCEPTS_LITERAL[property] && <NativeSelectOption value={LITERAL}>Valor personalizado</NativeSelectOption>}
        </NativeSelect>
        {onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            aria-label={`Remover a propriedade ${label}`}
            onClick={onRemove}
          >
            <X />
          </Button>
        )}
      </div>
      {isLiteral ? (
        <TextField
          fieldId={fieldId}
          label={`Valor personalizado de ${label}`}
          hideLabel
          placeholder={LITERAL_DEFAULT[group]}
          className="[&_input]:font-mono"
          value={value.value}
          onChange={(event) => setValue({ kind: 'literal', value: event.target.value })}
        />
      ) : (
        <FieldMessages fieldId={fieldId} issues={issues} />
      )}
    </div>
  )
}
