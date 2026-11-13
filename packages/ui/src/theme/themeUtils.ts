import type { ResolvedTheme, Theme } from './ThemeContext';

export const SYSTEM_THEME_QUERY = '(prefers-color-scheme: dark)';

export const isTheme = (value: unknown): value is Theme =>
  value === 'light' || value === 'dark' || value === 'system';

export const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return window.matchMedia(SYSTEM_THEME_QUERY).matches ? 'dark' : 'light';
};

export const readStoredTheme = (storageKey: string, fallback: Theme): Theme => {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const storedTheme = window.localStorage.getItem(storageKey);

    return isTheme(storedTheme) ? storedTheme : fallback;
  } catch {
    return fallback;
  }
};

export const persistTheme = (storageKey: string, theme: Theme): void => {
  try {
    window.localStorage.setItem(storageKey, theme);
  } catch {
    // Theme selection still works when storage is unavailable.
  }
};

export function resolveTheme(theme: Theme, systemTheme: ResolvedTheme): ResolvedTheme {
  return theme === 'system' ? systemTheme : theme;
}

export const applyTheme = (theme: ResolvedTheme): void => {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;

  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
  root.style.removeProperty('background-color');
};
