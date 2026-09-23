import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

// Variantes alinhadas ao DESIGN.md:
// - default   → button-primary (tertiary + on-tertiary). Use apenas no CTA principal da tela.
// - secondary → button-secondary (transparente + texto tertiary; usa tertiary-text para manter contraste AA).
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-semibold transition-colors duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-transparent text-tertiary-text hover:bg-tertiary/10',
        outline: 'border bg-surface text-foreground hover:bg-accent',
        ghost: 'text-foreground hover:bg-accent',
        link: 'text-tertiary-text underline-offset-4 hover:underline',
      },
      size: {
        default: 'px-5 py-3',
        sm: 'px-3 py-2 text-xs',
        lg: 'px-6 py-3.5 text-base',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
