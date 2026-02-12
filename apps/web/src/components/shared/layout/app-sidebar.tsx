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
  MessageCircle,
  Heart,
  ChevronDown,
  ChevronUp,
  Zap,
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
  X,
  Crown,
  CreditCard,
  Compass,
  Store,
  Phone,
} from "lucide-react";
import { useMemo, useState, useEffect, type ComponentType } from "react";
import { UserAvatar } from "@/components/ui/data-display/user-avatar";
import { BrandAvatar } from "@/components/partner/car-dealer/ui/brand-avatar";
import { useAuth } from "@/providers/auth-provider";
import { SupportModal } from "@/components/shared/support/support-modal";
import { handleSignOut } from '@/lib/auth/sign-out';
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
    useGeneratedAvatar?: boolean | null;
  };
  items?: SidebarItem[];
  sections?: SidebarSection[];
  staffOverride?: {
    displayName?: string | null;
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
  "message-circle": MessageCircle,
  "mail": Mail,
  "inbox": Inbox,
  "heart": Heart,
  "star": Star,
  "zap": Zap,
  "shield-check": ShieldCheck,
  "car": Car,
  "car-front": CarFront,
  "calendar": Calendar,
  "calendar-check": CalendarCheck,
  "briefcase": Briefcase,
  "life-buoy": LifeBuoy,
  "send": Send,
  "crown": Crown,
  "credit-card": CreditCard,
  "compass": Compass,
  "store": Store,
  "phone": Phone,
};

// ============================================================================
// Footer Content Component (uses useSidebar for collapse state)
// ============================================================================

interface SidebarFooterContentProps {
  isStaffMode: boolean;
  staffOverride?: {
    displayName?: string | null;
    companyLogo?: string | null;
    companyName?: string | null;
  };
  avatarUrl?: string | null;
  displayName: string;
  useGeneratedAvatar: boolean;
  showFooterMenu: boolean;
  setShowFooterMenu: (show: boolean) => void;
  setShowSupportModal: (show: boolean) => void;
  pathname: string;
}

function SidebarFooterContent({
  isStaffMode,
  staffOverride,
  avatarUrl,
  displayName,
  useGeneratedAvatar,
  showFooterMenu,
  setShowFooterMenu,
  setShowSupportModal,
  pathname,
}: SidebarFooterContentProps) {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="relative" data-footer-menu>
            <SidebarMenuButton 
              size="lg" 
              className="cursor-pointer"
              tooltip={displayName}
              onClick={(e) => {
                e.stopPropagation();
                setShowFooterMenu(!showFooterMenu);
              }}
            >
              {isCollapsed ? (
                // Collapsed: show only avatar
                <div className="shrink-0">
                  {isStaffMode ? (
                    <BrandAvatar
                      logoUrl={staffOverride?.companyLogo}
                      brandName={staffOverride?.companyName || 'Company'}
                      size="sm"
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
              ) : (
                // Expanded: show avatar + name
                <div className="flex items-center gap-3 w-full">
                  <div className="shrink-0">
                    {isStaffMode ? (
                      <BrandAvatar
                        logoUrl={staffOverride?.companyLogo}
                        brandName={staffOverride?.companyName || 'Company'}
                        size="md"
                      />
                    ) : (
                      <UserAvatar
                        src={avatarUrl}
                        name={displayName}
                        size="md"
                        useGeneratedAvatar={useGeneratedAvatar}
                      />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                    <span className="truncate font-bold text-sm tracking-tight">{displayName}</span>
                    {isStaffMode && (
                      <span className="truncate text-xs font-medium text-sidebar-foreground/70">
                        {staffOverride?.companyName}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </SidebarMenuButton>
            
            {/* Dropup Menu */}
            {showFooterMenu && (
              <div 
                className={`absolute bottom-full mb-2 bg-sidebar border border-sidebar-border rounded-lg shadow-lg z-50 overflow-hidden ${
                  isCollapsed ? 'left-0 w-48' : 'left-0 right-0'
                }`}
                onClick={(e) => e.stopPropagation()}
                data-footer-menu
              >
                <div className="py-1.5">
                  <Link
                    href="/"
                    onClick={() => setShowFooterMenu(false)}
                    className="w-full text-left px-3 py-2 text-[15px] font-semibold tracking-tight text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors block"
                  >
                    Home
                  </Link>
                  <Link
                    href="/listings"
                    onClick={() => setShowFooterMenu(false)}
                    className="w-full text-left px-3 py-2 text-[15px] font-semibold tracking-tight text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors block"
                  >
                    Listings
                  </Link>
                  
                  {/* Divider */}
                  <div className="my-1.5 mx-3 border-t border-sidebar-border" />
                  
                  <Link
                    href="/faq"
                    onClick={() => setShowFooterMenu(false)}
                    className="w-full text-left px-3 py-2 text-[15px] font-semibold tracking-tight text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors block"
                  >
                    Support
                  </Link>
                  <Link
                    href={pathname.startsWith('/partner-dashboard') ? '/partner-dashboard/feedback' : pathname.startsWith('/staff-dashboard') ? '/staff-dashboard/feedback' : '/user-dashboard/feedback'}
                    onClick={() => setShowFooterMenu(false)}
                    className="w-full text-left px-3 py-2 text-[15px] font-semibold tracking-tight text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors block"
                  >
                    Feedback
                  </Link>
                  
                  {/* Divider */}
                  <div className="my-1.5 mx-3 border-t border-sidebar-border" />
                  
                  <button
                    onClick={async () => {
                      setShowFooterMenu(false);
                      await handleSignOut();
                    }}
                    className="w-full text-left px-3 py-2 text-[15px] font-semibold tracking-tight text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}

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
  
  // Support modal state
  const [showSupportModal, setShowSupportModal] = useState(false);
  
  // Footer menu state
  const [showFooterMenu, setShowFooterMenu] = useState(false);
  
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  // Close footer menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (showFooterMenu && !target.closest('[data-footer-menu]')) {
        setShowFooterMenu(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showFooterMenu]);

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
    <>
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
                        <SidebarMenuButton tooltip={section.collapsible.label} className="font-semibold tracking-tight">
                          {CollapsibleIcon && <CollapsibleIcon className="size-4" />}
                          <span>{section.collapsible.label}</span>
                          <ChevronDown className="ml-auto size-4 transition-transform duration-200 group-data-[state=closed]/collapsible:-rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {section.items.map((item) => {
                            // Normalize paths by removing trailing slashes
                            const normalizedPathname = pathname.replace(/\/$/, '');
                            const normalizedHref = item.href.replace(/\/$/, '');
                            const isActive = normalizedPathname === normalizedHref;
                            
                            return (
                              <SidebarMenuSubItem key={item.label}>
                                <SidebarMenuSubButton asChild isActive={isActive} className="font-medium tracking-tight">
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
                <SidebarGroupLabel className="text-xs uppercase tracking-wider font-semibold text-sidebar-foreground/70">
                  {section.title}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => {
                    // Normalize paths by removing trailing slashes
                    const normalizedPathname = pathname.replace(/\/$/, '');
                    const normalizedHref = item.href.replace(/\/$/, '');
                    const isActive = normalizedPathname === normalizedHref;
                    const Icon = item.icon ? iconMap[item.icon] : undefined;
                    
                    return (
                      <SidebarMenuItem key={item.label}>
                        <SidebarMenuButton 
                          asChild 
                          isActive={isActive}
                          tooltip={item.label}
                          className="font-semibold tracking-tight"
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

      {/* Footer - User Profile with Dropup Menu */}
      <SidebarFooterContent 
        isStaffMode={isStaffMode}
        staffOverride={staffOverride}
        avatarUrl={avatarUrl}
        displayName={displayName}
        useGeneratedAvatar={useGeneratedAvatar}
        showFooterMenu={showFooterMenu}
        setShowFooterMenu={setShowFooterMenu}
        setShowSupportModal={setShowSupportModal}
        pathname={pathname}
      />

      {/* Rail for collapse/expand on hover */}
      <SidebarRail />
    </Sidebar>

    {/* Support Modal - Rendered outside sidebar to avoid z-index issues */}
    <SupportModal isOpen={showSupportModal} onClose={() => setShowSupportModal(false)} />
    </>
  );
}
