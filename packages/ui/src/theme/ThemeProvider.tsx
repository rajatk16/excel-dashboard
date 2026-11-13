import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';

import { type Theme, ThemeContext, type ThemeContextValue } from './ThemeContext';
import {
  applyTheme,
  getSystemTheme,
  isTheme,
  persistTheme,
  readStoredTheme,
  resolveTheme,
  SYSTEM_THEME_QUERY,
} from './themeUtils';

interface ThemeProviderProps extends PropsWithChildren {
  defaultTheme?: Theme;
  storageKey?: string;
}

export const ThemeProvider = ({
  children,
  defaultTheme = 'system',
  storageKey = 'excel-dashboard-theme',
}: ThemeProviderProps) => {
  const [theme, setThemeState] = useState<Theme>(() => readStoredTheme(storageKey, defaultTheme));

  const [systemTheme, setSystemTheme] = useState(getSystemTheme);

  const resolvedTheme = resolveTheme(theme, systemTheme);

  const setTheme = useCallback(
    (nextTheme: Theme): void => {
      setThemeState(nextTheme);
      persistTheme(storageKey, nextTheme);
    },
    [storageKey],
  );

  useLayoutEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(SYSTEM_THEME_QUERY);

    const handleSystemThemeChange = (event: MediaQueryListEvent): void => {
      setSystemTheme(event.matches ? 'dark' : 'light');
    };

    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent): void => {
      if (event.key === null) {
        setThemeState(readStoredTheme(storageKey, defaultTheme));

        return;
      }

      if (event.key !== storageKey) {
        return;
      }

      setThemeState(isTheme(event.newValue) ? event.newValue : defaultTheme);
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [storageKey, defaultTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [theme, resolvedTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
