import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';

import { Button } from '@excel-dashboard/ui/components/button';

import { ROUTE_PATHS } from '@/app/router/routePaths';

export const RouteErrorBoundary = () => {
  const error: unknown = useRouteError();

  const isNotFound = isRouteErrorResponse(error) && error.status === 404;

  const title = isNotFound ? 'Page not found' : 'Unable to load this page';

  const description = isNotFound
    ? 'The requested page could not be found.'
    : 'An unexpected error occurred while loading this page.';

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <section role="alert" className="flex max-w-md flex-col items-center gap-5 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertCircle className="size-8" aria-hidden="true" />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>

        <p className="text-muted-foreground">{description}</p>

        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link to={ROUTE_PATHS.HOME}>
              <Home aria-hidden="true" />
              Return home
            </Link>
          </Button>

          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw aria-hidden="true" />
            Reload page
          </Button>
        </div>
      </section>
    </main>
  );
};
