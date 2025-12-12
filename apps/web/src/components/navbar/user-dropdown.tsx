/**
 * ProfileMenu Component - Alifh User Interface
 * Handles user authentication states and portal navigation in navbar
 * Clean, minimal design for Alifh vehicle marketplace
 */

"use client";

import { User, LogOut, Settings } from "lucide-react";

interface UserData {
  id: string;
  name?: string;
  email?: string;
  image?: string;
}

interface ProfileMenuProps {
  user: UserData | null;
  showMenu: boolean;
  onToggleMenu: () => void;
  onSignIn: () => void;
  onSignUp: () => void;
  onSignOut: () => void;
  onProfile?: () => void;
}

export function ProfileMenu({
  user,
  showMenu,
  onToggleMenu,
  onSignIn,
  onSignUp,
  onSignOut,
  onProfile,
}: ProfileMenuProps) {
  if (user) {
    // Authenticated State
    const displayName = user.name || 'User';
    const firstName = user.name?.split(' ')[0] || 'User';
    
    const getInitials = () => {
      if (!user.name) return user.email?.charAt(0).toUpperCase() || 'U';
      return user.name
        .split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };
    
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
            <img
              src={user.image}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary text-sm font-medium">
              {getInitials()}
            </div>
          )}
        </button>

        {/* Authenticated Dropdown */}
        {showMenu && (
          <div className="absolute right-0 top-full mt-2 w-60 bg-card border border-border/40 rounded-lg shadow-lg z-50 overflow-hidden">
            {/* User Info Header */}
            <div className="p-3 border-b border-border/40">
              <p className="text-sm font-medium text-foreground">{displayName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>

            {/* Account Actions */}
            <div className="py-2">
              {onProfile && (
                <button
                  onClick={() => {
                    onProfile();
                    onToggleMenu();
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted/20 transition-colors flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
              )}
              <button
                onClick={onToggleMenu}
                className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted/20 transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Settings
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