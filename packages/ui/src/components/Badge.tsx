import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import { cn } from '../lib/utils';

export const badgeVariants = cva(
  [
    'inline-flex w-fit shrink-0 items-center gap-1',
    'rounded-full border px-2.5 py-0.5 whitespace-nowrap',
    'text-xs font-medium',
    '[&_svg]:size-3',
  ],
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',

        secondary: 'border-transparent bg-secondary text-secondary-foreground',

        outline: 'border-border text-foreground',

        destructive: 'border-transparent bg-destructive text-destructive-foreground',

        success: 'border-transparent bg-success/10 text-success',

        warning: 'border-transparent bg-warning/10 text-warning',
      },
    },

    defaultVariants: {
      variant: 'default',
    },
  },
);

interface BadgeProps extends ComponentProps<'span'>, VariantProps<typeof badgeVariants> {}

export const Badge = ({ className, variant, ...props }: BadgeProps) => (
  <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
);
