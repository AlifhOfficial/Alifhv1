/**
 * Mega Dropdown Component
 * Follows Alifh Design Philosophy: minimal, clean, premium
 * 
 * Full-width dropdown menu for navigation items
 */

"use client";

import Link from "next/link";

interface MegaDropdownProps {
  activeDropdown: string | null;
  navItems: Array<{
    label: string;
    href: string;
    submenu?: Array<{
      title: string;
      items: Array<{ label: string; href: string; description?: string }>;
    }>;
  }>;
  onClose: () => void;
}

export function MegaDropdown({ activeDropdown, navItems, onClose }: MegaDropdownProps) {
  const activeItem = navItems.find((item) => item.label === activeDropdown);
  
  if (!activeItem?.submenu) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
        onMouseEnter={onClose}
        onClick={onClose}
      />
      
      {/* Dropdown Content */}
      <div 
        className="fixed left-0 right-0 top-16 z-50 bg-card border-b border-border/40 shadow-lg"
        onMouseLeave={onClose}
      >
        <div className="max-w-[1400px] mx-auto px-6 py-8">
          <div className="grid grid-cols-3 gap-8">
            {activeItem.submenu.map((section) => (
              <div key={section.title}>
                <h3 className="text-xs font-medium text-muted-foreground mb-3">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      className="block px-3 py-2.5 rounded-lg hover:bg-muted/20 transition-colors group"
                      onClick={onClose}
                    >
                      <div className="text-sm font-medium text-foreground">
                        {subItem.label}
                      </div>
                      {subItem.description && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {subItem.description}
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
    </>
  );
}
