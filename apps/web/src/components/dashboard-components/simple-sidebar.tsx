"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { signOut } from "@/lib/auth/client";
import { 
  ArrowLeft, 
  LogOut, 
  Moon, 
  Sun, 
  LayoutDashboard, 
  User,
  Users,
  Building2,
  Settings,
  FileText,
  BarChart3,
  Package,
  ShoppingCart,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import { Avatar } from "@/components/ui/data-display/avatar";
import { useProfile } from "@/hooks/profile";

interface SimpleSidebarProps {
  user: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  items: Array<{
    label: string;
    href: string;
    isActive?: boolean;
    icon?: string;
  }>;
}

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  "layout-dashboard": LayoutDashboard,
  "user": User,
  "users": Users,
  "building": Building2,
  "settings": Settings,
  "file-text": FileText,
  "bar-chart": BarChart3,
  "package": Package,
  "shopping-cart": ShoppingCart,
  "message-square": MessageSquare,
};

export function SimpleSidebar({ user, items }: SimpleSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = useMemo(() => {
    if (!mounted) return "light";
    return resolvedTheme ?? "light";
  }, [mounted, resolvedTheme]);

  const { profile } = useProfile({ fetchOnMount: true, userId: user.id ?? null });

  const displayName = useMemo(() => {
    if (profile?.firstName || profile?.lastName) {
      return [profile.firstName, profile.lastName].filter(Boolean).join(' ');
    }
    return user.name ?? 'User';
  }, [profile?.firstName, profile?.lastName, user.name]);

  const displayEmail = useMemo(() => {
    return user.email ?? '';
  }, [user.email]);

  const initials = useMemo(() => {
    if (profile?.firstName || profile?.lastName) {
      const first = profile.firstName?.charAt(0) ?? '';
      const last = profile.lastName?.charAt(0) ?? '';
      const combined = `${first}${last}`.trim();
      return combined.length > 0 ? combined.toUpperCase() : 'U';
    }

    if (user.name) {
      const letters = user.name
        .split(' ')
        .map((part) => part.trim().charAt(0))
        .filter(Boolean)
        .join('')
        .slice(0, 2);
      if (letters.length > 0) {
        return letters.toUpperCase();
      }
    }

    return 'U';
  }, [profile?.firstName, profile?.lastName, user.name]);

  const avatarSrc = useMemo(() => {
    return profile?.avatarUrl ?? user.image;
  }, [profile?.avatarUrl, user.image]);

  const toggleTheme = () => {
    setTheme(currentTheme === "dark" ? "light" : "dark");
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <aside className={`h-screen bg-muted/40 dark:bg-muted/30 border-r border-border/50 flex flex-col shrink-0 overflow-hidden backdrop-blur-xl transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-64'}`}>
      {/* Collapse Toggle Button */}
      <div className="flex items-center justify-end p-2 border-b border-border/50">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-md hover:bg-background/50 transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* User Profile Section */}
      <div className="flex items-center gap-3 p-4 border-b border-border/50">
        <Avatar
          src={avatarSrc}
          initials={initials}
          size="sm"
          className="border border-border/50 bg-background text-foreground"
        />
        {!isCollapsed && (
          <div className="min-w-0 text-left">
            <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{displayEmail}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon ? iconMap[item.icon] : undefined;
          return (
            <Link
              key={item.label}
              href={item.href}
              data-active={isActive ? "true" : undefined}
              className="group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm mb-1 transition-all duration-200 ease-in-out text-muted-foreground hover:text-foreground hover:bg-background/60 dark:hover:bg-background/50 data-[active=true]:bg-background/80 dark:data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-sm"
              title={isCollapsed ? item.label : undefined}
            >
              {Icon ? (
                <Icon className="h-4 w-4 shrink-0" />
              ) : (
                <span className="flex h-6 w-6 items-center justify-center rounded-md border border-border/50 text-xs font-medium text-foreground shrink-0">
                  {item.label.charAt(0)}
                </span>
              )}
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="space-y-1 border-t border-border/50 p-3">
        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-all duration-200 ease-in-out hover:bg-background/50"
          title={isCollapsed ? "Switch theme" : undefined}
        >
          {mounted ? (
            currentTheme === "dark" ? (
              <Sun className="h-4 w-4 text-muted-foreground shrink-0" />
            ) : (
              <Moon className="h-4 w-4 text-muted-foreground shrink-0" />
            )
          ) : (
            <span className="h-4 w-4 shrink-0" aria-hidden />
          )}
          {!isCollapsed && <span>Switch theme</span>}
        </button>
        
        <button
          onClick={() => router.push("/")}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-all duration-200 ease-in-out hover:bg-background/50"
          title={isCollapsed ? "Back to Alifh" : undefined}
        >
          <ArrowLeft className="h-4 w-4 text-muted-foreground shrink-0" />
          {!isCollapsed && <span>Back to Alifh</span>}
        </button>
        
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive transition-all duration-200 ease-in-out hover:bg-background/50"
          title={isCollapsed ? "Sign out" : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}