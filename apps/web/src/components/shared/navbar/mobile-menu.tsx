/**
 * MobileMenu Component - Presentation Layer Only
 * Mobile navigation drawer
 * Follows Revvup Design Philosophy: minimal, clean
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { NavItem } from "@/lib/navigation";

interface MobileMenuProps {
  navItems: NavItem[];
  pathname: string | null;
  onNavigate: () => void;
  onSignIn: () => void;
  onSignUp: () => void;
  user?: { id: string; name?: string; email?: string } | null;
  onProfile?: () => void;
  onSignOut?: () => void;
}

export function MobileMenu({ navItems, pathname, onNavigate, onSignIn: _onSignIn, onSignUp: _onSignUp, user: _user, onProfile: _onProfile, onSignOut: _onSignOut }: MobileMenuProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  return (
    <div 
      className="lg:hidden fixed inset-0 top-14 sm:top-16 z-40 bg-background overflow-y-auto overscroll-contain"
      onClick={(e) => e.stopPropagation()}
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <div className="px-6 py-8 space-y-6">
        {/* Main Navigation */}
        <div className="space-y-1">
          {navItems.map((item) => (
            <div key={item.label}>
              {item.submenu && !item.hideSubmenu ? (
                <>
                  <button
                    onClick={() => toggleExpanded(item.label)}
                    className={`w-full flex items-center justify-between px-3 py-3 text-subhead font-semibold tracking-tight transition-colors rounded-lg ${
                      pathname === item.href
                        ? "text-foreground bg-muted/50"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                    }`}
                  >
                    {item.label}
                    <ChevronDown 
                      className={`w-4 h-4 text-muted-foreground/50 transition-transform duration-200 ${
                        expandedItems.includes(item.label) ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  
                  {expandedItems.includes(item.label) && (
                    <div className="mt-3 mb-4 space-y-6 border-l border-border/40 ml-3 pl-5">
                      {item.submenu.map((section) => (
                        <div key={section.title}>
                          <div className="text-subhead font-semibold text-foreground mb-3">
                            {section.title}
                          </div>
                          <div className="space-y-2.5">
                            {section.items.map((subItem) => (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                onClick={onNavigate}
                                className="block text-subhead text-muted-foreground hover:text-foreground transition-colors"
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
                  className={`block px-3 py-3 text-subhead font-semibold tracking-tight transition-colors rounded-lg ${
                    pathname === item.href
                      ? "text-foreground bg-muted/50"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  }`}
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}