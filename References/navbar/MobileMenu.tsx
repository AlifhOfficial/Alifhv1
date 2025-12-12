/**
 * Mobile Menu Component
 * Follows Alifh Design Philosophy: minimal, clean, premium
 * 
 * Mobile navigation menu with auth options
 * 
 * Clean Architecture:
 * - Receives User domain entity (not raw session)
 * - Pure presentation logic only
 */

"use client";

import Link from "next/link";
import { LogOut, LayoutDashboard, MessageSquare } from "lucide-react";
import type { User as UserEntity } from "@alifh/core";

interface MobileMenuProps {
  user: UserEntity | null;
  navItems: Array<{
    label: string;
    href: string;
  }>;
  pathname: string | null;
  onNavigate: () => void;
  onSignIn: () => void;
  onSignUp: () => void;
  onSignOut: () => void;
}

export function MobileMenu({
  user,
  navItems,
  pathname,
  onNavigate,
  onSignIn,
  onSignUp,
  onSignOut,
}: MobileMenuProps) {
  return (
    <div className="lg:hidden border-t border-border/40 bg-card">
      <div className="px-4 py-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            onClick={onNavigate}
            className={`block py-2.5 px-3 text-sm font-medium transition-colors rounded-lg ${
              pathname === item.href
                ? "text-foreground bg-muted/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
            }`}
          >
            {item.label}
          </Link>
        ))}

        <div className="border-t border-border/40 my-3 pt-3 space-y-2">
          {user ? (
            // Authenticated Mobile Menu - Use domain methods
            <>
              <div className="px-3 py-2 mb-2">
                <p className="text-sm font-medium text-foreground">{user.getDisplayName()}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <button
                onClick={onNavigate}
                className="flex items-center gap-2 w-full text-left py-2.5 px-3 text-sm font-medium text-foreground hover:bg-muted/20 transition-colors rounded-lg"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={onNavigate}
                className="flex items-center gap-2 w-full text-left py-2.5 px-3 text-sm font-medium text-foreground hover:bg-muted/20 transition-colors rounded-lg"
              >
                <MessageSquare className="w-4 h-4" />
                Messages
              </button>
              <button
                onClick={onSignOut}
                className="flex items-center gap-2 w-full text-left py-2.5 px-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </>
          ) : (
            // Unauthenticated Mobile Menu
            <>
              <button
                onClick={onSignIn}
                className="block w-full text-left py-2.5 px-3 text-sm font-medium text-foreground hover:bg-muted/20 transition-colors rounded-lg"
              >
                Sign in
              </button>
              <button
                onClick={onSignUp}
                className="block w-full text-left py-2.5 px-3 text-sm font-medium text-foreground hover:bg-muted/20 transition-colors rounded-lg"
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
