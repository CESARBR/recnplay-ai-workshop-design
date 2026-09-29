import * as React from 'react'

import { cn } from '@/lib/utils'

// input (DESIGN.md): surface + primary, rounded.sm, padding 10px 14px.
function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-11 w-full min-w-0 rounded-sm border border-input bg-surface px-3.5 py-2.5 text-base text-foreground transition-colors duration-200 ease-out placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
