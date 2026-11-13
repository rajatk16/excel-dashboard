import { Link, NavLink, Outlet } from "react-router-dom";

import { Brand } from "@/components/common/Brand";

import { ROUTE_PATHS } from "../router/routePaths";

export const AppLayout = () => (
  <div className="app-layout">
    <a href="#app-content" className="skip-link">
      Skip to content
    </a>

    <header className="app-header">
      <Brand />

      <div className="header-actions">
        <span className="development-label">
          Development preview
        </span>

        <Link to={ROUTE_PATHS.HOME} className="button button-ghost">Back to home</Link>
      </div>
    </header>

    <div className="app-body">
      <aside className="app-sidebar">
        <p className="sidebar-heading">Application</p>
        <nav aria-label="Application navigation">
          <NavLink
            to={ROUTE_PATHS.APP}
            end
            className={({ isActive }) =>
              isActive
                ? 'sidebar-link sidebar-link-active'
                : 'sidebar-link'
            }
          >
            Overview
          </NavLink>
        </nav>

        <p className="sidebar-note">
          Workspace navigation will become available after workspace management is implemented.
        </p>
      </aside>

      <main id="app-content" className="app-content">
        <Outlet />
      </main>
    </div>
  </div>
)
