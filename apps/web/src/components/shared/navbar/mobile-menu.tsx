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
  user?: { id: string; name?: string; email?: string } | null;
  onProfile?: () => void;
  onSignOut?: () => void;
}

export function MobileMenu({ navItems, pathname, onNavigate, onSignIn, onSignUp, user, onProfile, onSignOut }: MobileMenuProps) {
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
      className="lg:hidden fixed inset-0 top-14 sm:top-16 z-40 bg-background/95 backdrop-blur-2xl overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-6 py-8 space-y-6">
        {/* Main Navigation */}
        <div className="space-y-1">
          {navItems.map((item) => (
            <div key={item.label}>
              {item.submenu ? (
                <>
                  <button
                    onClick={() => toggleExpanded(item.label)}
                    className={`w-full flex items-center justify-between px-3 py-3 text-[15px] font-semibold tracking-tight transition-colors rounded-lg ${
                      pathname === item.href
                        ? "text-foreground bg-muted/30"
                        : "text-foreground/80 hover:text-foreground hover:bg-muted/20"
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
                    <div className="mt-3 mb-4 space-y-6 border-l border-border/30 ml-3 pl-5">
                      {item.submenu.map((section, sectionIndex) => {
                        const isProductSection = sectionIndex === 0;
                        
                        return (
                          <div key={section.title}>
                            <div className="text-sm font-medium text-muted-foreground/60 mb-3">
                              {section.title}
                            </div>
                            <div className={isProductSection ? 'space-y-2' : 'space-y-3'}>
                              {section.items.map((subItem) => (
                                <Link
                                  key={subItem.href}
                                  href={subItem.href}
                                  onClick={onNavigate}
                                  className={`block transition-colors ${
                                    isProductSection
                                      ? 'text-xl font-semibold tracking-tight text-foreground/90 hover:text-primary'
                                      : 'text-sm font-normal text-muted-foreground/70 hover:text-foreground'
                                  }`}
                                >
                                  {subItem.label}
                                </Link>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={`block px-3 py-3 text-[15px] font-semibold tracking-tight transition-colors rounded-lg ${
                    pathname === item.href
                      ? "text-foreground bg-muted/30"
                      : "text-foreground/80 hover:text-foreground hover:bg-muted/20"
                  }`}
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Mobile Auth Actions */}
        <div className="pt-6 border-t border-border/30 space-y-1">
          {user ? (
            <>
              <button
                onClick={() => {
                  onProfile?.();
                  onNavigate();
                }}
                className="block w-full px-3 py-3 text-[15px] font-semibold tracking-tight text-foreground/80 hover:text-foreground transition-colors rounded-lg hover:bg-muted/20 text-left"
              >
                Profile
              </button>
              <Link
                href="/user-dashboard"
                onClick={onNavigate}
                className="block w-full px-3 py-3 text-[15px] font-semibold tracking-tight text-foreground/80 hover:text-foreground transition-colors rounded-lg hover:bg-muted/20 text-left"
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  onSignOut?.();
                  onNavigate();
                }}
                className="block w-full px-3 py-3 text-[15px] font-semibold tracking-tight text-destructive hover:bg-destructive/10 transition-colors rounded-lg text-left"
              >
                Sign Out
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}