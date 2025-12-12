/**
 * ProfileMenu Component - Alifh User Interface
 * Handles user authentication states and portal navigation in navbar
 * Clean, minimal design for Alifh vehicle marketplace
 */

"use client";

import { User, LogOut, Settings, Shield, Users, Building2, Home } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserData {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  platformRole?: string;
  status?: string;
  activePartnerId?: string;
}

interface PortalOption {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: React.ComponentType<any>;
  color: string;
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
  const router = useRouter();

  // Get available portals based on user's roles and access
  const getAvailablePortals = (user: UserData): PortalOption[] => {
    const portals: PortalOption[] = [];

    // User Portal - Available to all authenticated users
    portals.push({
      id: 'user',
      label: 'User Dashboard',
      description: 'Personal account and activities',
      href: '/user-dashboard',
      icon: User,
      color: 'text-blue-600'
    });

    // Partner Portals - Available if user has active partner
    const activePartnerId = (user as any)?.activePartnerId;
    if (activePartnerId) {
      portals.push({
        id: 'partner-owner',
        label: 'Owner Portal',
        description: 'Manage your partner organization',
        href: '/partner/owner-dashboard',
        icon: Building2,
        color: 'text-green-600'
      });
      
      portals.push({
        id: 'partner-admin',
        label: 'Partner Admin',
        description: 'Partner operations and staff',
        href: '/partner/admin-dashboard',
        icon: Users,
        color: 'text-yellow-600'
      });
      
      portals.push({
        id: 'partner-staff',
        label: 'Staff Portal',
        description: 'Daily tasks and operations',
        href: '/partner/staff-dashboard',
        icon: Home,
        color: 'text-pink-600'
      });
    }

    // Admin Portal - Available to admin/staff/super-admin
    const platformRole = (user as any)?.platformRole || 'user';
    if (['admin', 'super-admin', 'staff'].includes(platformRole)) {
      portals.push({
        id: 'admin',
        label: 'Admin Portal',
        description: 'System administration',
        href: '/admin-dashboard',
        icon: Shield,
        color: 'text-red-600'
      });
    }

    return portals;
  };

  const handlePortalNavigation = (href: string) => {
    router.push(href);
    onToggleMenu();
  };
  if (user) {
    // Authenticated State
    const displayName = user.name || 'User';
    const firstName = user.name?.split(' ')[0] || 'User';
    const availablePortals = getAvailablePortals(user);
    
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
          <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border/40 rounded-lg shadow-lg z-50 overflow-hidden">
            {/* User Info Header */}
            <div className="p-3 border-b border-border/40">
              <p className="text-sm font-medium text-foreground">{displayName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              {(user as any)?.platformRole && (
                <div className="mt-1">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {((user as any).platformRole as string).charAt(0).toUpperCase() + ((user as any).platformRole as string).slice(1)}
                  </span>
                </div>
              )}
            </div>

            {/* Available Portals */}
            {availablePortals.length > 0 && (
              <div className="py-2">
                <div className="px-3 py-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Available Portals
                  </p>
                </div>
                <div className="space-y-1">
                  {availablePortals.map((portal) => {
                    const IconComponent = portal.icon;
                    return (
                      <button
                        key={portal.id}
                        onClick={() => handlePortalNavigation(portal.href)}
                        className="w-full text-left px-3 py-2.5 text-sm text-foreground hover:bg-muted/20 transition-colors flex items-start gap-3"
                      >
                        <IconComponent className={`w-4 h-4 mt-0.5 ${portal.color}`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{portal.label}</p>
                          <p className="text-xs text-muted-foreground">{portal.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="border-t border-border/40 my-2" />
              </div>
            )}

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