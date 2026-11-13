import { Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Button } from '@excel-dashboard/ui/components/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@excel-dashboard/ui/components/sheet';

import { AppNavigation } from './AppNavigation';

export const MobileNavigation = () => {
  const [open, setOpen] = useState(false);

  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.key]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');

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
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open application navigation">
            <Menu className="size-5" aria-hidden="true" />
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="bg-sidebar">
          <SheetHeader>
            <SheetTitle>Excel Dashboard</SheetTitle>

            <SheetDescription>Application navigation</SheetDescription>
          </SheetHeader>

          <div className="px-4 pb-4">
            <AppNavigation onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
