import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex field-sizing-content min-h-24 w-full rounded-sm border border-input bg-surface px-3.5 py-2.5 text-base text-foreground transition-colors duration-200 ease-out placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
