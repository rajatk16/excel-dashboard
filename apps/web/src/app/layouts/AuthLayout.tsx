import { ChartColumnIncreasing, Database, LayoutDashboard } from 'lucide-react';
import { Outlet } from 'react-router-dom';

import { Brand } from '@/components/common/Brand';
import { ThemeSwitcher } from '@/components/common/ThemeSwitcher';

export const AuthLayout = () => (
  <div className="grid min-h-dvh lg:grid-cols-2">
    <a className="skip-link" href="#auth-content">
      Skip to content
    </a>

    <aside className="relative hidden flex-col justify-between overflow-hidden border-r bg-muted p-12 lg:flex">
      <Brand />

      <div className="relative z-10 max-w-lg space-y-8">
        <div className="flex gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl border bg-card">
            <Database className="size-6 text-primary" aria-hidden="true" />
          </div>

          <div className="flex size-12 items-center justify-center rounded-xl border bg-card">
            <ChartColumnIncreasing className="size-6 text-primary" aria-hidden="true" />
          </div>

          <div className="flex size-12 items-center justify-center rounded-xl border bg-card">
            <LayoutDashboard className="size-6 text-primary" aria-hidden="true" />
          </div>
        </div>

        <h2 className="text-4xl font-semibold tracking-tight">
          From spreadsheets to actionable insights.
        </h2>

        <p className="text-lg leading-relaxed text-muted-foreground">
          One platform to import, explore, visualize, and share your data.
        </p>
      </div>

      <p className="text-sm text-muted-foreground">Excel Dashboard</p>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -bottom-32 size-96 rounded-full bg-primary/10 blur-3xl"
      />
    </aside>

    <div className="flex min-w-0 flex-col">
      <header className="flex h-16 items-center justify-between px-4 sm:px-8">
        <div className="lg:hidden">
          <Brand />
        </div>

        <div className="ml-auto">
          <ThemeSwitcher />
        </div>
      </header>

      <main
        id="auth-content"
        tabIndex={-1}
        className="flex flex-1 items-center justify-center px-4 py-12 sm:px-8"
      >
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
    </div>
  </div>
);
