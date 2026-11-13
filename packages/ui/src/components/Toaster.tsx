import type { ToasterProps } from 'sonner';
import { Toaster as Sonner } from 'sonner';

import { useTheme } from '../theme/useTheme';

export const Toaster = ({ toastOptions, ...props }: ToasterProps) => {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      theme={resolvedTheme}
      position="bottom-right"
      closeButton
      richColors
      duration={4000}
      visibleToasts={3}
      toastOptions={{
        ...toastOptions,
        classNames: {
          toast: 'border-border bg-card text-card-foreground',
          description: 'text-muted-foreground',
          actionButton: 'bg-primary text-primary-foreground',
          cancelButton: 'bg-muted text-muted-foreground',
          ...toastOptions?.classNames,
        },
      }}
      {...props}
    />
  );
};
