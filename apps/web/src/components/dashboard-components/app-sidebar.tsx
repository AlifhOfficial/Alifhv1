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
} from "lucide-react";
import { useMemo, type ComponentType } from "react";
import { UserAvatar } from "@/components/ui/data-display/user-avatar";
import { BrandAvatar } from "@/components/partner/car-dealer/ui/brand-avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
  useSidebar,
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
};

// ============================================================================
// Component
// ============================================================================

export function AppSidebar({ user, items, sections, staffOverride }: AppSidebarProps) {
  const pathname = usePathname();

  // Convert flat items to sections if sections not provided
  const navSections: SidebarSection[] = useMemo(() => {
    if (sections && sections.length > 0) return sections;
    if (items && items.length > 0) return [{ items }];
    return [];
  }, [items, sections]);

  // Display name logic
  const displayName = useMemo(() => {
    if (staffOverride?.displayName) {
      return staffOverride.displayName;
    }
    if (user.firstName || user.lastName) {
      return [user.firstName, user.lastName].filter(Boolean).join(' ');
    }
    return user.name ?? 'User';
  }, [staffOverride?.displayName, user.firstName, user.lastName, user.name]);

  const initials = useMemo(() => {
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

  const isStaffMode = Boolean(staffOverride?.companyLogo);

  return (
    <Sidebar collapsible="icon">
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
                        <SidebarMenuButton tooltip={section.collapsible.label}>
                          {CollapsibleIcon && <CollapsibleIcon className="size-4" />}
                          <span>{section.collapsible.label}</span>
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
                                  <Link href={item.href}>
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
                <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
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
                        >
                          <Link href={item.href}>
                            {Icon && <Icon className="size-4" />}
                            <span>{item.label}</span>
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

      {/* Footer - User Profile */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="cursor-default hover:bg-transparent p-3">
              <div className="flex items-center gap-3 w-full">
                {isStaffMode ? (
                  <BrandAvatar
                    logoUrl={staffOverride?.companyLogo}
                    brandName={staffOverride?.companyName || 'Company'}
                    size="xs"
                  />
                ) : (
                  <UserAvatar
                    profileAvatar={user.avatarUrl}
                    oauthImage={user.image}
                    name={displayName}
                    size="sm"
                  />
                )}
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="truncate font-semibold text-sm">{displayName}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {isStaffMode ? staffOverride?.workEmail : user.email}
                  </span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {/* Rail for collapse/expand on hover */}
      <SidebarRail />
    </Sidebar>
  );
}
