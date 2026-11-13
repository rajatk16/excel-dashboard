import { Link } from "react-router-dom";

import { ROUTE_PATHS } from "@/app/router/routePaths";
import { usePageTitle } from "@/lib/utils/pageTitle"

export const Component = () => {
  usePageTitle('Page not found');

  return (
    <section className="feedback-page feedbad-page-inline">
      <div className="feedback-card">
        <p className="error-code">404</p>

        <h1>Page not found</h1>

        <p className="muted-text">
          The page you are looking for does not exist or may have been moved.
        </p>

        <div className="button-group">
          <Link to={ROUTE_PATHS.HOME} className="button button-primary">Return home</Link>
          <Link to={ROUTE_PATHS.APP} className="button button-secondary">Open application</Link>
        </div>
      </div>
    </section>
  )
}
