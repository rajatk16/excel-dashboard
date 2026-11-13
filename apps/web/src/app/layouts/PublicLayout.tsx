import { Outlet } from 'react-router-dom';

import { PublicFooter } from '@/components/navigation/PublicFooter';
import { PublicHeader } from '@/components/navigation/PublicHeader';

export const PublicLayout = () => (
  <div className="flex min-h-dvh flex-col">
    <a className="skip-link" href="#main-content">
      Skip to content
    </a>

    <PublicHeader />

    <main id="main-content" tabIndex={-1} className="flex-1">
      <Outlet />
    </main>

    <PublicFooter />
  </div>
);
