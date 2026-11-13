import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@excel-dashboard/ui/components/button';

import { ROUTE_PATHS } from '@/app/router/routePaths';
import { Brand } from '@/components/common/Brand';
import { ThemeSwitcher } from '@/components/common/ThemeSwitcher';

import { MobileNavigation } from './MobileNavigation';

export const AppHeader = () => (
  <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-2 border-b bg-background/95 px-3 backdrop-blur sm:px-6">
    <div className="flex min-w-0 items-center gap-2">
      <MobileNavigation />

      <div className="sm:hidden">
        <Brand showName={false} />
      </div>

      <div className="hidden sm:block">
        <Brand />
      </div>
    </div>

    <div className="flex shrink-0 items-center gap-1 sm:gap-2">
      <span className="hidden text-xs text-muted-foreground md:inline">Development preview</span>

      <ThemeSwitcher />

      <Button variant="ghost" size="sm" asChild>
        <Link to={ROUTE_PATHS.HOME}>
          <ArrowLeft aria-hidden="true" />

          <span className="hidden sm:inline">Back to home</span>

          <span className="sr-only sm:hidden">Back to home</span>
        </Link>
      </Button>
    </div>
  </header>
);
