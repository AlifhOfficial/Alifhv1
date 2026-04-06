'use client';

import { useEffect, useState } from 'react';
import { Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

const THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'charcoal', label: 'Charcoal' },
] as const;

export function PublicThemeToggle() {
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (!showThemeMenu) {
      return;
    }

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-theme-menu-container]')) {
        setShowThemeMenu(false);
      }
    };

    setTimeout(() => document.addEventListener('click', handleClick), 0);
    return () => document.removeEventListener('click', handleClick);
  }, [showThemeMenu]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowThemeMenu(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div className="relative mr-2 hidden compact:block" data-theme-menu-container>
      <button
        onClick={(event) => {
          event.stopPropagation();
          setShowThemeMenu((current) => !current);
        }}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border/50 bg-muted/25 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
        aria-label="Theme menu"
        suppressHydrationWarning
      >
        <Moon className="size-4" />
      </button>

      {showThemeMenu && (
        <div
          className="absolute right-0 top-full mt-2 w-32 bg-sidebar border border-sidebar-border rounded-2xl shadow-lg z-50 overflow-hidden"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="p-1.5 flex flex-col gap-0.5">
            {THEME_OPTIONS.map((themeOption) => (
              <button
                key={themeOption.value}
                onClick={() => {
                  setTheme(themeOption.value);
                  setShowThemeMenu(false);
                }}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-md touch-manipulation',
                  'text-subhead tracking-tight transition-colors duration-100',
                  theme === themeOption.value
                    ? 'bg-sidebar-accent text-sidebar-foreground font-semibold'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )}
              >
                {themeOption.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
