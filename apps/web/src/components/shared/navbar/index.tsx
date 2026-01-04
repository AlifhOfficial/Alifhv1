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
import { Moon, Sun, Menu, X } from "lucide-react";
import { MegaDropdown } from "./mega-dropdown";
import { MobileMenu } from "./mobile-menu";
import { ProfileMenu } from "./user-dropdown";
import { AuthManager, AuthModalType } from "@/components/auth";
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
          { label: "Ace Members", href: "/listings?blackTier=true" },
          { label: "New Arrivals", href: "/listings?sort=newest" },
        ],
      },
      {
        title: "Shop by Type",
        items: [
          { label: "Sedans", href: "/listings?bodyType=sedan" },
          { label: "SUVs", href: "/listings?bodyType=suv" },
          { label: "Trucks", href: "/listings?bodyType=truck" },
          { label: "Coupes", href: "/listings?bodyType=coupe" },
          { label: "Negotiable", href: "/listings?negotiable=true" },
        ],
      },
      {
        title: "More from Listings",
        items: [
          { label: "Under AED 50k", href: "/listings?priceMax=50000" },
          { label: "Under AED 100k", href: "/listings?priceMax=100000" },
          { label: "Low Mileage", href: "/listings?mileageMax=50000" },
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
  },
  {
    label: "About",
    href: "/about",
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
          { label: "Vehicle History", href: "/tools/history" },
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentAuthModal, setCurrentAuthModal] = useState<AuthModalType>(null);
  const [triggerEmailVerification, setTriggerEmailVerification] = useState(false);
  const [triggerGoogleOnboarding, setTriggerGoogleOnboarding] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasHandledVerifiedRef = useRef(false);
  const hasHandledGoogleRef = useRef(false);
  const hasHandledAuthParamRef = useRef(false);
  
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { user, isSignedIn: isAuthenticated, refetch: refetchAuth } = useUser();

  // Use external store for mounted state (no setState in effect)
  const mounted = useSyncExternalStore(
    mountedStore.subscribe.bind(mountedStore),
    mountedStore.getSnapshot,
    mountedStore.getServerSnapshot
  );

  const isDark = mounted && resolvedTheme === "dark";

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

  // Close menus on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowMobileMenu(false);
        setActiveDropdown(null);
        setShowProfileMenu(false);
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
    });
    
    return () => cancelAnimationFrame(rafId);
  }, [isAuthenticated, currentAuthModal]);

  // Detect verification redirect (?verified=true) and trigger welcome flow
  useEffect(() => {
    if (!searchParams) return;
    
    let rafId: number;
    
    // Handle email verification redirect
    if (searchParams.get("verified") === "true" && !hasHandledVerifiedRef.current) {
      hasHandledVerifiedRef.current = true;
      rafId = requestAnimationFrame(() => {
        setTriggerEmailVerification(true);
      });

      const params = new URLSearchParams(searchParams.toString());
      params.delete("verified");
      const queryString = params.toString();
      router.replace(`${pathname}${queryString ? `?${queryString}` : ""}`, { scroll: false });
      return () => cancelAnimationFrame(rafId);
    }

    // Handle Google OAuth redirect
    if (searchParams.get("google") === "new" && isAuthenticated && !hasHandledGoogleRef.current) {
      hasHandledGoogleRef.current = true;
      rafId = requestAnimationFrame(() => {
        setTriggerGoogleOnboarding(true);
      });

      const params = new URLSearchParams(searchParams.toString());
      params.delete("google");
      const queryString = params.toString();
      router.replace(`${pathname}${queryString ? `?${queryString}` : ""}`, { scroll: false });
      return () => cancelAnimationFrame(rafId);
    }

    // Handle auth modal triggers from error page (?auth=signin or ?auth=signup)
    const authParam = searchParams.get("auth");
    if ((authParam === "signin" || authParam === "signup") && !hasHandledAuthParamRef.current) {
      hasHandledAuthParamRef.current = true;
      rafId = requestAnimationFrame(() => {
        setCurrentAuthModal(authParam);
      });

      const params = new URLSearchParams(searchParams.toString());
      params.delete("auth");
      const queryString = params.toString();
      router.replace(`${pathname}${queryString ? `?${queryString}` : ""}`, { scroll: false });
      return () => cancelAnimationFrame(rafId);
    }
  }, [searchParams, pathname, router, isAuthenticated]);

  // Reset trigger after it fires so subsequent verifications can retrigger flow
  useEffect(() => {
    if (triggerEmailVerification) {
      // Reset the handled ref so future verifications can trigger
      hasHandledVerifiedRef.current = false;
      const timeoutId = window.setTimeout(() => {
        // Defer reset to the next tick so AuthManager can react to the change
        // This avoids races where the flag flips back before the effect runs
        requestAnimationFrame(() => setTriggerEmailVerification(false));
      }, 200);
      return () => window.clearTimeout(timeoutId);
    }
  }, [triggerEmailVerification]);

  useEffect(() => {
    if (triggerGoogleOnboarding) {
      hasHandledGoogleRef.current = false;
      const timeoutId = window.setTimeout(() => {
        requestAnimationFrame(() => setTriggerGoogleOnboarding(false));
      }, 0);
      return () => window.clearTimeout(timeoutId);
    }
  }, [triggerGoogleOnboarding]);

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
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/90 backdrop-blur-xl"
            : "bg-background/80 backdrop-blur-xl"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
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
                    className={`px-4 py-2 text-sm font-semibold tracking-tight transition-colors rounded-md block ${
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
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-md"
                aria-label="Toggle theme"
                suppressHydrationWarning
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

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
        triggerEmailVerification={triggerEmailVerification}
        triggerGoogleOnboarding={triggerGoogleOnboarding}
      />
    </>
  );
}