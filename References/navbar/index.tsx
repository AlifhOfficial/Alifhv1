/**
 * Navbar Component - Clean Architecture Compliant
 * Follows Alifh Design Philosophy: minimal, clean, premium
 * 
 * Features:
 * - Responsive design (mobile + desktop)
 * - Theme toggle (light/dark)
 * - Mega dropdown menus
 * - Full auth flow with OAuth support
 * - User profile display
 * 
 * Architecture:
 * - Uses domain entities (User) instead of raw data
 * - Uses application use cases via hooks
 * - No direct business logic in UI
 * - Follows Clean Architecture dependency rules
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { 
  SignInModal, 
  SignUpModal, 
  SignInFeedbackModal, 
  SignUpFeedbackModal, 
  WelcomeModal,
  GoogleRedirectModal 
} from "@alifh/ui";
import { Moon, Sun, Menu, X } from "lucide-react";
import { ProfileMenu } from "./ProfileMenu";
import { MegaDropdown } from "./MegaDropdown";
import { MobileMenu } from "./MobileMenu";
import { useAuthUseCases, useUser } from "@/hooks/useAuth";

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
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Consolidated auth state
  const [authState, setAuthState] = useState({
    showSignInModal: false,
    showSignUpModal: false,
    showSignInFeedback: false,
    showSignUpFeedback: false,
    showWelcome: false,
    showGoogleRedirect: false,
  });
  
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  // ============================================================================
  // Clean Architecture: Use Domain Entities & Use Cases
  // ============================================================================
  
  // Get user as domain entity (not raw session)
  const user = useUser();
  
  // Get auth use cases (not direct authClient)
  const {
    isLoading: authLoading,
    error: authError,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut: signOutUseCase,
  } = useAuthUseCases();

  // Fix hydration by using mounted state
  const [mounted, setMounted] = useState(false);

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

  // Close Google redirect modal when user is authenticated
  useEffect(() => {
    if (user && authState.showGoogleRedirect) {
      setAuthState(prev => ({ ...prev, showGoogleRedirect: false }));
    }
  }, [user, authState.showGoogleRedirect]);

  // ============================================================================
  // Business Logic: Use Domain Methods
  // ============================================================================

  // Hide navbar on dashboard pages - use domain method
  if (pathname && user && !user.canAccessRoute(pathname)) {
    return null;
  }

  // Get first name from domain entity
  const firstName = user?.getFirstName() || "User";

  // ============================================================================
  // Auth Handlers - Call Use Cases (Not AuthClient Directly)
  // ============================================================================

  const handleSignIn = useCallback(async (email: string, password: string) => {
    setAuthState(prev => ({ 
      ...prev, 
      showSignInModal: false, 
      showSignInFeedback: true 
    }));
    
    const success = await signInWithEmail(email, password);
    
    if (success) {
      setAuthState(prev => ({ ...prev, showSignInFeedback: false }));
    } else {
      setAuthState(prev => ({ 
        ...prev, 
        showSignInFeedback: false,
        showSignInModal: true
      }));
    }
  }, [signInWithEmail]);

  const handleSignUp = useCallback(async (name: string, email: string, password: string) => {
    setAuthState(prev => ({ 
      ...prev, 
      showSignUpModal: false, 
      showSignUpFeedback: true 
    }));
    
    const success = await signUpWithEmail(name, email, password);
    
    if (success) {
      setAuthState(prev => ({ 
        ...prev, 
        showSignUpFeedback: false, 
        showWelcome: true 
      }));
    } else {
      setAuthState(prev => ({ 
        ...prev, 
        showSignUpFeedback: false,
        showSignUpModal: true
      }));
    }
  }, [signUpWithEmail]);

  const handleGoogleAuth = useCallback(async () => {
    setAuthState(prev => ({ 
      ...prev, 
      showSignInModal: false, 
      showSignUpModal: false,
      showGoogleRedirect: true
    }));
    
    await signInWithGoogle();
  }, [signInWithGoogle]);

  const handleSignOut = useCallback(async () => {
    await signOutUseCase();
    setShowProfileMenu(false);
  }, [signOutUseCase]);

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

              {/* Profile Menu */}
              <ProfileMenu
                user={user}
                showMenu={showProfileMenu}
                onToggleMenu={() => setShowProfileMenu(!showProfileMenu)}
                onSignIn={() => {
                  setShowProfileMenu(false);
                  setAuthState(prev => ({ ...prev, showSignInModal: true }));
                }}
                onSignUp={() => {
                  setShowProfileMenu(false);
                  setAuthState(prev => ({ ...prev, showSignUpModal: true }));
                }}
                onSignOut={handleSignOut}
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

        {/* Mobile Menu */}
        {showMobileMenu && (
          <MobileMenu
            user={user}
            navItems={navItems}
            pathname={pathname}
            onNavigate={() => setShowMobileMenu(false)}
            onSignIn={() => {
              setShowMobileMenu(false);
              setAuthState(prev => ({ ...prev, showSignInModal: true }));
            }}
            onSignUp={() => {
              setShowMobileMenu(false);
              setAuthState(prev => ({ ...prev, showSignUpModal: true }));
            }}
            onSignOut={handleSignOut}
          />
        )}
      </nav>

      {/* Mega Dropdown */}
      <MegaDropdown
        activeDropdown={activeDropdown}
        navItems={navItems}
        onClose={() => setActiveDropdown(null)}
      />

      {/* Auth Modals */}
      <SignInModal
        open={authState.showSignInModal}
        onOpenChange={(open) => setAuthState(prev => ({ ...prev, showSignInModal: open }))}
        onSwitchToSignUp={() => {
          setAuthState(prev => ({ 
            ...prev, 
            showSignInModal: false, 
            showSignUpModal: true 
          }));
        }}
        onSubmit={handleSignIn}
        onGoogleSignIn={handleGoogleAuth}
        isLoading={authLoading}
        error={authError}
      />

      <SignUpModal
        open={authState.showSignUpModal}
        onOpenChange={(open) => setAuthState(prev => ({ ...prev, showSignUpModal: open }))}
        onSwitchToSignIn={() => {
          setAuthState(prev => ({ 
            ...prev, 
            showSignUpModal: false, 
            showSignInModal: true 
          }));
        }}
        onSubmit={handleSignUp}
        onGoogleSignUp={handleGoogleAuth}
        isLoading={authLoading}
        error={authError}
      />

      <SignInFeedbackModal open={authState.showSignInFeedback} />
      <SignUpFeedbackModal open={authState.showSignUpFeedback} />
      
      <WelcomeModal
        open={authState.showWelcome}
        onContinue={() => setAuthState(prev => ({ ...prev, showWelcome: false }))}
        userName={firstName}
      />

      <GoogleRedirectModal 
        open={authState.showGoogleRedirect}
        onClose={() => setAuthState(prev => ({ ...prev, showGoogleRedirect: false }))}
      />
    </>
  );
}
