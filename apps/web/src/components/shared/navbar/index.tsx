/**
 * Navbar Component - Alifh Presentation Layer
 * Clean, minimal navigation for Alifh vehicle marketplace
 * 
 * Features:
 * - Responsive design
 * - Theme toggle
 * - Authentication modals
 * - Clean Alifh branding
 */

"use client";

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Menu, X, CheckCircle2 } from "lucide-react";
import { MegaDropdown } from "./mega-dropdown";
import { MobileMenu } from "./mobile-menu";
import { ProfileMenu } from "./user-dropdown";
import { NavbarMessaging } from "./navbar-messaging";
import { NavbarFavorites } from "./navbar-favorites";
import { AuthManager, AuthModalType } from "@/components/auth";
import { useFloatingChatSafe } from "@/components/messaging/floating-chat-manager";
import { useUser } from "@/hooks/auth/use-auth";
import { handleSignOut } from "@/lib/auth/sign-out";

interface NavItem {
  label: string;
  href: string;
  submenu?: {
    title: string;
    items: { label: string; href: string; description?: string }[];
  }[];
}

const navItems: NavItem[] = [
  {
    label: "Listings",
    href: "/listings",
    submenu: [
      {
        title: "Explore Listings",
        items: [
          { label: "All Vehicles", href: "/listings" },
          { label: "Black Collection", href: "/listings?black=true" },
          { label: "Black Members", href: "/listings?blackTier=true" },
          { label: "New Arrivals", href: "/listings?sort=newest" },
        ],
      },
      {
        title: "Shop by Type",
        items: [
          { label: "Sedans", href: "/listings?bodyType=sedan" },
          { label: "SUVs", href: "/listings?bodyType=suv" },
          { label: "Coupes", href: "/listings?bodyType=coupe" },
        ],
      },
      {
        title: "More from Listings",
        items: [
          { label: "Under AED 50k", href: "/listings?priceMax=50000" },
          { label: "Under AED 100k", href: "/listings?priceMax=100000" },
          { label: "Low Mileage", href: "/listings?mileageMax=50000" },
          { label: "Negotiable", href: "/listings?negotiable=true" },

        ],
      },
    ],
  },
  {
    label: "Black",
    href: "/black",
  },
  {
    label: "Partners",
    href: "/partner",
    submenu: [
      {
        title: "For Dealers",
        items: [
          { label: "Partner with Alifh", href: "/partner" },
          { label: "Pricing", href: "/pricing" },
        ],
      },
    ],
  },
  {
    label: "About",
    href: "/about",
    submenu: [
      {
        title: "Company",
        items: [
          { label: "About Alifh", href: "/about" },
          { label: "How Ranking Works", href: "/how-ranking-works" },
          { label: "Badges", href: "/badges" },
        ],
      },
    ],
  },
  {
    label: "Car Tools",
    href: "/tools",
    submenu: [
      {
        title: "Tools",
        items: [
          { label: "VIN Decoder", href: "/tools/vin-decoder" },
          { label: "Compare Cars", href: "/tools/compare" },
          { label: "Car Valuation", href: "/tools/valuation" },
        ],
      },
      {
        title: "Resources",
        items: [
          { label: "All Tools", href: "/tools" },
          { label: "Knowledge Hub", href: "/knowledge/akh" },
        ],
      },
    ],
  },
  {
    label: "Knowledge",
    href: "/knowledge/akh",
    submenu: [
      {
        title: "Learn",
        items: [
          { label: "About AKH", href: "/knowledge/akh" },
          { label: "Getting Started", href: "/knowledge/basics" },
          { label: "Buying & Selling", href: "/knowledge/buying" },
          { label: "Legal & Finance", href: "/knowledge/legal" },
          { label: "Maintenance", href: "/knowledge/maintenance" },
        ],
      },
      {
        title: "Guides",
        items: [
          { label: "VIN Guide", href: "/knowledge/basics/vin-guide" },
        ],
      },
    ],
  },
  {
    label: "Help",
    href: "/faq",
  },
];

// External store for mounted state (avoids setState in effect)
const mountedStore = {
  value: false,
  listeners: new Set<() => void>(),
  subscribe(callback: () => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  },
  getSnapshot() {
    return mountedStore.value;
  },
  getServerSnapshot() {
    return false;
  },
};

// Mark as mounted on client (runs once at module load)
if (typeof window !== 'undefined') {
  mountedStore.value = true;
}

export function Navbar() {
  const [_isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [currentAuthModal, setCurrentAuthModal] = useState<AuthModalType>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasHandledAuthParamRef = useRef(false);
  const pendingRedirectRef = useRef<string | null>(null);
  
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { user, isSignedIn: isAuthenticated, refetch: refetchAuth } = useUser();
  const { openChat } = useFloatingChatSafe();

  // Use external store for mounted state (no setState in effect)
  const mounted = useSyncExternalStore(
    mountedStore.subscribe.bind(mountedStore),
    mountedStore.getSnapshot,
    mountedStore.getServerSnapshot
  );

  const isDark = mounted && (resolvedTheme === "dark" || resolvedTheme === "charcoal");

  // Scroll handler - just track scroll state
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close profile menu when clicking outside
  useEffect(() => {
    if (!showProfileMenu) return;
    
    const handleClick = () => setShowProfileMenu(false);
    setTimeout(() => document.addEventListener("click", handleClick), 0);
    return () => document.removeEventListener("click", handleClick);
  }, [showProfileMenu]);

  // Close theme menu when clicking outside
  useEffect(() => {
    if (!showThemeMenu) return;
    
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-theme-menu-container]')) {
        setShowThemeMenu(false);
      }
    };
    setTimeout(() => document.addEventListener("click", handleClick), 0);
    return () => document.removeEventListener("click", handleClick);
  }, [showThemeMenu]);

  // Close menus on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowMobileMenu(false);
        setActiveDropdown(null);
        setShowProfileMenu(false);
        setShowThemeMenu(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [showMobileMenu]);

  // Auth handlers
  const onSignOut = useCallback(async () => {
    setShowProfileMenu(false);
    await handleSignOut();
  }, []);

  // Close auth modal when user becomes authenticated (using rAF to avoid sync setState in effect)
  useEffect(() => {
    const closableModals: AuthModalType[] = [
      "signin",
      "signup",
      "forgot-password",
      "magic-link",
      "email-sent",
      "feedback",
    ];
    
    if (!isAuthenticated || !currentAuthModal || !closableModals.includes(currentAuthModal)) {
      return;
    }
    
    // Use requestAnimationFrame to defer the state update
    const rafId = requestAnimationFrame(() => {
      setCurrentAuthModal(null);
      
      // Handle pending redirect after successful auth
      if (pendingRedirectRef.current) {
        const redirectTo = pendingRedirectRef.current;
        pendingRedirectRef.current = null;
        router.push(redirectTo);
      }
    });
    
    return () => cancelAnimationFrame(rafId);
  }, [isAuthenticated, currentAuthModal, router]);

  // Detect verification redirect (?verified=true) and trigger welcome flow
  useEffect(() => {
    if (!searchParams) return;
    
    let rafId: number;

    // Handle auth modal triggers from error page (?auth=signin or ?auth=signup)
    const authParam = searchParams.get("auth");
    const redirectParam = searchParams.get("redirect");
    
    // Reset the ref when there's no auth param (allows re-triggering on new navigations)
    if (!authParam) {
      hasHandledAuthParamRef.current = false;
    }
    
    if ((authParam === "signin" || authParam === "signup") && !hasHandledAuthParamRef.current) {
      hasHandledAuthParamRef.current = true;
      
      // Store redirect for after auth success
      if (redirectParam) {
        pendingRedirectRef.current = redirectParam;
      }
      
      rafId = requestAnimationFrame(() => {
        setCurrentAuthModal(authParam);
      });

      const params = new URLSearchParams(searchParams.toString());
      params.delete("auth");
      params.delete("redirect");
      const queryString = params.toString();
      router.replace(`${pathname}${queryString ? `?${queryString}` : ""}`, { scroll: false });
      return () => cancelAnimationFrame(rafId);
    }
  }, [searchParams, pathname, router]);

  // Handle dropdown close with delay
  const handleDropdownClose = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  }, []);

  const handleDropdownOpen = useCallback((label: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    setActiveDropdown(label);
  }, []);

  const cancelDropdownClose = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background">
        <div className="flex items-center justify-between h-14 sm:h-16 max-w-[1600px] mx-auto px-4 sm:px-6">
            {/* Logo */}
            <Link href="/" className="flex items-center z-50 mr-8">
              <Image
                src={isDark ? "/assets/Alifh_logo_White.svg" : "/assets/Alifh_logo_Black.svg"}
                alt="ALIFH"
                width={100}
                height={30}
                className="h-7 w-auto"
                priority
                unoptimized
                suppressHydrationWarning
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1 flex-1">
              {navItems.map((item) => (
                <div 
                  key={item.label}
                  onMouseEnter={() => item.submenu && handleDropdownOpen(item.label)}
                  onMouseLeave={() => item.submenu && handleDropdownClose()}
                >
                  <Link
                    href={item.href}
                    className={`px-4 py-2 text-[15px] font-semibold tracking-tight transition-colors rounded-md block ${
                      pathname === item.href
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                </div>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Messaging - Only show when authenticated and mounted (prevents hydration mismatch) */}
              {mounted && isAuthenticated && user?.id && (
                <NavbarMessaging userId={user.id} onOpenChat={openChat} />
              )}

              {/* Favorites - Only show when authenticated and mounted (prevents hydration mismatch) */}
              {mounted && isAuthenticated && user?.id && (
                <NavbarFavorites userId={user.id} />
              )}

              {/* Theme Toggle */}
              <div className="relative" data-theme-menu-container>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowThemeMenu(!showThemeMenu);
                  }}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md"
                  aria-label="Theme menu"
                  suppressHydrationWarning
                >
                  <Moon className="size-4" />
                </button>

                {showThemeMenu && (
                  <div 
                    className="absolute right-0 top-full mt-2 w-32 bg-sidebar border border-sidebar-border rounded-lg shadow-lg z-50 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="py-1.5">
                      {[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }, { value: 'charcoal', label: 'Charcoal' }].map((themeOption) => (
                        <button
                          key={themeOption.value}
                          onClick={() => {
                            setTheme(themeOption.value);
                            setShowThemeMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 text-[14px] font-medium tracking-tight text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors flex items-center justify-between"
                        >
                          <span>{themeOption.label}</span>
                          {theme === themeOption.value && (
                            <CheckCircle2 className="size-3.5" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile/Auth Actions */}
              <ProfileMenu
                user={user}
                showMenu={showProfileMenu}
                onToggleMenu={(e) => {
                  e?.stopPropagation();
                  setShowProfileMenu(!showProfileMenu);
                }}
                onSignIn={() => {
                  setShowProfileMenu(false);
                  setCurrentAuthModal("signin");
                }}
                onSignUp={() => {
                  setShowProfileMenu(false);
                  setCurrentAuthModal("signup");
                }}
                onSignOut={onSignOut}
                onProfile={() => {
                  setShowProfileMenu(false);
                  router.push("/profile");
                }}
              />

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/20 active:scale-95"
                aria-label="Menu"
              >
                {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
      </nav>

      {/* Mega Dropdown */}
      <MegaDropdown
        activeDropdown={activeDropdown}
        navItems={navItems}
        onClose={() => setActiveDropdown(null)}
        onMouseEnter={cancelDropdownClose}
        onMouseLeave={handleDropdownClose}
      />

      {/* Mobile Menu */}
      {showMobileMenu && (
        <MobileMenu
            navItems={navItems}
            pathname={pathname}
            onNavigate={() => setShowMobileMenu(false)}
            onSignIn={() => {
              setShowMobileMenu(false);
              setCurrentAuthModal("signin");
            }}
            onSignUp={() => {
              setShowMobileMenu(false);
              setCurrentAuthModal("signup");
            }}
            user={user}
            onProfile={() => {
              setShowMobileMenu(false);
              router.push("/profile");
            }}
            onSignOut={() => {
              setShowMobileMenu(false);
              onSignOut();
            }}
          />
      )}

      {/* Auth Modals */}
      <AuthManager
        currentModal={currentAuthModal}
        onModalChange={setCurrentAuthModal}
        onSuccess={() => refetchAuth()}
      />
    </>
  );
}