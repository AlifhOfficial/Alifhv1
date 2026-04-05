/**
 * MegaDropdown Component - Presentation Layer Only
 * Displays navigation submenus in a dropdown format
 * Follows Revvup Design Philosophy: minimal, clean
 */

"use client";

import Link from "next/link";
import type { NavItem } from "@/lib/navigation";

interface MegaDropdownProps {
  activeDropdown: string | null;
  navItems: NavItem[];
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function MegaDropdown({ activeDropdown, navItems, onClose, onMouseEnter, onMouseLeave }: MegaDropdownProps) {
  if (!activeDropdown) return null;

  const activeItem = navItems.find(item => item.label === activeDropdown);
  if (!activeItem?.submenu) return null;

  // Sort submenu sections by number of items (most to least)
  const sortedSubmenu = [...activeItem.submenu].sort((a, b) => b.items.length - a.items.length);

  return (
    <>
      {/* Glassmorphic overlay backdrop */}
      <div
        className={`fixed inset-0 top-14 sm:top-16 z-30 bg-background/80 backdrop-blur-2xl transition-opacity duration-300 will-change-[opacity] ${
          activeDropdown ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
        onClick={onClose}
      />
      
      {/* Dropdown content */}
      <div
        className={`fixed left-0 right-0 top-14 sm:top-16 z-40 transition-[opacity,transform] duration-300 will-change-[opacity,transform] ${
          activeDropdown ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
        }`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="bg-background">
          <div className="max-w-5xl mx-auto px-8 py-12">
            <div className="grid grid-cols-3 gap-x-12">
              {sortedSubmenu.map((section) => (
                <div key={section.title}>
                  <h3 className="text-subhead font-semibold tracking-tight text-primary mb-5">
                    {section.title}
                  </h3>
                  <nav className="space-y-3">
                    {section.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className="block group"
                      >
                        <span className="text-subhead font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-150 will-change-[color]">
                          {item.label}
                        </span>
                      </Link>
                    ))}
                  </nav>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}