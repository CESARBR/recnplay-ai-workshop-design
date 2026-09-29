import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'

import { cn } from '@/lib/utils'

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn('flex flex-col gap-md', className)} {...props} />
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn('inline-flex w-full flex-wrap items-center gap-1 rounded-sm bg-neutral p-1', className)}
      {...props}
    />
  )
}

// Aba ativa marcada pelo fundo inteiro (como o menu do site), não só pela cor do texto.
function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        'inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-sm px-3 text-sm font-semibold whitespace-nowrap text-muted-foreground transition-colors duration-200 ease-out hover:text-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-surface data-[state=active]:text-foreground data-[state=active]:shadow-[inset_0_0_0_1px_var(--color-border)] [&_svg]:size-4 [&_svg]:shrink-0',
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content data-slot="tabs-content" className={cn('flex-1', className)} {...props} />
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
