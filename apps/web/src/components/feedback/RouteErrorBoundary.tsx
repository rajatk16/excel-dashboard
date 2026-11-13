import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom"

import { ROUTE_PATHS } from "@/app/router/routePaths";

export const RouteErrorBoundary = () => {
  const error: unknown = useRouteError();

  const isNotFound = isRouteErrorResponse(error) && error.status === 404;

  const title = isNotFound ? 'Page not found.' : 'Unable to load this page.';

  const description = isNotFound ? 'The requested page could not be found.' : 'An unexpected error occurred while loading this page.';

  return (
    <main className="feedback-page">
      <section className="feedback-card" role="alert">
        <p className="eyebrow">
          {isNotFound ? '404' : 'Page error'}
        </p>

        <h1>{title}</h1>

        <p className="muted-text">
          {description}
        </p>

        <div className="button-group">
          <Link to={ROUTE_PATHS.HOME} className="button button-primary">
            Return home
          </Link>
        </div>
      </section>
    </main>
  )
}
