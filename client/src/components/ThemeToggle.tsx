import { Moon, Sun } from 'lucide-react';
import { useTheme, type Theme } from '../contexts/ThemeContext';

const LABEL: Record<Theme, string> = {
  light: 'Light',
  dark: 'Dark',
};
const ICON = { light: Sun, dark: Moon } as const;
const NEXT: Record<Theme, Theme> = {
  light: 'dark',
  dark: 'light', // was 'system' before, now it goes back to light
};

// A single toggle button keeps the header compact on phones.
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const Icon = ICON[theme];

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Theme: ${LABEL[theme]}. Switch to ${LABEL[NEXT[theme]]}.`}
      title={`Theme: ${LABEL[theme]}`}
      data-testid="theme-toggle"
      className={`inline-flex h-11 w-11 items-center justify-center rounded-md border border-border text-text-muted transition-colors hover:bg-surface-raised hover:text-text sm:h-9 sm:w-9 ${className}`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}

export default ThemeToggle;