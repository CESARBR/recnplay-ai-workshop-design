import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type PageHeaderProps = {
  eyebrow?: string
  /** Mantém a caixa original do texto em vez do label-caps em caixa alta. */
  eyebrowNormalCase?: boolean
  title: string
  /** Informações complementares exibidas abaixo do título (ex.: local do evento). */
  meta?: ReactNode
  description?: ReactNode
}

export function PageHeader({ eyebrow, eyebrowNormalCase, title, meta, description }: PageHeaderProps) {
  return (
    <div className="flex max-w-3xl flex-col gap-sm">
      {eyebrow && (
        <span className={cn('label-caps text-brand-secondary', eyebrowNormalCase && 'normal-case!')}>
          {eyebrow}
        </span>
      )}
      <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{title}</h1>
      {meta && (
        <div className="my-sm flex flex-wrap items-center gap-md text-sm font-semibold text-brand-secondary">
          {meta}
        </div>
      )}
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  )
}
