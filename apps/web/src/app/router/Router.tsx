import { createBrowserRouter } from 'react-router-dom';

import { PageLoader } from '@/components/feedback/PageLoader';
import { RouteErrorBoundary } from '@/components/feedback/RouteErrorBoundary';

import { AppLayout } from '../layouts/AppLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { PublicLayout } from '../layouts/PublicLayout';
import { RootLayout } from '../layouts/RootLayout';

import { ROUTE_PATHS } from './routePaths';

export const router = createBrowserRouter([
  {
    path: ROUTE_PATHS.HOME,
    Component: RootLayout,
    ErrorBoundary: RouteErrorBoundary,
    HydrateFallback: PageLoader,
    children: [
      {
        Component: PublicLayout,
        children: [
          {
            index: true,
            lazy: () => import('@/features/landing/pages/LandingPage'),
          },
          {
            path: '*',
            lazy: () => import('@/features/errors/pages/NotFoundPage'),
          },
        ],
      },
      {
        Component: AuthLayout,
        children: [
          {
            path: ROUTE_PATHS.LOGIN,
            lazy: () => import('@/features/auth/pages/LoginPage'),
          },
          {
            path: ROUTE_PATHS.REGISTER,
            lazy: () => import('@/features/auth/pages/RegisterPage'),
          },
        ],
      },
      {
        path: ROUTE_PATHS.APP,
        Component: AppLayout,
        children: [
          {
            index: true,
            lazy: () => import('@/features/overview/pages/OverviewPage'),
          },
          {
            path: '*',
            lazy: () => import('@/features/errors/pages/NotFoundPage'),
          },
        ],
      },
    ],
  },
]);
