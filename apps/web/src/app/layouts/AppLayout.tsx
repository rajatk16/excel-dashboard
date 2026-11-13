import { Outlet } from 'react-router-dom';

import { AppHeader } from '@/components/navigation/AppHeader';
import { AppSidebar } from '@/components/navigation/AppSidebar';

export const AppLayout = () => (
  <div className="flex min-h-dvh flex-col">
    <a className="skip-link" href="#app-content">
      Skip to content
    </a>

    <AppHeader />

    <div className="flex flex-1">
      <AppSidebar />

      <main id="app-content" tabIndex={-1} className="min-w-0 flex-1 bg-background">
        <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  </div>
);
