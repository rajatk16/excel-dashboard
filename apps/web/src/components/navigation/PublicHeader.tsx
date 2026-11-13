import { Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { Button } from '@excel-dashboard/ui/components/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@excel-dashboard/ui/components/sheet';

import { ROUTE_PATHS } from '@/app/router/routePaths';
import { Brand } from '@/components/common/Brand';
import { ThemeSwitcher } from '@/components/common/ThemeSwitcher';

export function PublicHeader() {
  const [open, setOpen] = useState(false);

  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.key]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');

    const handleResize = (event: MediaQueryListEvent): void => {
      if (event.matches) {
        setOpen(false);
      }
    };

    mediaQuery.addEventListener('change', handleResize);

    return () => {
      mediaQuery.removeEventListener('change', handleResize);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="page-container flex h-16 items-center justify-between gap-3">
        <Brand />

        <nav aria-label="Public navigation" className="hidden items-center gap-2 md:flex">
          <ThemeSwitcher />

          <Button variant="ghost" asChild>
            <Link to={ROUTE_PATHS.LOGIN}>Sign in</Link>
          </Button>

          <Button asChild>
            <Link to={ROUTE_PATHS.REGISTER}>Get started</Link>
          </Button>
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeSwitcher />

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open navigation menu">
                <Menu className="size-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>

                <SheetDescription>Explore Excel Dashboard.</SheetDescription>
              </SheetHeader>

              <nav aria-label="Mobile public navigation" className="flex flex-col gap-3 p-4">
                <Button variant="outline" asChild>
                  <Link to={ROUTE_PATHS.HOME} onClick={() => setOpen(false)}>
                    Home
                  </Link>
                </Button>

                <Button variant="outline" asChild>
                  <Link to={ROUTE_PATHS.LOGIN} onClick={() => setOpen(false)}>
                    Sign in
                  </Link>
                </Button>

                <Button asChild>
                  <Link to={ROUTE_PATHS.REGISTER} onClick={() => setOpen(false)}>
                    Get started
                  </Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
