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
import { usePathname, useRouter } from "next/navigation";
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
    label: "Inventory",
    href: "/inventory",
    submenu: [
      {
        title: "Browse",
        items: [
          { label: "All Vehicles", href: "/inventory", description: "View all listings" },
          { label: "New Arrivals", href: "/inventory/new", description: "Latest additions" },
          { label: "Featured", href: "/inventory/featured", description: "Handpicked vehicles" },
        ],
      },
      {
        title: "Categories",
        items: [
          { label: "Luxury", href: "/inventory/luxury" },
          { label: "Sports", href: "/inventory/sports" },
          { label: "SUVs", href: "/inventory/suvs" },
        ],
      },
    ],
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
  const [mounted, setMounted] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { user, isLoading, isSignedIn: isAuthenticated } = useUser();

  // Fix hydration by using mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  // Memoize scroll handler
  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 10);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null);
      setShowProfileMenu(false);
    };

    if (activeDropdown || showProfileMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [activeDropdown, showProfileMenu]);

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
    if (isAuthenticated && currentAuthModal) {
      setCurrentAuthModal(null);
    }
  }, [isAuthenticated, currentAuthModal]);



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
          <div className="flex items-center justify-between h-16">
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
                <div key={item.label} className="relative">
                  {item.submenu ? (
                    <button
                      onMouseEnter={() => setActiveDropdown(item.label)}
                      className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                        pathname === item.href
                          ? "text-foreground bg-muted/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
                      }`}
                    >
                      {item.label}
                    </button>
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
                className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/20"
                aria-label="Toggle theme"
                suppressHydrationWarning
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Profile/Auth Actions */}
              <ProfileMenu
                user={user}
                showMenu={showProfileMenu}
                onToggleMenu={() => setShowProfileMenu(!showProfileMenu)}
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

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/20"
                aria-label="Menu"
              >
                {showMobileMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
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
      />

      {/* Mobile Menu */}
      {showMobileMenu && (
        <MobileMenu
          navItems={navItems}
          pathname={pathname}
          onNavigate={() => setShowMobileMenu(false)}
          onSignIn={() => setCurrentAuthModal("signin")}
          onSignUp={() => setCurrentAuthModal("signup")}
        />
      )}

      {/* Auth Modals */}
      <AuthManager
        currentModal={currentAuthModal}
        onModalChange={setCurrentAuthModal}
      />
    </>
  );
}