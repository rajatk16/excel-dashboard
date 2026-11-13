import { Link } from "react-router-dom";

import { ROUTE_PATHS } from "@/app/router/routePaths";
import { usePageTitle } from "@/lib/utils/pageTitle"

export const Component = () => {
  usePageTitle('Create an account');

  return (
    <section className="auth-card">
      <p className="eyebrow">Get started</p>

      <h1>Create an account</h1>

      <p className="muted-text">
        Create your account to start building interactive analytics dashboards.
      </p>

      <p className="notice">
        Account registration will be available after authentication is implemented.
      </p>

      <p className="auth-switch">
        Already have an account?{' '}
        <Link to={ROUTE_PATHS.LOGIN}>
          Sign in
        </Link>
      </p>

      <Link to={ROUTE_PATHS.HOME} className="button button-secondary">
        Return home
      </Link>
    </section>
  )
}
