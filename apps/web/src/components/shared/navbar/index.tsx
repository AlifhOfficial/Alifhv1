/**
 * Navbar Component - Revvup Presentation Layer
 * Clean, minimal navigation for Revvup vehicle marketplace
 * 
 * Features:
 * - Responsive design
 * - Theme toggle
 * - Authentication modals
 * - Clean Revvup branding
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems, type NavItem } from "@/lib/navigation";
import { MegaDropdown } from "./mega-dropdown";
import { ProfileMenu } from "./user-dropdown";
import { NavbarMessaging } from "./navbar-messaging";
import { NavbarFavorites } from "./navbar-favorites";
import { AuthManager, AuthModalType } from "@/components/auth";
import { useFloatingChatSafe } from "@/components/messaging/floating-chat-manager";
import { useUser } from "@/hooks/auth/use-auth";
import { handleSignOut } from "@/lib/auth/sign-out";
import type { AuthUser } from "@/components/auth";

export type { NavItem };

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [_isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [currentAuthModal, setCurrentAuthModal] = useState<AuthModalType>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasHandledAuthParamRef = useRef(false);
  const pendingRedirectRef = useRef<string | null>(null);
  
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, setTheme } = useTheme();
  const { user, isSignedIn: isAuthenticated, setSessionUser } = useUser();
  const { openChat } = useFloatingChatSafe();

  // Mark as mounted after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

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
        setActiveDropdown(null);
        setShowProfileMenu(false);
        setShowThemeMenu(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);


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
    
    // Handle auth modal triggers from error page (?auth=signin or ?auth=signup)
    const authParam = searchParams.get("auth");
    const redirectParam = searchParams.get("redirect");
    
    // Only process if we have an auth param and haven't handled it yet
    if ((authParam === "signin" || authParam === "signup") && !hasHandledAuthParamRef.current) {
      // Mark as handled immediately to prevent double-processing
      hasHandledAuthParamRef.current = true;
      
      // Clean URL params first
      const params = new URLSearchParams(searchParams.toString());
      params.delete("auth");
      params.delete("redirect");
      const queryString = params.toString();
      
      // If already authenticated, skip modal and just navigate to redirect
      if (isAuthenticated && redirectParam) {
        queueMicrotask(() => {
          router.replace(`${pathname}${queryString ? `?${queryString}` : ""}`, { scroll: false });
          // Brief delay then navigate to the intended destination
          requestAnimationFrame(() => {
            router.push(redirectParam);
          });
        });
        return;
      }
      
      // Not authenticated - store redirect for after auth success
      if (redirectParam) {
        pendingRedirectRef.current = redirectParam;
      }
      
      // Use queueMicrotask to ensure state updates happen in correct order
      queueMicrotask(() => {
        router.replace(`${pathname}${queryString ? `?${queryString}` : ""}`, { scroll: false });
        // Open modal after URL cleanup is queued
        requestAnimationFrame(() => {
          setCurrentAuthModal(authParam);
        });
      });
    } else if (!authParam) {
      // Reset the ref when there's no auth param (allows re-triggering on new navigations)
      hasHandledAuthParamRef.current = false;
    }
  }, [searchParams, pathname, router, isAuthenticated]);

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
      <nav className="fixed top-0 left-0 right-0 z-40 bg-background">
        <div className="flex items-center justify-between h-14 sm:h-16 max-w-[1600px] mx-auto px-4 sm:px-6">
            {/* Logo - suppressHydrationWarning prevents Safari hydration issues with theme-based visibility */}
            <Link href="/" className="flex items-center mr-8" suppressHydrationWarning>
              <Image
                src="/assets/Revvup_logo_Black.svg"
                alt="Revvup"
                width={20}
                height={20}
                className="h-5 w-auto dark:hidden"
                priority
                suppressHydrationWarning
              />
              <Image
                src="/assets/Revvup_logo_White.svg"
                alt="Revvup"
                width={20}
                height={20}
                className="h-5 w-auto hidden dark:block"
                priority
                suppressHydrationWarning
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1 flex-1">
              {navItems.map((item) => (
                <div 
                  key={item.label}
                  onMouseEnter={() => item.submenu && !item.hideSubmenu && handleDropdownOpen(item.label)}
                  onMouseLeave={() => item.submenu && !item.hideSubmenu && handleDropdownClose()}
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
                    <div className="p-1.5 flex flex-col gap-0.5">
                      {[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }, { value: 'charcoal', label: 'Charcoal' }].map((themeOption) => (
                        <button
                          key={themeOption.value}
                          onClick={() => {
                            setTheme(themeOption.value);
                            setShowThemeMenu(false);
                          }}
                          className={cn(
                            'w-full text-left px-3 py-2 rounded-md touch-manipulation',
                            'text-[14px] font-medium tracking-tight transition-colors duration-100',
                            theme === themeOption.value
                              ? 'bg-sidebar-accent text-sidebar-foreground font-semibold'
                              : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                          )}
                        >
                          {themeOption.label}
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
                navItems={navItems}
                pathname={pathname}
                onNavigate={() => setShowProfileMenu(false)}
              />
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

      {/* Auth Modals */}
      <AuthManager
        currentModal={currentAuthModal}
        onModalChange={setCurrentAuthModal}
        onSuccess={(authUser?: AuthUser) => {
          if (authUser) {
            setSessionUser(authUser as typeof user);
            return;
          }
          router.refresh();
        }}
      />
    </>
  );
}
