import * as React from 'react'
import { ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'

// Select nativo (padrão `native-select` do shadcn/ui): teclado, leitor de tela e celular
// funcionam como o sistema operacional espera. Mesmo visual do `input` do DESIGN.md.
function NativeSelect({ className, ...props }: React.ComponentProps<'select'>) {
  return (
    <div data-slot="native-select-wrapper" className={cn('relative w-full min-w-0', className)}>
      <select
        data-slot="native-select"
        className="h-11 w-full min-w-0 appearance-none rounded-sm border border-input bg-surface py-2 pr-9 pl-3.5 text-base text-foreground transition-colors duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive md:text-sm"
        {...props}
      />
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
    </div>
  )
}

function NativeSelectOption(props: React.ComponentProps<'option'>) {
  return <option data-slot="native-select-option" {...props} />
}

function NativeSelectOptGroup(props: React.ComponentProps<'optgroup'>) {
  return <optgroup data-slot="native-select-optgroup" {...props} />
}

export { NativeSelect, NativeSelectOption, NativeSelectOptGroup }
