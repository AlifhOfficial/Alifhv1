/**
 * Auth Modal Constants - Alifh Design System
 * 
 * Centralized branding and asset paths for auth modals
 * Ensures consistency across signin/signup experiences
 */

export const AUTH_MODAL_ASSETS = {
  // Modal background images
  images: {
    signIn: "/Images/sign.png",
    signUp: "/Images/up.png",
  },
  
  // Logo
  logo: {
    white: "/assets/Alifh_logo_White.svg",
    dark: "/assets/Alifh_logo.svg",
  },
  
  // Tagline displayed on modals
  tagline: "Automotive Excellence",
} as const;

// Base URL for post-auth redirects (fallback when no redirect specified)
export const AUTH_REDIRECT_BASE = "/" as const;

// Modal styling constants
export const AUTH_MODAL_STYLES = {
  zIndex: 9999,
  backdropBlur: "sm",
  maxWidth: "4xl",
  borderRadius: "xl",
} as const;
