"use client";

import { Moon, CheckCircle2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-theme-menu-container]')) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showMenu]);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-7 w-7">
        <Moon className="size-4" />
        <span className="sr-only">Theme menu</span>
      </Button>
    );
  }

  const themes = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'charcoal', label: 'Charcoal' }
  ];

  return (
    <div className="relative" data-theme-menu-container>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
      >
        <Moon className="size-4" />
        <span className="sr-only">Theme menu</span>
      </Button>

      {showMenu && (
        <div 
          className="absolute right-0 top-full mt-2 w-32 bg-sidebar border border-sidebar-border rounded-lg shadow-lg z-50 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="py-1.5">
            {themes.map((themeOption) => (
              <button
                key={themeOption.value}
                onClick={() => {
                  setTheme(themeOption.value);
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-[14px] font-medium tracking-tight text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors flex items-center justify-between"
              >
                <span>{themeOption.label}</span>
                {theme === themeOption.value && (
                  <CheckCircle2 className="size-3.5" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
