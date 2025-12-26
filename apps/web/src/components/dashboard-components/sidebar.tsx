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
  Settings2,
  FileText,
  BarChart3,
  Package,
  ShoppingCart,
  MessageSquare,
  Heart,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Sparkles,
  ShieldCheck,
  Car,
  CarFront,
  Calendar,
  CalendarCheck,
  Mail,
  Inbox,
  Star,
  CircleUser,
  Home,
} from "lucide-react";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import { UserAvatar } from "@/components/ui/data-display/user-avatar";
import { BrandAvatar } from "@/components/partner/car-dealer/ui/brand-avatar";
import { useDrawer } from "./dashboard-layout";

interface SidebarItem {
  label: string;
  href: string;
  isActive?: boolean;
  icon?: string;
}

interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}

interface SidebarProps {
  user: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    firstName?: string | null;  // From session (profile data)
    lastName?: string | null;   // From session (profile data)
    avatarUrl?: string | null;  // From session (signed URL)
  };
  /** Flat items list (legacy) or sections for grouped navigation */
  items?: SidebarItem[];
  sections?: SidebarSection[];
  /** Staff override data - when present, uses work identity instead of personal */
  staffOverride?: {
    displayName?: string | null;
    workEmail?: string | null;
    companyLogo?: string | null;
    companyName?: string | null;
  };
}

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  "layout-dashboard": LayoutDashboard,
  "home": Home,
  "user": User,
  "circle-user": CircleUser,
  "users": Users,
  "building": Building2,
  "settings": Settings,
  "settings-2": Settings2,
  "file-text": FileText,
  "bar-chart": BarChart3,
  "package": Package,
  "shopping-cart": ShoppingCart,
  "message-square": MessageSquare,
  "mail": Mail,
  "inbox": Inbox,
  "heart": Heart,
  "star": Star,
  "sparkles": Sparkles,
  "shield-check": ShieldCheck,
  "car": Car,
  "car-front": CarFront,
  "calendar": Calendar,
  "calendar-check": CalendarCheck,
};

export function Sidebar({ user, items, sections, staffOverride }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const { isOpen, setIsOpen } = useDrawer();

  // Toggle section collapse
  const toggleSection = (sectionTitle: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionTitle)) {
        next.delete(sectionTitle);
      } else {
        next.add(sectionTitle);
      }
      return next;
    });
  };

  // Convert flat items to sections if sections not provided
  const navSections: SidebarSection[] = useMemo(() => {
    if (sections && sections.length > 0) return sections;
    if (items && items.length > 0) return [{ items }];
    return [];
  }, [items, sections]);

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

  // Use session data directly - no client-side fetch needed
  const displayName = useMemo(() => {
    // Staff override takes priority (work identity)
    if (staffOverride?.displayName) {
      return staffOverride.displayName;
    }
    // Fall back to user profile name from session
    if (user.firstName || user.lastName) {
      return [user.firstName, user.lastName].filter(Boolean).join(' ');
    }
    return user.name ?? 'User';
  }, [staffOverride?.displayName, user.firstName, user.lastName, user.name]);

  const displayEmail = useMemo(() => {
    // Staff override takes priority (work email)
    if (staffOverride?.workEmail) {
      return staffOverride.workEmail;
    }
    return user.email ?? '';
  }, [staffOverride?.workEmail, user.email]);

  const initials = useMemo(() => {
    // If staff override with company name, use company initials
    if (staffOverride?.companyName) {
      const letters = staffOverride.companyName
        .split(' ')
        .map((part) => part.trim().charAt(0))
        .filter(Boolean)
        .join('')
        .slice(0, 2);
      if (letters.length > 0) {
        return letters.toUpperCase();
      }
    }
    
    if (user.firstName || user.lastName) {
      const first = user.firstName?.charAt(0) ?? '';
      const last = user.lastName?.charAt(0) ?? '';
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
  }, [staffOverride?.companyName, user.firstName, user.lastName, user.name]);

  // Determine if we're showing staff/company mode or personal mode
  const isStaffMode = Boolean(staffOverride?.companyLogo);

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
      
      <aside className={`h-[100dvh] bg-background border-r border-border/40 flex-col shrink-0 overflow-y-auto transition-all duration-300 ease-in-out
        md:h-screen md:bg-card dark:md:bg-muted/10
        fixed md:relative z-50 md:z-auto left-0 top-0
        ${isCollapsed ? 'w-16' : 'w-64'}
        ${isOpen ? 'flex' : 'hidden md:flex'}
        shadow-2xl md:shadow-none
      `}>
      {/* Mobile Close Button */}
      <button
        onClick={() => setIsOpen(false)}
        className="md:hidden absolute top-4 right-4 p-2 rounded-xl hover:bg-muted/50 transition-colors duration-200"
        aria-label="Close menu"
      >
        <X className="h-5 w-5 text-muted-foreground" />
      </button>
      
      {/* User Profile Section */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border/40">
        {isStaffMode ? (
          <BrandAvatar
            logoUrl={staffOverride?.companyLogo}
            brandName={staffOverride?.companyName || 'Company'}
            size="xs"
            className="border border-border/30 bg-muted/30 shrink-0"
          />
        ) : (
          <UserAvatar
            profileAvatar={user.avatarUrl}
            oauthImage={user.image}
            name={displayName}
            size="sm"
            className="border border-border/30 bg-muted/30 text-foreground shrink-0"
          />
        )}
        {!isCollapsed && (
          <div className="min-w-0 text-left flex-1">
            <p className="truncate text-sm font-semibold text-foreground tracking-tight">{displayName}</p>
            <p className="truncate text-[11px] text-muted-foreground/70 mt-0.5">{displayEmail}</p>
          </div>
        )}
      </div>

      {/* Navigation with Sections */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navSections.map((section, sectionIndex) => {
          const sectionKey = section.title || `section-${sectionIndex}`;
          const isSectionCollapsed = section.title ? collapsedSections.has(section.title) : false;
          const firstItemIcon = section.items[0]?.icon ? iconMap[section.items[0].icon] : undefined;
          
          return (
            <div key={sectionKey}>
              {/* Section Header - clickable to collapse */}
              {section.title ? (
                <button
                  onClick={() => toggleSection(section.title!)}
                  className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all duration-200 hover:bg-muted/40 ${
                    isCollapsed ? 'justify-center' : ''
                  }`}
                >
                  {isCollapsed ? (
                    // Show first item's icon when sidebar collapsed
                    firstItemIcon ? (
                      <span className="text-muted-foreground/70">
                        {(() => { const Icon = firstItemIcon; return <Icon className="h-4 w-4" />; })()}
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-muted-foreground/70 uppercase">
                        {section.title.charAt(0)}
                      </span>
                    )
                  ) : (
                    <>
                      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
                        {section.title}
                      </span>
                      <ChevronDown 
                        className={`h-3.5 w-3.5 text-muted-foreground/50 transition-transform duration-200 ${
                          isSectionCollapsed ? '-rotate-90' : ''
                        }`} 
                      />
                    </>
                  )}
                </button>
              ) : null}
              
              {/* Section Items */}
              {(!section.title || (!isSectionCollapsed && !isCollapsed)) && (
                <div className="space-y-0.5 mt-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon ? iconMap[item.icon] : undefined;
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={handleLinkClick}
                        data-active={isActive ? "true" : undefined}
                        className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-muted/50 data-[active=true]:bg-muted/60 data-[active=true]:text-foreground ${
                          isCollapsed ? 'justify-center px-2' : ''
                        }`}
                        title={isCollapsed ? item.label : undefined}
                      >
                        {Icon ? (
                          <Icon className="h-4 w-4 shrink-0" />
                        ) : (
                          <span className="flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-semibold bg-muted/40 text-foreground shrink-0">
                            {item.label.charAt(0)}
                          </span>
                        )}
                        {!isCollapsed && <span className="tracking-tight">{item.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className={`border-t border-border/40 p-3 pb-8 md:pb-3 ${
        isCollapsed ? 'flex flex-col items-center gap-1' : 'flex items-center justify-between'
      }`}>
        {/* Action icons */}
        <div className={`flex items-center ${isCollapsed ? 'flex-col gap-1' : 'gap-1'}`}>
          <button
            onClick={() => router.push("/")}
            className="flex items-center justify-center rounded-lg p-2 text-muted-foreground/70 transition-all duration-200 hover:text-foreground hover:bg-muted/50"
            title="Home"
          >
            <Home className="h-4 w-4" />
          </button>
          
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center rounded-lg p-2 text-muted-foreground/70 transition-all duration-200 hover:text-foreground hover:bg-muted/50"
            title={mounted ? (currentTheme === "dark" ? "Light mode" : "Dark mode") : "Toggle theme"}
          >
            {mounted ? (
              currentTheme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )
            ) : (
              <span className="h-4 w-4" aria-hidden />
            )}
          </button>

          <button
            onClick={onSignOut}
            className="flex items-center justify-center rounded-lg p-2 text-rose-500/70 transition-all duration-200 hover:text-rose-500 hover:bg-rose-500/10"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        {/* Collapse Toggle - Desktop Only */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`hidden md:flex items-center justify-center rounded-lg p-2 text-muted-foreground/70 transition-all duration-200 hover:text-foreground hover:bg-muted/50 ${
            isCollapsed ? 'mt-2' : ''
          }`}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
    </>
  );
}