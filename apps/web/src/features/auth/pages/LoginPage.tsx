import { Link } from "react-router-dom";

import { ROUTE_PATHS } from "@/app/router/routePaths";
import { usePageTitle } from "@/lib/utils/pageTitle"

export const Component = () => {
  usePageTitle('Sign in');

  return (
    <section className="auth-card">
      <p className="eyebrow">Welcome back</p>

      <h1>Sign in</h1>

      <p className="muted-text">
        Sign in to access your datasets and dashboards.
      </p>

      <div className="notice">
        Authentication will be available after the identity foundation is implemented.
      </div>

      <p className="auth-switch">
        New to Excel Dashboard?{' '}
        <Link to={ROUTE_PATHS.REGISTER}>
          Create an account
        </Link>
      </p>

      <Link to={ROUTE_PATHS.HOME} className="button button-secondary">
        Return home
      </Link>
    </section>
  )
}
