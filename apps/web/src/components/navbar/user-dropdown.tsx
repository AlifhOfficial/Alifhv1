"use client";

import { 
  User,
  LogOut
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UserRole } from "@/types/auth";
import { getUserPortalAccess } from "@/lib/auth/routing";
import { UserAvatar } from "@/components/ui/data-display/user-avatar";
import { useUserProfile } from "@/hooks/profile";

interface UserData {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  avatar?: string | null;
  avatarUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  useGeneratedAvatar?: boolean | null;
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
  const [mounted, setMounted] = useState(false);
  
  // Subscribe to profile for instant avatar sync after updates
  const { profile } = useUserProfile();

  // Prevent hydration mismatch by only rendering user-specific content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading placeholder during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="relative flex items-center" data-menu-container>
        <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
      </div>
    );
  }

  if (user) {
    // Profile hook provides instant updates, fallback to server session data
    const firstName = profile?.firstName ?? user.firstName?.trim() ?? user.name?.split(' ')[0] ?? 'User';
    const lastName = profile?.lastName ?? user.lastName?.trim() ?? '';
    const avatarUrl = profile?.avatarUrl ?? user.avatarUrl;
    const useGeneratedAvatar = profile?.preferences?.useGeneratedAvatar ?? user.useGeneratedAvatar ?? true;

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
    
    return (
      <div className="relative flex items-center gap-2.5" data-menu-container>
        <span className="text-sm text-muted-foreground/70 hidden sm:inline">
          {firstName}
        </span>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleMenu(e);
          }}
          className="relative"
          aria-label="Profile menu"
          data-menu-trigger
        >
          <UserAvatar
            src={avatarUrl}
            name={displayName}
            size="sm"
            className="hover:opacity-90 transition-opacity"
            useGeneratedAvatar={useGeneratedAvatar}
          />
        </button>

        {showMenu && (
          <div 
            className="absolute right-0 top-full mt-2 w-52 bg-sidebar border border-sidebar-border rounded-lg shadow-lg z-50 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            data-menu-container
          >
            {/* Menu Items */}
            <div className="py-1.5">
              {/* Dashboards Section */}
              {availableDashboards.map((dashboard, index) => (
                <button
                  key={dashboard.path}
                  onClick={() => handleDashboardNavigation(dashboard.path)}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                >
                  {dashboard.name}
                </button>
              ))}
              
              {/* Divider */}
              <div className="my-1.5 mx-3 border-t border-sidebar-border" />
              
              {/* Account Actions */}
              <button
                onClick={() => {
                  router.push('/user-dashboard/profile');
                  onToggleMenu();
                }}
                className="w-full text-left px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors flex items-center gap-2.5"
              >
                <User size={16} strokeWidth={2} className="text-sidebar-foreground/60" />
                Profile
              </button>
              
              {/* Divider */}
              <div className="my-1.5 mx-3 border-t border-sidebar-border" />
              
              {/* Sign Out */}
              <button
                onClick={onSignOut}
                className="w-full text-left px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2.5"
              >
                <LogOut size={16} strokeWidth={2} />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative flex items-center" data-menu-container suppressHydrationWarning>
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
          className="absolute right-0 top-full mt-2 w-44 bg-sidebar border border-sidebar-border rounded-lg shadow-lg z-50"
          onClick={(e) => e.stopPropagation()}
          data-menu-container
        >
          <div className="py-1.5">
            <button
              onClick={onSignIn}
              className="w-full text-left px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors rounded"
            >
              Sign in
            </button>
            <button
              onClick={onSignUp}
              className="w-full text-left px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors rounded"
            >
              Create account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
