import { RouterProvider } from "react-router-dom";

import { router } from '@/app/router/Router';
import { AppErrorBoundary } from "@/components/feedback/ErrorBoundary";

import { AppProviders } from "./providers/AppProviders";



export const App = () => (
  <AppErrorBoundary>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </AppErrorBoundary>
)
