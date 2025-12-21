'use client';

import { Loader2, Moon, Sun } from 'lucide-react';
import { useTheme } from './theme-provider';

export function ThemeToggle() {
  const { theme, toggleTheme, hasHydrated } = useTheme();

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      className="flex h-10 w-10 items-center justify-center rounded-full glass hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      disabled={!hasHydrated}
    >
      {!hasHydrated ? (
        <Loader2 className="h-5 w-5 animate-spin text-foreground-muted" />
      ) : isDark ? (
        <Sun className="h-5 w-5 text-amber-300" />
      ) : (
        <Moon className="h-5 w-5 text-slate-900" />
      )}
    </button>
  );
}
