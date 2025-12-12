/**
 * Better Auth Operations Hook
 * 
 * Simplified hook for all Better Auth operations
 * Wraps Better Auth client methods with basic error handling
 */

'use client';

import { useCallback, useState } from 'react';
import { authClient } from '@/lib/auth/client';

export interface AuthUser {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  emailVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SignInCredentials {
  email: string;
  password: string;
  callbackURL?: string;
}

export interface SignUpCredentials {
  name: string;
  email: string;
  password: string;
  image?: string;
  callbackURL?: string;
}

export interface PasswordResetRequest {
  email: string;
  callbackURL?: string;
}

export interface PasswordUpdateData {
  newPassword: string;
  token?: string;
  currentPassword?: string;
}

export interface MagicLinkRequest {
  email: string;
  callbackURL?: string;
}

export interface EmailVerificationRequest {
  email?: string;
  callbackURL?: string;
}

export interface SocialSignInRequest {
  provider: 'google' | 'github' | 'discord';
  callbackURL?: string;
}

// Simple result type for auth operations
export interface AuthResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    status?: number;
  };
}

export function useBetterAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sign In Operations
  const signInWithEmail = useCallback(async (
    credentials: SignInCredentials
  ): Promise<AuthResult<AuthUser>> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authClient.signIn.email({
        email: credentials.email,
        password: credentials.password,
        callbackURL: credentials.callbackURL,
      });

      if (result.error) {
        const errorMessage = result.error.message || 'Sign in failed';
        setError(errorMessage);
        return { 
          success: false, 
          error: {
            code: result.error.code || 'sign_in_failed',
            message: errorMessage,
            status: result.error.status
          }
        };
      }

      const user = result.data?.user;
      if (!user) {
        const errorMessage = 'Invalid response from server';
        setError(errorMessage);
        return { 
          success: false, 
          error: { 
            code: 'invalid_response',
            message: errorMessage,
            status: 500 
          }
        };
      }

      return { success: true, data: user as AuthUser };
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred';
      setError(errorMessage);
      return { 
        success: false, 
        error: {
          code: 'unexpected_error',
          message: errorMessage,
          status: 500
        }
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInWithGoogle = useCallback(async (
    request: SocialSignInRequest = { provider: 'google' }
  ): Promise<AuthResult<void>> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authClient.signIn.social({
        provider: request.provider,
        callbackURL: request.callbackURL || '/dashboard',
      });

      if (result.error) {
        const errorMessage = result.error.message || 'Social sign in failed';
        setError(errorMessage);
        return { 
          success: false, 
          error: {
            code: result.error.code || 'social_sign_in_failed',
            message: errorMessage,
            status: result.error.status
          }
        };
      }

      return { success: true, data: undefined };
    } catch (error: any) {
      const errorMessage = error.message || 'Social sign in failed';
      setError(errorMessage);
      return { 
        success: false, 
        error: {
          code: 'social_sign_in_error',
          message: errorMessage,
          status: 500
        }
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sign Up Operations
  const signUpWithEmail = useCallback(async (
    credentials: SignUpCredentials
  ): Promise<AuthResult<AuthUser>> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authClient.signUp.email({
        name: credentials.name,
        email: credentials.email,
        password: credentials.password,
        image: credentials.image,
        callbackURL: credentials.callbackURL,
      });

      if (result.error) {
        const errorMessage = result.error.message || 'Sign up failed';
        setError(errorMessage);
        return { 
          success: false, 
          error: {
            code: result.error.code || 'sign_up_failed',
            message: errorMessage,
            status: result.error.status
          }
        };
      }

      const user = result.data?.user;
      if (!user) {
        const errorMessage = 'Invalid response from server';
        setError(errorMessage);
        return { 
          success: false, 
          error: { 
            code: 'invalid_response',
            message: errorMessage,
            status: 500 
          }
        };
      }

      return { success: true, data: user as AuthUser };
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred';
      setError(errorMessage);
      return { 
        success: false, 
        error: {
          code: 'unexpected_error',
          message: errorMessage,
          status: 500
        }
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Password Reset Operations
  const requestPasswordReset = useCallback(async (
    request: PasswordResetRequest
  ): Promise<AuthResult<void>> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use our custom validated endpoint
      const response = await fetch('/api/auth/password-reset-validated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: request.email,
          redirectTo: request.callbackURL || '/reset-password',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || 'Password reset request failed';
        setError(errorMessage);
        return { 
          success: false, 
          error: {
            code: 'request_failed',
            message: errorMessage,
            status: response.status
          }
        };
      }

      return { success: true, data: undefined };
    } catch (error: any) {
      const errorMessage = error.message || 'Password reset request failed';
      setError(errorMessage);
      return { 
        success: false, 
        error: {
          code: 'request_error',
          message: errorMessage,
          status: 500
        }
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePassword = useCallback(async (
    data: PasswordUpdateData
  ): Promise<AuthResult<void>> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Implement password update functionality
      console.warn('Password update functionality not implemented');
      const errorMessage = 'Password update not implemented';
      setError(errorMessage);
      return { 
        success: false, 
        error: { 
          code: 'not_implemented', 
          message: errorMessage, 
          status: 501 
        } 
      };
    } catch (error: any) {
      const errorMessage = error.message || 'Password update failed';
      setError(errorMessage);
      return { 
        success: false, 
        error: {
          code: 'password_update_error',
          message: errorMessage,
          status: 500
        }
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Magic Link Operations
  const sendMagicLink = useCallback(async (
    request: MagicLinkRequest
  ): Promise<AuthResult<void>> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authClient.signIn.magicLink({
        email: request.email,
        callbackURL: request.callbackURL || '/magic-link/callback',
      });

      if (result.error) {
        const errorMessage = result.error.message || 'Magic link send failed';
        setError(errorMessage);
        return { 
          success: false, 
          error: {
            code: result.error.code || 'magic_link_failed',
            message: errorMessage,
            status: result.error.status
          }
        };
      }

      return { success: true, data: undefined };
    } catch (error: any) {
      const errorMessage = error.message || 'Magic link send failed';
      setError(errorMessage);
      return { 
        success: false, 
        error: {
          code: 'magic_link_error',
          message: errorMessage,
          status: 500
        }
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Email Verification Operations
  const sendEmailVerification = useCallback(async (
    request: EmailVerificationRequest = {}
  ): Promise<AuthResult<void>> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authClient.sendVerificationEmail({
        email: request.email,
        callbackURL: request.callbackURL || '/verify-email/callback',
      });

      if (result.error) {
        const errorMessage = result.error.message || 'Email verification send failed';
        setError(errorMessage);
        return { 
          success: false, 
          error: {
            code: result.error.code || 'email_verification_failed',
            message: errorMessage,
            status: result.error.status
          }
        };
      }

      return { success: true, data: undefined };
    } catch (error: any) {
      const errorMessage = error.message || 'Email verification send failed';
      setError(errorMessage);
      return { 
        success: false, 
        error: {
          code: 'email_verification_error',
          message: errorMessage,
          status: 500
        }
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyEmail = useCallback(async (
    token: string
  ): Promise<AuthResult<void>> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authClient.verifyEmail({
        query: { token }
      });

      if (result.error) {
        const errorMessage = result.error.message || 'Email verification failed';
        setError(errorMessage);
        return { 
          success: false, 
          error: {
            code: result.error.code || 'email_verify_failed',
            message: errorMessage,
            status: result.error.status
          }
        };
      }

      return { success: true, data: undefined };
    } catch (error: any) {
      const errorMessage = error.message || 'Email verification failed';
      setError(errorMessage);
      return { 
        success: false, 
        error: {
          code: 'email_verify_error',
          message: errorMessage,
          status: 500
        }
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sign Out Operation
  const signOut = useCallback(async (): Promise<AuthResult<void>> => {
    try {
      const result = await authClient.signOut();
      
      if (result.error) {
        console.warn('Sign out error (non-critical):', result.error);
      }

      // Always consider sign out successful for UX
      return { success: true, data: undefined };
    } catch (error) {
      console.warn('Sign out error (non-critical):', error);
      // Always consider sign out successful for UX
      return { success: true, data: undefined };
    }
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Operations
    signInWithEmail,
    signInWithGoogle,
    signUpWithEmail,
    requestPasswordReset,
    updatePassword,
    sendMagicLink,
    sendEmailVerification,
    verifyEmail,
    signOut,
    
    // State
    isLoading,
    error,
    clearError,
  };
}