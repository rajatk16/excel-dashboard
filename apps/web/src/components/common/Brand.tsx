import { ChartNoAxesCombined } from 'lucide-react';
import { Link } from 'react-router-dom';

import { cn } from '@excel-dashboard/ui/lib/utils';

import { ROUTE_PATHS } from '@/app/router/routePaths';
import { getEnvironment } from '@/config/env';

interface Props {
  className?: string;
  showName?: boolean;
}

export const Brand = ({ className, showName = true }: Props) => {
  const environment = getEnvironment();

  return (
    <Link
      to={ROUTE_PATHS.HOME}
      aria-label={`${environment.VITE_APP_NAME} home`}
      className={cn('inline-flex shrink-0 items-center gap-2.5', className)}
    >
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <ChartNoAxesCombined className="size-5" aria-hidden="true" />
      </span>

      {showName && (
        <span className="text-base font-semibold tracking-tight">{environment.VITE_APP_NAME}</span>
      )}
    </Link>
  );
};
