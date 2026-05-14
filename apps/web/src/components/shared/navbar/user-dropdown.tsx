"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  User,
  LogOut,
  ChevronDown
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { UserRole } from "@/types/auth";
import { getUserPortalAccess } from "@/lib/auth/routing";
import { UserAvatar } from "@/components/ui/data-display/user-avatar";
import type { NavItem } from "@/lib/navigation";

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
  isRevvupAdmin?: boolean;
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
  // Mobile navigation props
  navItems?: NavItem[];
  pathname?: string | null;
  onNavigate?: () => void;
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
  onProfile: _onProfile,
  navItems,
  pathname,
  onNavigate,
}: ProfileMenuProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  // Prevent hydration mismatch by only rendering user-specific content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading placeholder during SSR to prevent hydration mismatch
  // Use suppressHydrationWarning for Safari compatibility
  if (!mounted) {
    return (
      <div className="relative flex items-center" data-menu-container suppressHydrationWarning>
        <div className="w-8 h-8 rounded-full bg-muted/50" suppressHydrationWarning />
      </div>
    );
  }

  if (user) {
    // Use session data directly - it's refreshed when profile updates
    const firstName = user.firstName?.trim() ?? user.name?.split(' ')[0] ?? 'User';
    const lastName = user.lastName?.trim() ?? '';
    const avatarUrl = user.avatarUrl;
    const useGeneratedAvatar = user.useGeneratedAvatar ?? true;

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
        dashboards.push({ name: 'Staff Dashboard', path: '/staff-dashboard/work-listings' });
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
        <span className="text-subhead font-bold tracking-tight text-foreground hidden compact:inline">
          {firstName}
        </span>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleMenu(e);
          }}
          className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground"
          aria-label="Profile menu"
          data-menu-trigger
        >
          <UserAvatar
            src={avatarUrl}
            name={displayName}
            size="sm"
            className="hover:opacity-90 transition-opacity"
            useGeneratedAvatar={useGeneratedAvatar}
            loading="eager"
            fetchPriority="high"
          />
        </button>

        {showMenu && (
          <div 
            className="absolute right-0 top-full mt-2 w-52 large:w-52 bg-sidebar border border-sidebar-border rounded-lg shadow-lg z-50 overflow-hidden max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            data-menu-container
          >
            {/* Mobile Navigation - Only visible on mobile */}
            {navItems && navItems.length > 0 && (
              <div className="large:hidden py-1.5 border-b border-sidebar-border">
                {navItems.map((item) => (
                  <div key={item.label}>
                    {item.submenu && !item.hideSubmenu ? (
                      <>
                        <button
                          onClick={() => toggleExpanded(item.label)}
                          className={`w-full flex items-center justify-between px-3 py-2 text-subhead font-semibold tracking-tight transition-colors ${
                            pathname === item.href
                              ? "text-sidebar-foreground bg-sidebar-accent"
                              : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                          }`}
                        >
                          {item.label}
                          <ChevronDown 
                            className={`w-4 h-4 text-sidebar-foreground/50 transition-transform duration-200 ${
                              expandedItems.includes(item.label) ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        
                        {expandedItems.includes(item.label) && (
                          <div className="py-1 pl-4 space-y-0.5 bg-sidebar-accent/30">
                            {item.submenu.map((section) => (
                              <div key={section.title} className="py-1">
                                <div className="px-3 py-1 text-caption1 font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                                  {section.title}
                                </div>
                                {section.items.map((subItem) => (
                                  <Link
                                    key={subItem.href}
                                    href={subItem.href}
                                    onClick={() => {
                                      onNavigate?.();
                                      onToggleMenu();
                                    }}
                                    className="block px-3 py-1.5 text-subhead text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                                  >
                                    {subItem.label}
                                  </Link>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => {
                          onNavigate?.();
                          onToggleMenu();
                        }}
                        className={`block px-3 py-2 text-subhead font-semibold tracking-tight transition-colors ${
                          pathname === item.href
                            ? "text-sidebar-foreground bg-sidebar-accent"
                            : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                        }`}
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Menu Items */}
            <div className="py-1.5">
              {/* Dashboards Section */}
              {availableDashboards.map((dashboard, _index) => (
                <button
                  key={dashboard.path}
                  onClick={() => handleDashboardNavigation(dashboard.path)}
                  className="w-full text-left px-3 py-2 text-subhead font-semibold tracking-tight text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                >
                  {dashboard.name}
                </button>
              ))}
              
              {/* Divider */}
              <div className="my-1.5 mx-3 border-t border-sidebar-border" />
              
              {/* Quick Links */}
              <button
                onClick={() => {
                  router.push('/user-dashboard/listings/my-listings');
                  onToggleMenu();
                }}
                className="w-full text-left px-3 py-2 text-subhead font-semibold tracking-tight text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              >
                My Listings
              </button>
              <button
                onClick={() => {
                  router.push('/user-dashboard/bookings');
                  onToggleMenu();
                }}
                className="w-full text-left px-3 py-2 text-subhead font-semibold tracking-tight text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              >
                Bookings
              </button>
              
              {/* Divider */}
              <div className="my-1.5 mx-3 border-t border-sidebar-border" />
              
              {/* Account Actions */}
              <button
                onClick={() => {
                  router.push('/user-dashboard/profile');
                  onToggleMenu();
                }}
                className="w-full text-left px-3 py-2 text-subhead font-semibold tracking-tight text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              >
                Profile
              </button>
              <button
                onClick={() => {
                  router.push('/user-dashboard/settings');
                  onToggleMenu();
                }}
                className="w-full text-left px-3 py-2 text-subhead font-semibold tracking-tight text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              >
                Settings
              </button>
              
              {/* Divider */}
              <div className="my-1.5 mx-3 border-t border-sidebar-border" />
              
              {/* Sign Out */}
              <button
                onClick={onSignOut}
                className="w-full text-left px-3 py-2 text-subhead font-semibold tracking-tight text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2.5"
              >
                <LogOut size={16} strokeWidth={2} className="text-destructive" />
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
        className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground"
        aria-label="Profile menu"
        data-menu-trigger
      >
        <User size={16} />
      </button>

      {showMenu && (
        <div 
          className="absolute right-0 top-full mt-2 w-52 large:w-44 bg-sidebar border border-sidebar-border rounded-lg shadow-lg z-50 max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          data-menu-container
        >
          {/* Mobile Navigation - Only visible on mobile */}
          {navItems && navItems.length > 0 && (
            <div className="large:hidden py-1.5 border-b border-sidebar-border">
              {navItems.map((item) => (
                <div key={item.label}>
                  {item.submenu && !item.hideSubmenu ? (
                    <>
                      <button
                        onClick={() => toggleExpanded(item.label)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-subhead font-semibold tracking-tight transition-colors ${
                          pathname === item.href
                            ? "text-sidebar-foreground bg-sidebar-accent"
                            : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                        }`}
                      >
                        {item.label}
                        <ChevronDown 
                          className={`w-4 h-4 text-sidebar-foreground/50 transition-transform duration-200 ${
                            expandedItems.includes(item.label) ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      
                      {expandedItems.includes(item.label) && (
                        <div className="py-1 pl-4 space-y-0.5 bg-sidebar-accent/30">
                          {item.submenu.map((section) => (
                            <div key={section.title} className="py-1">
                              <div className="px-3 py-1 text-caption1 font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                                {section.title}
                              </div>
                              {section.items.map((subItem) => (
                                <Link
                                  key={subItem.href}
                                  href={subItem.href}
                                  onClick={() => {
                                    onNavigate?.();
                                    onToggleMenu();
                                  }}
                                  className="block px-3 py-1.5 text-subhead text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                                >
                                  {subItem.label}
                                </Link>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => {
                        onNavigate?.();
                        onToggleMenu();
                      }}
                      className={`block px-3 py-2 text-subhead font-semibold tracking-tight transition-colors ${
                        pathname === item.href
                          ? "text-sidebar-foreground bg-sidebar-accent"
                          : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                      }`}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="py-1.5">
            <button
              onClick={onSignIn}
              className="w-full text-left px-3 py-2 text-subhead font-semibold tracking-tight text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
              Sign in
            </button>
            <button
              onClick={onSignUp}
              className="w-full text-left px-3 py-2 text-subhead font-semibold tracking-tight text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
              Create account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
