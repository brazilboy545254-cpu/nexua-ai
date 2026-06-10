import * as React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: 'default' | 'secondary' | 'accent' | 'muted'
}

export function Badge({ className, tone = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold',
        tone === 'default' && 'bg-primary/15 text-primary',
        tone === 'secondary' && 'bg-secondary/15 text-secondary',
        tone === 'accent' && 'bg-accent/15 text-accent',
        tone === 'muted' && 'bg-muted text-muted-foreground',
        className
      )}
      {...props}
    />
  )
}
