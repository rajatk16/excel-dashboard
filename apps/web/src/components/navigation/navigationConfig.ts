import type { LucideIcon } from 'lucide-react';
import {
  ChartColumnIncreasing,
  Database,
  LayoutDashboard,
  ListFilter,
  PanelsTopLeft,
} from 'lucide-react';

import { ROUTE_PATHS } from '@/app/router/routePaths';

export interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
  to?: string;
  comingSoon?: boolean;
}

export interface NavigationGroup {
  id: string;
  label: string;
  items: readonly NavigationItem[];
}

export const APP_NAVIGATION: readonly NavigationGroup[] = [
  {
    id: 'workspace',
    label: 'Workspace',

    items: [
      {
        id: 'overview',
        label: 'Overview',
        icon: LayoutDashboard,
        to: ROUTE_PATHS.APP,
      },
      {
        id: 'datasets',
        label: 'Datasets',
        icon: Database,
        comingSoon: true,
      },
      {
        id: 'queries',
        label: 'Queries',
        icon: ListFilter,
        comingSoon: true,
      },
      {
        id: 'visualizations',
        label: 'Visualizations',
        icon: ChartColumnIncreasing,
        comingSoon: true,
      },
      {
        id: 'dashboards',
        label: 'Dashboards',
        icon: PanelsTopLeft,
        comingSoon: true,
      },
    ],
  },
];
