"use client";

import { 
  User, 
  LogOut, 
  Settings,
  Shield,
  Briefcase,
  Users,
  LayoutGrid
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { UserRole } from "@alifh/shared";
import { getUserPortalAccess } from "@alifh/shared/auth";
import { useUserProfile } from "@/hooks/profile/user-profile-hook";

interface UserData {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  role?: UserRole | null;
  hasPartnerAccess?: boolean;
  isAlifhAdmin?: boolean;
  partnerMemberships?: Array<{
    staffId: string;
    partnerId: string;
    partnerName: string;
    staffRole: string;
  }>;
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

interface DashboardItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
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
  const [hasImageError, setHasImageError] = useState(false);
  const { profile, refresh } = useUserProfile({ fetchOnMount: !!user });

  const avatarSrc = useMemo(() => {
    return profile?.avatarUrl ?? undefined;
  }, [profile?.avatarUrl]);

  useEffect(() => {
    setHasImageError(false);
  }, [avatarSrc]);

  useEffect(() => {
    if (user && !profile) {
      void refresh();
    }
  }, [user, profile, refresh]);

  if (user) {
    const profileFirstName = profile?.firstName?.trim() ?? '';
    const profileLastName = profile?.lastName?.trim() ?? '';

    const displayName = profileFirstName.length > 0
      ? [profileFirstName, profileLastName].filter(Boolean).join(' ')
      : user.name || 'User';
    const firstName = profileFirstName.length > 0
      ? profileFirstName
      : user.name?.split(' ')[0] || 'User';

    const getDashboardAccess = (userData: UserData): DashboardItem[] => {
      const dashboards: DashboardItem[] = [];
      const access = getUserPortalAccess(userData as any);
      
      // Platform Admin (super_admin or admin) - Admin Dashboard + User Dashboard
      if (access.admin) {
        dashboards.push({ 
          name: 'Platform Admin', 
          path: '/admin-dashboard',
          icon: Shield
        });
        dashboards.push({ 
          name: 'My Dashboard', 
          path: '/user-dashboard',
          icon: LayoutGrid
        });
        return dashboards;
      }
      
      // Dealer Owner (partnerRole === 'owner') - Partner Dashboard + User Dashboard
      if (access.partnerOwner) {
        dashboards.push({ 
          name: 'Dealership Manager', 
          path: '/partner-dashboard',
          icon: Briefcase
        });
        dashboards.push({ 
          name: 'My Dashboard', 
          path: '/user-dashboard',
          icon: LayoutGrid
        });
        return dashboards;
      }
      
      // Dealer Staff (has partner access but NOT owner) - Staff Dashboard + User Dashboard
      if (access.partnerStaff) {
        dashboards.push({ 
          name: 'Staff Dashboard', 
          path: '/staff-dashboard',
          icon: Users
        });
        dashboards.push({ 
          name: 'My Dashboard', 
          path: '/user-dashboard',
          icon: LayoutGrid
        });
        return dashboards;
      }
      
      // Regular Users/Customers - ONLY User Dashboard
      dashboards.push({ 
        name: 'My Dashboard', 
        path: '/user-dashboard',
        icon: LayoutGrid
      });
      
      return dashboards;
    };

    const availableDashboards = getDashboardAccess(user);

    const handleDashboardNavigation = (path: string) => {
      router.push(path);
      onToggleMenu();
    };
    
    const getInitials = () => {
      const source = profileFirstName || profileLastName
        ? [profileFirstName, profileLastName].filter(Boolean).join(' ')
        : user.name;
      if (!source) return user.email?.charAt(0).toUpperCase() || 'U';
      return source
        .split(' ')
        .filter(Boolean)
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };
    
    return (
      <div className="relative flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {firstName}
        </span>
        
        <button
          onClick={onToggleMenu}
          className="relative w-8 h-8 rounded-full bg-muted hover:bg-muted/80 transition-colors overflow-hidden border border-border/50"
          aria-label="Profile menu"
        >
          {avatarSrc && !hasImageError ? (
            <Image
              src={avatarSrc}
              alt={displayName}
              fill
              sizes="32px"
              className="object-cover"
              onError={() => setHasImageError(true)}
              referrerPolicy="no-referrer"
              priority={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-foreground text-xs font-medium">
              {getInitials()}
            </div>
          )}
        </button>

        {showMenu && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border/40 rounded-lg shadow-lg z-50 overflow-hidden">
            {/* User Info */}
            <div className="p-4 border-b border-border/20">
              <p className="text-sm font-medium text-foreground">{displayName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
            </div>

            {/* Dashboards */}
            <div className="py-2">
              {availableDashboards.map((dashboard) => {
                const Icon = dashboard.icon;
                return (
                  <button
                    key={dashboard.path}
                    onClick={() => handleDashboardNavigation(dashboard.path)}
                    className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted/20 transition-colors flex items-center gap-3"
                  >
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span>{dashboard.name}</span>
                  </button>
                );
              })}
            </div>
              
            {/* Divider */}
            <div className="border-t border-border/20" />
            
            {/* Actions */}
            <div className="py-2">
              <button
                onClick={() => {
                  router.push('/user-dashboard/profile');
                  onToggleMenu();
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted/20 transition-colors flex items-center gap-3"
              >
                <User className="w-4 h-4 text-muted-foreground" />
                <span>Profile</span>
              </button>
              <button
                onClick={onToggleMenu}
                className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted/20 transition-colors flex items-center gap-3"
              >
                <Settings className="w-4 h-4 text-muted-foreground" />
                <span>Settings</span>
              </button>
            </div>
            
            {/* Divider */}
            <div className="border-t border-border/20" />
            
            {/* Sign Out */}
            <div className="py-2">
              <button
                onClick={onSignOut}
                className="w-full text-left px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-3"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative flex items-center">
      <button
        onClick={onToggleMenu}
        className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/20"
        aria-label="Profile menu"
      >
        <User className="w-4 h-4" />
      </button>

      {showMenu && (
        <div className="absolute right-0 top-full mt-2 w-40 bg-card border border-border/40 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="py-2">
            <button
              onClick={onSignIn}
              className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted/20 transition-colors"
            >
              Sign in
            </button>
            <button
              onClick={onSignUp}
              className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted/20 transition-colors"
            >
              Sign up
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
