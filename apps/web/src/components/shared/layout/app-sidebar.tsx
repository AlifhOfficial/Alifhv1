/**
 * App Sidebar Component
 * Built on shadcn/ui sidebar - the source of truth for layout
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
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
  ChevronDown,
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
  Briefcase,
  LifeBuoy,
  Send,
} from "lucide-react";
import { useMemo, useState, useEffect, type ComponentType } from "react";
import { UserAvatar } from "@/components/ui/data-display/user-avatar";
import { BrandAvatar } from "@/components/partner/car-dealer/ui/brand-avatar";
import { useAuth } from "@/providers/auth-provider";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// ============================================================================
// Types
// ============================================================================

interface SidebarItem {
  label: string;
  href: string;
  isActive?: boolean;
  icon?: string;
}

interface CollapsibleConfig {
  label: string;
  icon: string;
}

interface SidebarSection {
  title?: string;
  collapsible?: CollapsibleConfig;
  items: SidebarItem[];
}

interface AppSidebarProps {
  user: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
    useGeneratedAvatar?: boolean | null;
  };
  items?: SidebarItem[];
  sections?: SidebarSection[];
  staffOverride?: {
    displayName?: string | null;
    workEmail?: string | null;
    companyLogo?: string | null;
    companyName?: string | null;
  };
}

// ============================================================================
// Icon Map
// ============================================================================

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
  "briefcase": Briefcase,
  "life-buoy": LifeBuoy,
  "send": Send,
};

// ============================================================================
// Component
// ============================================================================

export function AppSidebar({ user: initialUser, items, sections, staffOverride }: AppSidebarProps) {
  const pathname = usePathname();
  
  // Use client-side session for reactive updates
  const { session: clientUser } = useAuth();
  const user = clientUser || initialUser;
  
  // Track hydration state to prevent mismatch
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Convert flat items to sections if sections not provided
  const navSections: SidebarSection[] = useMemo(() => {
    if (sections && sections.length > 0) return sections;
    if (items && items.length > 0) return [{ items }];
    return [];
  }, [items, sections]);

  // Use session data directly - it's refreshed when profile updates
  const firstName = (user as any).firstName;
  const lastName = (user as any).lastName;
  const avatarUrl = (user as any).avatarUrl;
  const useGeneratedAvatar = (user as any).useGeneratedAvatar ?? true;

  // Display name logic
  const displayName = useMemo(() => {
    if (staffOverride?.displayName) {
      return staffOverride.displayName;
    }
    if (firstName || lastName) {
      return [firstName, lastName].filter(Boolean).join(' ');
    }
    return user.name ?? 'User';
  }, [staffOverride?.displayName, firstName, lastName, user.name]);

  const isStaffMode = Boolean(staffOverride?.companyLogo);

  return (
    <Sidebar collapsible="icon">
      {/* Header - User Profile */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="cursor-default hover:bg-transparent">
              <div className="flex items-center gap-3 w-full">
                <div className="shrink-0">
                  {isStaffMode ? (
                    <BrandAvatar
                      logoUrl={staffOverride?.companyLogo}
                      brandName={staffOverride?.companyName || 'Company'}
                      size="xs"
                    />
                  ) : (
                    <UserAvatar
                      src={avatarUrl}
                      name={displayName}
                      size="sm"
                      useGeneratedAvatar={useGeneratedAvatar}
                    />
                  )}
                </div>
                <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                  <span className="truncate font-semibold text-sm tracking-tight">{displayName}</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">
                    {isStaffMode ? staffOverride?.workEmail : user.email}
                  </span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent>
        {navSections.map((section, sectionIndex) => {
          const sectionKey = section.title || `section-${sectionIndex}`;
          
          // Section WITH collapsible config = collapsible menu item with sub-items
          if (section.collapsible) {
            const CollapsibleIcon = iconMap[section.collapsible.icon];
            
            return (
              <SidebarGroup key={sectionKey}>
                <SidebarMenu>
                  <Collapsible asChild defaultOpen className="group/collapsible">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={section.collapsible.label} className="font-medium">
                          {CollapsibleIcon && <CollapsibleIcon className="size-4" />}
                          <span className="tracking-tight">{section.collapsible.label}</span>
                          <ChevronDown className="ml-auto size-4 transition-transform duration-200 group-data-[state=closed]/collapsible:-rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {section.items.map((item) => {
                            const isActive = pathname === item.href;
                            
                            return (
                              <SidebarMenuSubItem key={item.label}>
                                <SidebarMenuSubButton asChild isActive={isActive}>
                                  <Link href={item.href} className="tracking-tight">
                                    <span>{item.label}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                </SidebarMenu>
              </SidebarGroup>
            );
          }
          
          // Section WITHOUT collapsible = simple group with direct links
          return (
            <SidebarGroup key={sectionKey}>
              {section.title && (
                <SidebarGroupLabel className="text-xs uppercase tracking-wider font-medium text-sidebar-foreground/70">
                  {section.title}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon ? iconMap[item.icon] : undefined;
                    
                    return (
                      <SidebarMenuItem key={item.label}>
                        <SidebarMenuButton 
                          asChild 
                          isActive={isActive}
                          tooltip={item.label}
                          className="font-medium"
                        >
                          <Link href={item.href}>
                            {Icon && <Icon className="size-4" />}
                            <span className="tracking-tight">{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      {/* Footer - Support & Feedback */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Support">
              <Link href="/support">
                <LifeBuoy className="size-4" />
                <span className="font-medium tracking-tight">Support</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Feedback">
              <Link href="/feedback">
                <Send className="size-4" />
                <span className="font-medium tracking-tight">Feedback</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {/* Rail for collapse/expand on hover */}
      <SidebarRail />
    </Sidebar>
  );
}
