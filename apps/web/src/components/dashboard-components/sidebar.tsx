/**
 * Sidebar Component
 * Clean, minimal dashboard sidebar for Alifh
 * 
 * Colors:
 * - Background: muted/20 (soft neutral background with 20% opacity)
 * - Border: border/40 (subtle border with 40% opacity)
 * - Active item: background/90 (solid background for selected state)
 * - Text: foreground (primary text color)
 * - Secondary text: muted-foreground (dimmed text for subtitles)
 */

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { handleSignOut } from '@/lib/auth/sign-out';
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
  Heart,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import { Avatar } from "@/components/ui/data-display/avatar";
import { useUserProfile } from "@/hooks/profile";
import { useDrawer } from "./dashboard-layout-wrapper";

interface SidebarProps {
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
  "heart": Heart,
  "sparkles": Sparkles,
  "shield-check": ShieldCheck,
};

export function Sidebar({ user, items }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isOpen, setIsOpen } = useDrawer();

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const currentTheme = useMemo(() => {
    if (!mounted) return "light";
    return resolvedTheme ?? "light";
  }, [mounted, resolvedTheme]);

  const { profile } = useUserProfile();

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
    return profile?.avatarUrl ?? null;
  }, [profile?.avatarUrl]);

  const toggleTheme = () => {
    setTheme(currentTheme === "dark" ? "light" : "dark");
  };

  const onSignOut = async () => {
    await handleSignOut();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
      
      <aside className={`h-[100dvh] bg-background border-r border-border flex-col shrink-0 overflow-y-auto transition-all duration-300 ease-in-out
        md:h-screen md:bg-muted/20
        fixed md:relative z-50 md:z-auto left-0 top-0
        ${isCollapsed ? 'w-16' : 'w-64'}
        ${isOpen ? 'flex' : 'hidden md:flex'}
        shadow-2xl md:shadow-none
      `}>
      {/* Mobile Close Button */}
      <button
        onClick={() => setIsOpen(false)}
        className="md:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-colors"
        aria-label="Close menu"
      >
        <X className="h-5 w-5" />
      </button>
      
      {/* User Profile Section */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-border">
        <Avatar
          src={avatarSrc}
          initials={initials}
          size="sm"
          className="border border-border bg-background text-foreground shrink-0"
        />
        {!isCollapsed && (
          <div className="min-w-0 text-left">
            <p className="truncate text-sm font-semibold text-foreground tracking-tight">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground mt-0.5">{displayEmail}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon ? iconMap[item.icon] : undefined;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={handleLinkClick}
              data-active={isActive ? "true" : undefined}
              className="group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium mb-1 transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-muted/50 data-[active=true]:bg-muted data-[active=true]:text-foreground data-[active=true]:shadow-sm"
              title={isCollapsed ? item.label : undefined}
            >
              {Icon ? (
                <Icon className="h-4 w-4 shrink-0" />
              ) : (
                <span className="flex h-5 w-5 items-center justify-center rounded text-xs font-semibold text-foreground shrink-0">
                  {item.label.charAt(0)}
                </span>
              )}
              {!isCollapsed && <span className="tracking-tight">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-border p-3 pb-8 md:pb-3 space-y-1">
        {/* Collapse Toggle - Desktop Only */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:text-foreground hover:bg-muted/50"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 shrink-0" />
              <span className="tracking-tight">Collapse</span>
            </>
          )}
        </button>

        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:text-foreground hover:bg-muted/50"
          title={isCollapsed ? "Switch theme" : undefined}
        >
          {mounted ? (
            currentTheme === "dark" ? (
              <>
                <Sun className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span className="tracking-tight">Light mode</span>}
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span className="tracking-tight">Dark mode</span>}
              </>
            )
          ) : (
            <span className="h-4 w-4 shrink-0" aria-hidden />
          )}
        </button>
        
        <button
          onClick={() => router.push("/")}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:text-foreground hover:bg-muted/50"
          title={isCollapsed ? "Back to Alifh" : undefined}
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span className="tracking-tight">Back to Alifh</span>}
        </button>
        
        <button
          onClick={onSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-all hover:bg-destructive/10"
          title={isCollapsed ? "Sign out" : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span className="tracking-tight">Sign out</span>}
        </button>
      </div>
    </aside>
    </>
  );
}