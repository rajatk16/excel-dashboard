import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import { cn } from '../lib/utils';

export const alertVariants = cva(
  [
    'relative grid w-full gap-1 rounded-lg border px-4 py-3 text-sm',
    'has-[>svg]:grid-cols-[1rem_1fr]',
    'has-[>svg]:gap-x-3',
    '[&>svg]:size-4 [&>svg]:translate-y-0.5',
  ],
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground',

        destructive: 'border-destructive/30 bg-destructive/5 text-destructive',

        success: 'border-success/30 bg-success/5 text-success',

        warning: 'border-warning/30 bg-warning/5 text-warning',
      },
    },

    defaultVariants: {
      variant: 'default',
    },
  },
);

interface AlertProps extends ComponentProps<'div'>, VariantProps<typeof alertVariants> {}

export const Alert = ({ className, variant, ...props }: AlertProps) => (
  <div data-slot="alert" className={cn(alertVariants({ variant }), className)} {...props} />
);

export const AlertTitle = ({ className, ...props }: ComponentProps<'div'>) => (
  <div data-slot="alert-title" className={cn('col-start-2 font-medium', className)} {...props} />
);

export const AlertDescription = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    data-slot="alert-description"
    className={cn('col-start-2 text-sm leading-relaxed text-muted-foreground', className)}
    {...props}
  />
);
