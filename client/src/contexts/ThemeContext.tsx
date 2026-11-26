import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextValue {
  /** The theme currently showing. */
  theme: Theme;
  setTheme: (t: Theme) => void;
  /** Switches between light and dark. */
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// Must match the key in the inline script in index.html.
export const THEME_STORAGE_KEY = 'msa-theme';

// Used when the user has not chosen anything yet.
const DEFAULT_THEME: Theme = 'light';

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // Storage can be blocked (private mode); fall back to the default.
  }
  return DEFAULT_THEME;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);

  // Apply the theme to the page whenever it changes.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#0e1014' : '#f6f7f9');
  }, [theme]);

  const value = useMemo<ThemeContextValue>(() => {
    const setTheme = (next: Theme) => {
      setThemeState(next);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // Not saved, but the choice still applies for this session.
      }
    };
    const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
    return { theme, setTheme, toggleTheme };
  }, [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}