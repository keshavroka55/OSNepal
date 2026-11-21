import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme, type ThemePreference } from '../contexts/ThemeContext';

const LABEL: Record<ThemePreference, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};
const ICON = { light: Sun, dark: Moon, system: Monitor } as const;
const NEXT: Record<ThemePreference, ThemePreference> = {
  light: 'dark',
  dark: 'system',
  system: 'light',
};

// A single cycling button keeps the header compact on phones.
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, cycleTheme } = useTheme();
  const Icon = ICON[theme];

  return (
    <button
      type="button"
      onClick={cycleTheme}
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
