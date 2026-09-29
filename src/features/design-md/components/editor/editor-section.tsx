import type { ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'

import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'

import { useErrorCount } from './field-issues'

type EditorSectionProps = {
  /** Valor do item no acordeão. */
  value: string
  title: string
  /** Quantidade de itens do grupo, mostrada ao lado do título. */
  count?: number
  /** Prefixos de `fieldId` cujos erros são somados no título (útil com a seção fechada). */
  errorPrefixes: string[]
  children: ReactNode
}

export function EditorSection({ value, title, count, errorPrefixes, children }: EditorSectionProps) {
  const errors = useErrorCount(errorPrefixes)
  return (
    <AccordionItem value={value}>
      <AccordionTrigger>
        <span className="flex flex-wrap items-center gap-sm">
          {title}
          {count !== undefined && (
            <>
              <Badge variant="secondary" aria-hidden>
                {count}
              </Badge>
              {/* `aria-label` não vale em elementos genéricos; o texto oculto dá contexto ao número. */}
              <span className="sr-only">, {count} {count === 1 ? 'item' : 'itens'}</span>
            </>
          )}
          {errors > 0 && (
            <span className="flex items-center gap-1 text-xs font-semibold text-destructive">
              <AlertCircle className="size-3.5" aria-hidden />
              {errors} {errors === 1 ? 'erro' : 'erros'}
            </span>
          )}
        </span>
      </AccordionTrigger>
      <AccordionContent className="flex flex-col gap-md">{children}</AccordionContent>
    </AccordionItem>
  )
}
