import * as SheetPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ComponentProps } from 'react';

import { cn } from '../lib/utils';

export const Sheet = SheetPrimitive.Root;
export const SheetTrigger = SheetPrimitive.Trigger;
export const SheetClose = SheetPrimitive.Close;

export const SheetOverlay = ({
  className,
  ...props
}: ComponentProps<typeof SheetPrimitive.Overlay>) => (
  <SheetPrimitive.Overlay
    data-slot="sheet-overlay"
    className={cn(
      'fixed inset-0 z-50 bg-black/50',
      'data-[state=closed]:animate-out data-[state=open]:animate-in',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
  />
);

interface SheetContentProps extends ComponentProps<typeof SheetPrimitive.Content> {
  side?: 'top' | 'right' | 'bottom' | 'left';
}

const SIDE_CLASSES = {
  top: [
    'inset-x-0 top-0 max-h-[90dvh] border-b',
    'data-[state=open]:slide-in-from-top',
    'data-[state=closed]:slide-out-to-top',
  ],

  right: [
    'inset-y-0 right-0 h-dvh w-[85%] max-w-sm border-l',
    'data-[state=open]:slide-in-from-right',
    'data-[state=closed]:slide-out-to-right',
  ],

  bottom: [
    'inset-x-0 bottom-0 max-h-[90dvh] border-t',
    'data-[state=open]:slide-in-from-bottom',
    'data-[state=closed]:slide-out-to-bottom',
  ],

  left: [
    'inset-y-0 left-0 h-dvh w-[85%] max-w-sm border-r',
    'data-[state=open]:slide-in-from-left',
    'data-[state=closed]:slide-out-to-left',
  ],
} as const;

export const SheetContent = ({
  className,
  children,
  side = 'right',
  ...props
}: SheetContentProps) => (
  <SheetPrimitive.Portal>
    <SheetOverlay />

    <SheetPrimitive.Content
      data-slot="sheet-content"
      className={cn(
        'fixed z-50 flex flex-col gap-4 overflow-y-auto',
        'bg-background shadow-lg',
        'data-[state=closed]:animate-out data-[state=open]:animate-in',
        'data-[state=closed]:duration-200 data-[state=open]:duration-300',
        SIDE_CLASSES[side],
        className,
      )}
      {...props}
    >
      {children}

      <SheetPrimitive.Close
        className={cn(
          'absolute top-4 right-4 flex size-8 items-center justify-center rounded-md',
          'text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
          'focus-visible:ring-2 focus-visible:ring-ring',
        )}
      >
        <X className="size-4" />
        <span className="sr-only">Close panel</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPrimitive.Portal>
);

export const SheetHeader = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    data-slot="sheet-header"
    className={cn('flex flex-col gap-2 p-4 pr-14', className)}
    {...props}
  />
);

export const SheetFooter = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    data-slot="sheet-footer"
    className={cn('mt-auto flex flex-col gap-2 p-4', className)}
    {...props}
  />
);

export const SheetTitle = ({
  className,
  ...props
}: ComponentProps<typeof SheetPrimitive.Title>) => (
  <SheetPrimitive.Title
    data-slot="sheet-title"
    className={cn('font-semibold text-foreground', className)}
    {...props}
  />
);

export const SheetDescription = ({
  className,
  ...props
}: ComponentProps<typeof SheetPrimitive.Description>) => (
  <SheetPrimitive.Description
    data-slot="sheet-description"
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
);
