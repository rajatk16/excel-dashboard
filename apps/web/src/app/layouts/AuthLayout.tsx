import { Outlet } from "react-router-dom";

import { Brand } from "@/components/common/Brand";

export const AuthLayout = () => (
  <div className="auth-layout">
    <header className="auth-header">
      <Brand />
    </header>

    <main className="auth-main">
      <Outlet />
    </main>

    <footer className="auth-footer">
      <p>Excel Dashboard</p>
    </footer>
  </div>
)
