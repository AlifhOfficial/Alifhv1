"use client";

import { 
  User, 
  LogOut, 
  Settings, 
  LayoutDashboard, 
  Store, 
  Home 
} from "lucide-react";
import { useRouter } from "next/navigation";
import { UserRole } from "@alifh/shared";
import { getUserPortalAccess } from "@/lib/auth/routing";

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
  icon: React.ComponentType<{ size?: number; className?: string }>;
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

  if (user) {
    const displayName = user.name || 'User';
    const firstName = user.name?.split(' ')[0] || 'User';

    const getDashboardAccess = (userData: UserData): DashboardItem[] => {
      const dashboards: DashboardItem[] = [];
      const access = getUserPortalAccess(userData as any);
      
      // Platform Admin (super_admin or admin) - Admin Dashboard + User Dashboard
      if (access.admin) {
        dashboards.push({ 
          name: 'Platform Admin', 
          path: '/admin-dashboard',
          icon: LayoutDashboard
        });
        dashboards.push({ 
          name: 'My Dashboard', 
          path: '/user-dashboard',
          icon: Home
        });
        return dashboards;
      }
      
      // Dealer Owner (partnerRole === 'owner') - Partner Dashboard + User Dashboard
      if (access.partnerOwner) {
        dashboards.push({ 
          name: 'Dealership Manager', 
          path: '/partner-dashboard',
          icon: Store
        });
        dashboards.push({ 
          name: 'My Dashboard', 
          path: '/user-dashboard',
          icon: Home
        });
        return dashboards;
      }
      
      // Dealer Staff (has partner access but NOT owner) - Staff Dashboard + User Dashboard
      if (access.partnerStaff) {
        dashboards.push({ 
          name: 'Staff Dashboard', 
          path: '/staff-dashboard',
          icon: Store
        });
        dashboards.push({ 
          name: 'My Dashboard', 
          path: '/user-dashboard',
          icon: Home
        });
        return dashboards;
      }
      
      // Regular Users/Customers - ONLY User Dashboard
      dashboards.push({ 
        name: 'My Dashboard', 
        path: '/user-dashboard',
        icon: Home
      });
      
      return dashboards;
    };

    const availableDashboards = getDashboardAccess(user);

    const handleDashboardNavigation = (path: string) => {
      router.push(path);
      onToggleMenu();
    };
    
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
        <span className="text-sm text-muted-foreground">
          {firstName}
        </span>
        
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
            <div className="w-full h-full flex items-center justify-center text-primary text-xs font-medium">
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
                    className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted/20 transition-colors flex items-center gap-2"
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
              {onProfile && (
                <button
                  onClick={() => {
                    onProfile();
                    onToggleMenu();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted/20 transition-colors flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>Profile</span>
                </button>
              )}
              <button
                onClick={onToggleMenu}
                className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted/20 transition-colors flex items-center gap-2"
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
                className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2"
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
