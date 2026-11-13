import { NavLink } from 'react-router-dom';

import { cn } from '@excel-dashboard/ui/lib/utils';

import { APP_NAVIGATION } from './navigationConfig';

interface AppNavigationProps {
  onNavigate?: () => void;
}

export const AppNavigation = ({ onNavigate }: AppNavigationProps) => (
  <nav aria-label="Application navigation" className="space-y-6">
    {APP_NAVIGATION.map((group) => (
      <section key={group.id}>
        <p className="mb-2 px-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {group.label}
        </p>

        <ul className="space-y-1">
          {group.items.map((item) => {
            const Icon = item.icon;

            if (!item.to || item.comingSoon) {
              return (
                <li key={item.id}>
                  <span
                    aria-disabled="true"
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground opacity-70"
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />

                    <span className="flex-1">{item.label}</span>

                    <span className="text-[10px]">Soon</span>
                  </span>
                </li>
              );
            }

            return (
              <li key={item.id}>
                <NavLink
                  to={item.to}
                  end
                  onClick={() => onNavigate?.()}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                      'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground',
                    )
                  }
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />

                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </section>
    ))}
  </nav>
);
