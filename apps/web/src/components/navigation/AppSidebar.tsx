import { Info } from 'lucide-react';

import { Separator } from '@excel-dashboard/ui/components/separator';

import { AppNavigation } from './AppNavigation';

export const AppSidebar = () => (
  <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-64 shrink-0 flex-col overflow-y-auto border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
    <div className="flex-1 p-4">
      <AppNavigation />
    </div>

    <div className="mt-auto p-4">
      <Separator className="mb-4" />

      <div className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />

        <p>Workspace management will be available in a subsequent implementation phase.</p>
      </div>
    </div>
  </aside>
);
