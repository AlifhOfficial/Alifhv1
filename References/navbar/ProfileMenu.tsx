/**
 * Profile Menu Component
 * Follows Alifh Design Philosophy: minimal, clean, premium
 * 
 * Handles authenticated/unauthenticated profile dropdown
 * 
 * Clean Architecture:
 * - Receives User domain entity (not raw session)
 * - Pure presentation logic only
 */

"use client";

import Image from "next/image";
import { User, LogOut, LayoutDashboard, MessageSquare } from "lucide-react";
import type { User as UserEntity } from "@alifh/core";

interface ProfileMenuProps {
  user: UserEntity | null;
  showMenu: boolean;
  onToggleMenu: () => void;
  onSignIn: () => void;
  onSignUp: () => void;
  onSignOut: () => void;
}

export function ProfileMenu({
  user,
  showMenu,
  onToggleMenu,
  onSignIn,
  onSignUp,
  onSignOut,
}: ProfileMenuProps) {
  if (user) {
    // Authenticated State - Use domain methods
    const displayName = user.getDisplayName();
    const firstName = user.getFirstName();
    const initials = user.getInitials();
    
    return (
      <div className="relative flex items-center gap-2">
        {/* User's First Name */}
        <span className="text-sm font-medium text-foreground">
          {firstName}
        </span>
        
        {/* User Avatar */}
        <button
          onClick={onToggleMenu}
          className="relative w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors overflow-hidden border border-border/40"
          aria-label="Profile menu"
        >
          {user.image ? (
            <Image
              src={user.image}
              alt={displayName}
              fill
              sizes="32px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary text-sm font-medium">
              {initials}
            </div>
          )}
        </button>

        {/* Authenticated Dropdown */}
        {showMenu && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border/40 rounded-lg shadow-lg z-50 overflow-hidden">
            <div className="p-3 border-b border-border/40">
              <p className="text-sm font-medium text-foreground">{displayName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <div className="py-2">
              <button
                onClick={onToggleMenu}
                className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted/20 transition-colors flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={onToggleMenu}
                className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted/20 transition-colors flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Messages
              </button>
              <div className="border-t border-border/40 my-2" />
              <button
                onClick={onSignOut}
                className="w-full text-left px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Unauthenticated State
  return (
    <div className="relative flex items-center gap-2">
      <button
        onClick={onToggleMenu}
        className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/20"
        aria-label="Profile menu"
      >
        <User className="w-4 h-4" />
      </button>

      {showMenu && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border/40 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="py-2">
            <button
              onClick={onSignIn}
              className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted/20 transition-colors"
            >
              Sign in
            </button>
            <button
              onClick={onSignUp}
              className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted/20 transition-colors"
            >
              Sign up
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
