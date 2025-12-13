"use client";

import { 
  User, 
  LogOut, 
  Settings, 
  LayoutDashboard, 
  Store, 
  Users, 
  Home 
} from "lucide-react";
import { useRouter } from "next/navigation";
import { UserRole } from "@alifh/shared";

interface UserData {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  role?: UserRole | null;
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
    const userRole = user.role;

    const getDashboardAccess = (role: UserRole | null): DashboardItem[] => {
      const dashboards: DashboardItem[] = [];
      
      if (role === 'admin') {
        dashboards.push({ 
          name: 'Admin Dashboard', 
          path: '/admin-dashboard',
          icon: LayoutDashboard
        });
      } else if (role === 'partner') {
        dashboards.push({ 
          name: 'Partner Dashboard', 
          path: '/partner-dashboard',
          icon: Store
        });
      } else if (role === 'staff') {
        dashboards.push({ 
          name: 'Staff Dashboard', 
          path: '/staff-dashboard',
          icon: Users
        });
      }
      
      // All users get their personal dashboard
      dashboards.push({ 
        name: 'My Dashboard', 
        path: '/user-dashboard',
        icon: Home
      });
      
      return dashboards;
    };

    const availableDashboards = getDashboardAccess(userRole);

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
