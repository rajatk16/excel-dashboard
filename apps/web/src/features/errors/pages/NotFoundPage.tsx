import { ArrowLeft, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@excel-dashboard/ui/components/button';

import { ROUTE_PATHS } from '@/app/router/routePaths';
import { usePageTitle } from '@/lib/utils/pageTitle';

export const Component = () => {
  usePageTitle('Page not found');

  return (
    <section className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="flex max-w-lg flex-col items-center gap-5 text-center">
        <p className="text-7xl font-semibold tracking-tighter text-primary">404</p>

        <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>

        <p className="text-muted-foreground">
          The page you are looking for does not exist or may have been moved.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link to={ROUTE_PATHS.HOME}>
              <ArrowLeft aria-hidden="true" />
              Return home
            </Link>
          </Button>

          <Button variant="outline" asChild>
            <Link to={ROUTE_PATHS.APP}>
              <LayoutDashboard aria-hidden="true" />
              Open application
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
