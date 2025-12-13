/**
 * Dashboard Layout Components
 * Clean, minimal layouts for all dashboard types
 */

"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { 
  Home, 
  LayoutDashboard, 
  Store, 
  Users,
  LogOut,
  ArrowLeft,
  Sun,
  Moon
} from "lucide-react";
import { useTheme } from "next-themes";

interface DashboardLayoutProps {
  children: ReactNode;
  user: {
    name: string;
    email: string;
    image?: string;
    role?: string;
  };
  activeTab?: string;
}

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  id: string;
}

function DashboardSidebar({ 
  navItems, 
  activeTab, 
  user, 
  onSignOut 
}: { 
  navItems: NavItem[];
  activeTab?: string;
  user: DashboardLayoutProps["user"];
  onSignOut: () => void;
}) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const getInitials = () => {
    return user.name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="w-64 h-screen bg-card border-r border-border/40 flex flex-col">
      {/* Header - User Info */}
      <div className="p-4 border-b border-border/20">
        <div className="flex items-center gap-3">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="w-10 h-10 rounded-full border border-border/40"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-border/40 flex items-center justify-center text-primary text-xs font-medium">
              {getInitials()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
              className={`
                w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2
                ${isActive 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-foreground hover:bg-muted/20'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-3 border-t border-border/20 space-y-1">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-full text-left px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted/20 transition-colors flex items-center gap-2"
        >
          {/* Suppress hydration warning by not rendering icon on server */}
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-muted-foreground" suppressHydrationWarning />
          ) : (
            <Moon className="w-4 h-4 text-muted-foreground" suppressHydrationWarning />
          )}
          <span>Theme</span>
        </button>

        {/* Back to Alifh */}
        <button
          onClick={() => router.push('/')}
          className="w-full text-left px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted/20 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          <span>Back to Alifh</span>
        </button>

        {/* Sign Out */}
        <button
          onClick={onSignOut}
          className="w-full text-left px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );
}

// Standard Layout (User, Admin, Staff)
export function StandardDashboardLayout({ 
  children, 
  user, 
  activeTab 
}: DashboardLayoutProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    // Import authClient dynamically to avoid client/server issues
    const { authClient } = await import("@/lib/auth/client");
    await authClient.signOut();
    router.push('/');
  };

  const navItems: NavItem[] = [
    { label: 'Overview', icon: LayoutDashboard, href: '#overview', id: 'overview' },
    { label: 'Activity', icon: Home, href: '#activity', id: 'activity' },
  ];

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar 
        navItems={navItems} 
        activeTab={activeTab} 
        user={user}
        onSignOut={handleSignOut}
      />
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

// Partner Layout (with right panel)
export function PartnerDashboardLayout({ 
  children, 
  user, 
  activeTab,
  rightPanel
}: DashboardLayoutProps & { rightPanel?: ReactNode }) {
  const router = useRouter();

  const handleSignOut = async () => {
    const { authClient } = await import("@/lib/auth/client");
    await authClient.signOut();
    router.push('/');
  };

  const navItems: NavItem[] = [
    { label: 'Overview', icon: Store, href: '#overview', id: 'overview' },
    { label: 'Listings', icon: LayoutDashboard, href: '#listings', id: 'listings' },
    { label: 'Analytics', icon: Home, href: '#analytics', id: 'analytics' },
  ];

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar 
        navItems={navItems} 
        activeTab={activeTab} 
        user={user}
        onSignOut={handleSignOut}
      />
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>

      {/* Right Panel (Partner Only) */}
      {rightPanel && (
        <aside className="w-80 h-screen bg-card border-l border-border/40 overflow-auto">
          <div className="p-6">
            {rightPanel}
          </div>
        </aside>
      )}
    </div>
  );
}

// Staff Dashboard Layout (for dealer staff)
export function StaffDashboardLayout({ children, user, activeTab, rightPanel }: DashboardLayoutProps & { rightPanel?: ReactNode }) {
  const router = useRouter();

  const handleSignOut = async () => {
    const { authClient } = await import("@/lib/auth/client");
    await authClient.signOut();
    router.push('/');
  };

  const navItems: NavItem[] = [
    { label: 'Overview', icon: LayoutDashboard, href: '#overview', id: 'overview' },
    { label: 'My Listings', icon: Store, href: '#listings', id: 'listings' },
    { label: 'My Leads', icon: Users, href: '#leads', id: 'leads' },
    { label: 'Inventory', icon: Home, href: '#inventory', id: 'inventory' },
  ];

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar 
        navItems={navItems} 
        activeTab={activeTab} 
        user={user}
        onSignOut={handleSignOut}
      />
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>

      {/* Right Panel */}
      {rightPanel && (
        <aside className="w-80 h-screen bg-card border-l border-border/40 overflow-auto">
          <div className="p-6">
            {rightPanel}
          </div>
        </aside>
      )}
    </div>
  );
}
