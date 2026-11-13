import type { ComponentProps } from 'react';

import { cn } from '../lib/utils';

export const Input = ({ className, type, ...props }: ComponentProps<'input'>) => (
  <input
    type={type}
    data-slot="input"
    className={cn(
      'flex h-10 w-full min-w-0 rounded-md border border-input',
      'bg-background px-3 py-2 text-base shadow-xs',
      'placeholder:text-muted-foreground md:text-sm',
      'transition-colors',
      'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
      'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30',
      'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
      'file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium',
      className,
    )}
    {...props}
  />
);
