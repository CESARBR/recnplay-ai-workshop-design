import type { ComponentProps, ReactNode } from 'react'
import { AlertCircle, AlertTriangle } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

import { useFieldIssues, type FieldIssue } from './field-issues'

export const messageId = (fieldId: string) => `${fieldId}-message`
export const hintId = (fieldId: string) => `${fieldId}-hint`

/** Mensagens de erro/aviso de um campo, ligadas a ele por `aria-describedby`. */
export function FieldMessages({ fieldId, issues }: { fieldId: string; issues: FieldIssue[] }) {
  if (!issues.length) return null
  return (
    <ul id={messageId(fieldId)} className="flex flex-col gap-1">
      {issues.map((issue, index) => {
        const Icon = issue.severity === 'error' ? AlertCircle : AlertTriangle
        return (
          <li
            key={index}
            className={cn(
              'flex items-start gap-1.5 text-xs',
              issue.severity === 'error' ? 'text-destructive' : 'text-muted-foreground',
            )}
          >
            <Icon className="mt-px size-3.5 shrink-0" aria-hidden />
            <span>
              {/* O espaço fica fora do texto oculto: dentro dele é descartado no cálculo da descrição. */}
              <span className="sr-only">{issue.severity === 'error' ? 'Erro:' : 'Aviso:'}</span> {issue.message}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

/** Props de acessibilidade de um campo com mensagens. */
export function useFieldA11y(fieldId: string, hint?: ReactNode) {
  const issues = useFieldIssues(fieldId)
  const hasError = issues.some((issue) => issue.severity === 'error')
  const describedBy = [hint ? hintId(fieldId) : undefined, issues.length ? messageId(fieldId) : undefined]
    .filter(Boolean)
    .join(' ')
  return {
    issues,
    inputProps: {
      id: fieldId,
      'aria-invalid': hasError || undefined,
      'aria-describedby': describedBy || undefined,
    },
  }
}

type TextFieldProps = {
  fieldId: string
  label: ReactNode
  hint?: ReactNode
  /** Esconde o rótulo visualmente (continua disponível para leitores de tela). */
  hideLabel?: boolean
  className?: string
} & Omit<ComponentProps<typeof Input>, 'id'>

export function TextField({ fieldId, label, hint, hideLabel, className, ...props }: TextFieldProps) {
  const { issues, inputProps } = useFieldA11y(fieldId, hint)
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={fieldId} className={cn(hideLabel && 'sr-only')}>
        {label}
      </Label>
      <Input autoComplete="off" spellCheck={false} {...props} {...inputProps} />
      {hint && (
        <p id={hintId(fieldId)} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      <FieldMessages fieldId={fieldId} issues={issues} />
    </div>
  )
}

type TextAreaFieldProps = {
  fieldId: string
  label: ReactNode
  hint?: ReactNode
  className?: string
} & Omit<ComponentProps<typeof Textarea>, 'id'>

export function TextAreaField({ fieldId, label, hint, className, ...props }: TextAreaFieldProps) {
  const { issues, inputProps } = useFieldA11y(fieldId, hint)
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={fieldId}>{label}</Label>
      <Textarea {...props} {...inputProps} />
      {hint && (
        <p id={hintId(fieldId)} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      <FieldMessages fieldId={fieldId} issues={issues} />
    </div>
  )
}
