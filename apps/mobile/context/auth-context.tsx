/**
 * Auth Context - Manages authentication state and flow visibility
 * 
 * Uses auth-api.ts for API calls and AsyncStorage for persistence.
 * Also manages the auth sheet state for unauthenticated users.
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import * as AuthAPI from '@/lib/auth-api';
import { unregisterPushTokenOnLogout } from '@/lib/push-token-store';

// Auth sheet context types
export type AuthSheetContext = 'profile' | 'saved' | 'messages' | 'listings' | 'default';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  emailVerified?: boolean;
  createdAt?: string | Date | null;
  // Profile fields from customSession enrichment
  role?: 'user' | 'admin' | 'super_admin';
  banned?: boolean;
  hasPartnerAccess?: boolean;
  isAlifhAdmin?: boolean;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  avatar?: string | null;
  avatarUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  useGeneratedAvatar?: boolean;
  partnerMemberships?: Array<{
    staffId: string;
    partnerId: string;
    partnerName: string;
    partnerLogo?: string | null;
    partnerTier?: string | null;
    subscriptionTier?: string | null;
    staffRole: string;
  }>;
}

interface AuthContextType {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  showAuthFlow: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  
  // Flow control
  openAuthFlow: () => void;
  closeAuthFlow: () => void;
  
  // Auth sheet (for unauthenticated prompts)
  showAuthSheet: (context?: AuthSheetContext) => void;
  hideAuthSheet: () => void;
  authSheetVisible: boolean;
  authSheetContext: AuthSheetContext;
  
  // Auth actions
  signIn: (user: AuthUser) => void;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showAuthFlow, setShowAuthFlow] = useState(false);
  
  // Auth sheet state
  const [authSheetVisible, setAuthSheetVisible] = useState(false);
  const [authSheetContext, setAuthSheetContext] = useState<AuthSheetContext>('default');

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      // First check if we have a stored session
      const { user: storedUser, session } = await AuthAPI.getSession();
      
      if (storedUser && session) {
        // Validate with server BEFORE setting authenticated state
        // This prevents race conditions where WebSocket connects with stale userId
        const result = await AuthAPI.refreshSession();
        
        if (result.success && result.user) {
          // Server validated - safe to set auth state
          setUser(result.user);
          setIsAuthenticated(true);
        } else {
          // Server couldn't validate session (expired, invalidated, or database changed)
          // Clear stale local session to prevent 401 errors on API calls
          console.warn('[AuthContext] Server session invalid, clearing stale local session');
          await AuthAPI.signOut();
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('[AuthContext] Failed to check session:', error);
      // On error, clear any stale session
      await AuthAPI.signOut().catch(() => {});
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = useCallback(async () => {
    try {
      const result = await AuthAPI.refreshSession();
      
      if (result.success && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('[AuthContext] Failed to refresh session:', error);
    }
  }, []);

  const openAuthFlow = useCallback(() => {
    setShowAuthFlow(true);
  }, []);

  const closeAuthFlow = useCallback(() => {
    setShowAuthFlow(false);
  }, []);

  // Auth sheet controls
  const showAuthSheetFn = useCallback((context: AuthSheetContext = 'default') => {
    setAuthSheetContext(context);
    setAuthSheetVisible(true);
  }, []);

  const hideAuthSheet = useCallback(() => {
    setAuthSheetVisible(false);
  }, []);

  const signIn = useCallback(async (userData: AuthUser) => {
    // Set basic user data immediately for quick UI update
    setUser(userData);
    setIsAuthenticated(true);
    setShowAuthFlow(false);
    
    // Then refresh session to get enriched data (avatarUrl, etc.) from server
    try {
      const result = await AuthAPI.refreshSession();
      if (result.success && result.user) {
        setUser(result.user);
      }
    } catch (error) {
      console.error('[AuthContext] Failed to refresh session after sign-in:', error);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      // Unregister push token before signing out
      await unregisterPushTokenOnLogout().catch(() => {});
      await AuthAPI.signOut();
    } catch (error) {
      console.error('[AuthContext] Sign out error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isSuperAdmin = user?.role === 'super_admin';

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        showAuthFlow,
        isAdmin,
        isSuperAdmin,
        openAuthFlow,
        closeAuthFlow,
        showAuthSheet: showAuthSheetFn,
        hideAuthSheet,
        authSheetVisible,
        authSheetContext,
        signIn,
        signOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
