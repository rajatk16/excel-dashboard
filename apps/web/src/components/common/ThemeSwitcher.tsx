import { Monitor, Moon, Sun } from 'lucide-react';

import { Button } from '@excel-dashboard/ui/components/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@excel-dashboard/ui/components/DropdownMenu';
import { useTheme } from '@excel-dashboard/ui/theme/useTheme';

export const ThemeSwitcher = () => {
  const { setTheme, resolvedTheme, theme } = useTheme();

  const handleThemeChange = (value: string): void => {
    if (value === 'light' || value === 'dark' || value === 'system') {
      setTheme(value);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Change color theme">
          {resolvedTheme === 'dark' ? (
            <Moon className="size-5" aria-hidden="true" />
          ) : (
            <Sun className="size-5" aria-hidden="true" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuRadioGroup value={theme} onValueChange={handleThemeChange}>
          <DropdownMenuRadioItem value="light">
            <Sun className="size-4" aria-hidden="true" />
            Light
          </DropdownMenuRadioItem>

          <DropdownMenuRadioItem value="dark">
            <Moon className="size-4" aria-hidden="true" />
            Dark
          </DropdownMenuRadioItem>

          <DropdownMenuRadioItem value="system">
            <Monitor className="size-4" aria-hidden="true" />
            System
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
