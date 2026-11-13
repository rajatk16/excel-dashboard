import { Link, Outlet } from "react-router-dom";

import { Brand } from "@/components/common/Brand";

import { ROUTE_PATHS } from "../router/routePaths";

export const PublicLayout = () => (
  <div className="public-layout">
    <a href="#main-content" className="skip-link">Skip to content</a>
    <header className="public-header">
      <div className="container header-content">
        <Brand />

        <nav className="header-actions" aria-label="Public navigation">
          <Link to={ROUTE_PATHS.LOGIN} className="button button-ghost">Sign in</Link>
          <Link to={ROUTE_PATHS.REGISTER} className="button button-primary">Get started</Link>
        </nav>
      </div>
    </header>

    <main
      id="main-content"
      className="public-main"
    >
      <Outlet />
    </main>

    <footer className="public-footer">
      <div className="container footer-content">
        <p>
          &copy; {new Date().getFullYear()} Excel Dashboard.
        </p>

        <span>Spreadsheet analytics platform</span>
      </div>
    </footer>
  </div>
);
