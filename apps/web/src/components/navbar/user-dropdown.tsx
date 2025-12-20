"use client";

import { 
  User,
  LogOut
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { UserRole } from "@/types/auth";
import { getUserPortalAccess } from "@/lib/auth/routing";

interface UserData {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  avatar?: string | null;
  avatarUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
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
  onToggleMenu: (e?: React.MouseEvent) => void;
  onSignIn: () => void;
  onSignUp: () => void;
  onSignOut: () => void;
  onProfile?: () => void;
}

interface DashboardItem {
  name: string;
  path: string;
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

  const avatarSrc = useMemo(() => {
    return user?.avatarUrl ?? user?.image ?? undefined;
  }, [user?.avatarUrl, user?.image]);

  useEffect(() => {
    setHasImageError(false);
  }, [avatarSrc]);

  if (user) {
    const firstName = user.firstName?.trim() ?? user.name?.split(' ')[0] ?? 'User';
    const lastName = user.lastName?.trim() ?? '';

    const displayName = firstName && lastName
      ? `${firstName} ${lastName}`
      : user.name || 'User';

    const getDashboardAccess = (userData: UserData): DashboardItem[] => {
      const dashboards: DashboardItem[] = [];
      const access = getUserPortalAccess(userData as any);
      
      if (access.admin) {
        dashboards.push({ name: 'Platform Admin', path: '/admin-dashboard' });
        dashboards.push({ name: 'My Dashboard', path: '/user-dashboard' });
        return dashboards;
      }
      
      if (access.partnerOwner) {
        dashboards.push({ name: 'Dealership Manager', path: '/partner-dashboard' });
        dashboards.push({ name: 'My Dashboard', path: '/user-dashboard' });
        return dashboards;
      }
      
      if (access.partnerStaff) {
        dashboards.push({ name: 'Staff Dashboard', path: '/staff-dashboard' });
        dashboards.push({ name: 'My Dashboard', path: '/user-dashboard' });
        return dashboards;
      }
      
      dashboards.push({ name: 'My Dashboard', path: '/user-dashboard' });
      return dashboards;
    };

    const availableDashboards = getDashboardAccess(user);

    const handleDashboardNavigation = (path: string) => {
      router.push(path);
      onToggleMenu();
    };
    
    const getInitials = () => {
      const source = firstName || lastName
        ? [firstName, lastName].filter(Boolean).join(' ')
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
      <div className="relative flex items-center gap-2.5" data-menu-container>
        <span className="text-sm text-muted-foreground hidden sm:inline">
          {firstName}
        </span>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleMenu(e);
          }}
          className="relative w-8 h-8 rounded-full bg-muted hover:bg-muted/80 transition-colors overflow-hidden border border-border/40"
          aria-label="Profile menu"
          data-menu-trigger
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
            <div className="w-full h-full flex items-center justify-center text-foreground text-xs">
              {getInitials()}
            </div>
          )}
        </button>

        {showMenu && (
          <div 
            className="absolute right-0 top-full mt-2 w-60 bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl shadow-black/10 z-50 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            data-menu-container
          >
            {/* User Header */}
            <div className="px-4 py-3.5 border-b border-border/30">
              <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground/60 truncate mt-0.5">{user.email}</p>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {/* Dashboards Section */}
              {availableDashboards.map((dashboard, index) => (
                <button
                  key={dashboard.path}
                  onClick={() => handleDashboardNavigation(dashboard.path)}
                  className="w-full text-left px-4 py-2.5 text-[15px] text-foreground hover:bg-muted/50 active:bg-muted/70 transition-all"
                >
                  {dashboard.name}
                </button>
              ))}
              
              {/* Divider */}
              <div className="my-2 mx-4 border-t border-border/30" />
              
              {/* Account Actions */}
              <button
                onClick={() => {
                  router.push('/user-dashboard/profile');
                  onToggleMenu();
                }}
                className="w-full text-left px-4 py-2.5 text-[15px] text-foreground hover:bg-muted/50 active:bg-muted/70 transition-all flex items-center gap-3"
              >
                <User size={16} strokeWidth={1.5} className="text-muted-foreground" />
                Profile
              </button>
              
              {/* Divider */}
              <div className="my-2 mx-4 border-t border-border/30" />
              
              {/* Sign Out */}
              <button
                onClick={onSignOut}
                className="w-full text-left px-4 py-2.5 text-[15px] text-destructive hover:bg-destructive/10 active:bg-destructive/20 transition-all flex items-center gap-3"
              >
                <LogOut size={16} strokeWidth={1.5} />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative flex items-center" data-menu-container>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleMenu(e);
        }}
        className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md"
        aria-label="Profile menu"
        data-menu-trigger
      >
        <User size={16} />
      </button>

      {showMenu && (
        <div 
          className="absolute right-0 top-full mt-2 w-44 bg-card border border-border/40 rounded-lg shadow-lg z-50"
          onClick={(e) => e.stopPropagation()}
          data-menu-container
        >
          <div className="p-1.5">
            <button
              onClick={onSignIn}
              className="w-full text-left px-2.5 py-1.5 text-sm text-foreground hover:bg-muted/40 transition-colors rounded"
            >
              Sign in
            </button>
            <button
              onClick={onSignUp}
              className="w-full text-left px-2.5 py-1.5 text-sm text-foreground hover:bg-muted/40 transition-colors rounded"
            >
              Create account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
