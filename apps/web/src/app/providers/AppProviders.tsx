import type { PropsWithChildren } from 'react';

import { Toaster } from '@excel-dashboard/ui/components/Toaster';
import { ThemeProvider } from '@excel-dashboard/ui/theme/provider';

import { getEnvironment } from '@/config/env';

export const AppProviders = (props: PropsWithChildren) => {
  getEnvironment();

  return (
    <ThemeProvider defaultTheme="system" storageKey="excel-dashboard-theme">
      {props.children}
      <Toaster />
    </ThemeProvider>
  );
};
