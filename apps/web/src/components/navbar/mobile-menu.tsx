/**
 * MobileMenu Component - Presentation Layer Only
 * Mobile navigation drawer
 * Follows Alifh Design Philosophy: minimal, clean
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  submenu?: {
    title: string;
    items: { label: string; href: string; description?: string }[];
  }[];
}

interface MobileMenuProps {
  navItems: NavItem[];
  pathname: string | null;
  onNavigate: () => void;
  onSignIn: () => void;
  onSignUp: () => void;
}

export function MobileMenu({ navItems, pathname, onNavigate, onSignIn, onSignUp }: MobileMenuProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  return (
    <div className="lg:hidden bg-background/95 backdrop-blur-sm border-b border-border/40">
      <div className="px-4 py-6 space-y-4">
        {/* Main Navigation */}
        <div className="space-y-2">
          {navItems.map((item) => (
            <div key={item.label}>
              {item.submenu ? (
                <>
                  <button
                    onClick={() => toggleExpanded(item.label)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium transition-colors rounded-lg ${
                      pathname === item.href
                        ? "text-foreground bg-muted/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
                    }`}
                  >
                    {item.label}
                    <ChevronDown 
                      className={`w-4 h-4 transition-transform ${
                        expandedItems.includes(item.label) ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  
                  {expandedItems.includes(item.label) && (
                    <div className="ml-4 mt-2 space-y-3 border-l border-border/40 pl-4">
                      {item.submenu.map((section) => (
                        <div key={section.title}>
                          <div className="text-xs font-medium text-muted-foreground mb-2">
                            {section.title}
                          </div>
                          <div className="space-y-2">
                            {section.items.map((subItem) => (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                onClick={onNavigate}
                                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {subItem.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={`block px-3 py-2 text-sm font-medium transition-colors rounded-lg ${
                    pathname === item.href
                      ? "text-foreground bg-muted/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
                  }`}
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Mobile Auth Actions */}
        <div className="pt-4 border-t border-border/40 space-y-2">
          <button
            onClick={() => {
              onSignIn();
              onNavigate();
            }}
            className="block w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/20 text-center"
          >
            Sign In
          </button>
          <button
            onClick={() => {
              onSignUp();
              onNavigate();
            }}
            className="block w-full px-3 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-lg text-center"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}