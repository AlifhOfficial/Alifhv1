/**
 * MegaDropdown Component - Presentation Layer Only
 * Displays navigation submenus in a dropdown format
 * Follows Alifh Design Philosophy: minimal, clean
 */

"use client";

import Link from "next/link";

interface NavItem {
  label: string;
  href: string;
  submenu?: {
    title: string;
    items: { label: string; href: string; description?: string }[];
  }[];
}

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

  return (
    <div
      className={`fixed left-0 right-0 top-14 sm:top-16 z-40 transition-all duration-200 ${
        activeDropdown ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="bg-background/95 backdrop-blur-md border-b border-border/40 shadow-lg">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeItem.submenu.map((section) => (
              <div key={section.title}>
                <h3 className="text-sm font-medium text-foreground mb-4">
                  {section.title}
                </h3>
                <div className="space-y-3">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className="block group"
                    >
                      <div className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        {item.label}
                      </div>
                      {item.description && (
                        <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {item.description}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}