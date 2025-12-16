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

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun, Menu, X, User } from "lucide-react";
import { MegaDropdown } from "./mega-dropdown";
import { MobileMenu } from "./mobile-menu";
import { ProfileMenu } from "./user-dropdown";
import { AuthManager, AuthModalType } from "@/components/auth";
import { useUser } from "@/hooks/auth/use-auth";
import { signOut } from "@/lib/auth/client";

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
        title: "Browse",
        items: [
          { label: "All Vehicles", href: "/listings", description: "View all listings" },
          { label: "New Arrivals", href: "/listings?sortBy=createdAt", description: "Latest additions" },
          { label: "Featured", href: "/listings?isFeatured=true", description: "Handpicked vehicles" },
        ],
      },
      {
        title: "Categories",
        items: [
          { label: "Luxury", href: "/listings?bodyType=luxury" },
          { label: "Sports", href: "/listings?bodyType=sports" },
          { label: "SUVs", href: "/listings?bodyType=suv" },
        ],
      },
    ],
  },
  {
    label: "Showcase",
    href: "/showcase",
  },
  {
    label: "Retailers",
    href: "/retailers",
    submenu: [
      {
        title: "Explore",
        items: [
          { label: "All Retailers", href: "/retailers", description: "Browse verified retailers" },
          { label: "Premium Retailers", href: "/retailers/premium", description: "Top-rated retailers" },
        ],
      },
      {
        title: "For Retailers",
        items: [
          { label: "Become a Retailer", href: "/retailers/join" },
          { label: "Retailer Portal", href: "/retailer" },
        ],
      },
    ],
  },
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Knowledge",
    href: "/knowledge",
  },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentAuthModal, setCurrentAuthModal] = useState<AuthModalType>(null);
  const [triggerEmailVerification, setTriggerEmailVerification] = useState(false);
  const [triggerGoogleOnboarding, setTriggerGoogleOnboarding] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { user, isLoading, isSignedIn: isAuthenticated } = useUser();

  // Fix hydration by using mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  // Memoize scroll handler - close all menus on scroll
  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 10);
    // Close all menus on scroll
    setActiveDropdown(null);
    setShowProfileMenu(false);
    setShowMobileMenu(false);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Don't close if clicking inside the menu or its trigger
      if (
        target.closest('[data-menu-container]') || 
        target.closest('[data-menu-trigger]')
      ) {
        return;
      }
      setActiveDropdown(null);
      setShowProfileMenu(false);
    };

    if (activeDropdown || showProfileMenu) {
      document.addEventListener("click", handleClickOutside, true);
      return () => document.removeEventListener("click", handleClickOutside, true);
    }
  }, [activeDropdown, showProfileMenu]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowMobileMenu(false);
        setActiveDropdown(null);
        setShowProfileMenu(false);
      }
    };

    if (showMobileMenu || activeDropdown || showProfileMenu) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showMobileMenu, activeDropdown, showProfileMenu]);

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
  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      setShowProfileMenu(false);
      // Optionally redirect to home page
      router.push("/");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  }, [router]);

  // Auth handlers
  const handleAuthClose = useCallback(() => {
    setCurrentAuthModal(null);
  }, []);

  // If user is authenticated, close any open auth modals
  useEffect(() => {
    const closableModals: AuthModalType[] = [
      "signin",
      "signup",
      "forgot-password",
      "magic-link",
      "email-sent",
      "feedback",
    ];

    if (isAuthenticated && currentAuthModal && closableModals.includes(currentAuthModal)) {
      setCurrentAuthModal(null);
    }
  }, [isAuthenticated, currentAuthModal]);

  // Detect verification redirect (?verified=true) and trigger welcome flow
  useEffect(() => {
    if (!searchParams) return;
    if (searchParams.get("verified") === "true") {
      setTriggerEmailVerification(true);

      const params = new URLSearchParams(searchParams.toString());
      params.delete("verified");
      const queryString = params.toString();
      router.replace(`${pathname}${queryString ? `?${queryString}` : ""}`, { scroll: false });
      return;
    }

    if (searchParams.get("google") === "new" && isAuthenticated) {
      setTriggerGoogleOnboarding(true);

      const params = new URLSearchParams(searchParams.toString());
      params.delete("google");
      const queryString = params.toString();
      router.replace(`${pathname}${queryString ? `?${queryString}` : ""}`, { scroll: false });
    }
  }, [searchParams, pathname, router, isAuthenticated]);

  // Reset trigger after it fires so subsequent verifications can retrigger flow
  useEffect(() => {
    if (triggerEmailVerification) {
      const timeoutId = window.setTimeout(() => {
        // Defer reset to the next tick so AuthManager can react to the change
        // This avoids races where the flag flips back before the effect runs
        setTriggerEmailVerification(false);
      }, 200);
      return () => window.clearTimeout(timeoutId);
    }
  }, [triggerEmailVerification]);

  useEffect(() => {
    if (triggerGoogleOnboarding) {
      const timeoutId = window.setTimeout(() => setTriggerGoogleOnboarding(false), 0);
      return () => window.clearTimeout(timeoutId);
    }
  }, [triggerGoogleOnboarding]);



  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/95 backdrop-blur-sm border-b border-border/40 shadow-sm"
            : "bg-background/95 backdrop-blur-sm"
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
                <div key={item.label} className="relative" data-menu-container>
                  {item.submenu ? (
                    <Link
                      href={item.href}
                      onMouseEnter={() => setActiveDropdown(item.label)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdown(item.label);
                      }}
                      className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg block ${
                        pathname === item.href
                          ? "text-foreground bg-muted/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <Link
                      href={item.href}
                      className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg block ${
                        pathname === item.href
                          ? "text-foreground bg-muted/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
                      }`}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/20 active:scale-95"
                aria-label="Toggle theme"
                suppressHydrationWarning
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Profile/Auth Actions */}
              <div data-menu-trigger>
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
                  onSignOut={handleSignOut}
                  onProfile={() => {
                    setShowProfileMenu(false);
                    router.push("/profile");
                  }}
                />
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMobileMenu(!showMobileMenu);
                }}
                className="lg:hidden p-2.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/20 active:scale-95"
                aria-label="Menu"
              >
                {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Blur Overlay */}
      {activeDropdown && (
        <div 
          className="fixed inset-0 bg-background/40 backdrop-blur-sm z-30"
          onClick={() => setActiveDropdown(null)}
        />
      )}

      {/* Mega Dropdown */}
      <MegaDropdown
        activeDropdown={activeDropdown}
        navItems={navItems}
        onClose={() => setActiveDropdown(null)}
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
              handleSignOut();
            }}
          />
      )}

      {/* Auth Modals */}
      <AuthManager
        currentModal={currentAuthModal}
        onModalChange={setCurrentAuthModal}
        triggerEmailVerification={triggerEmailVerification}
        triggerGoogleOnboarding={triggerGoogleOnboarding}
      />
    </>
  );
}