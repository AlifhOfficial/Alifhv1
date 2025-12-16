/**
 * Auth Utilities - DRY Error Handling & Helpers
 * 
 * Centralized error handling to eliminate 15+ identical try-catch blocks
 */

export interface AuthResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface BetterAuthResponse<T = any> {
  data?: T;
  error?: {
    message?: string;
    status?: number;
    code?: string;
  };
}

/**
 * Handle Better Auth API responses with consistent error handling
 * Eliminates duplicate error handling across all auth handlers
 */
export function handleAuthResult<T>(
  result: BetterAuthResponse<T>,
  defaultError: string = "Operation failed"
): AuthResult<T> {
  if (result.error) {
    return {
      success: false,
      error: result.error.message || defaultError,
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

/**
 * Wrap async operations with try-catch and consistent error handling
 * Eliminates duplicate try-catch blocks throughout auth code
 */
export async function safeAuthOperation<T>(
  operation: () => Promise<AuthResult<T>>,
  defaultError: string = "An unexpected error occurred"
): Promise<AuthResult<T>> {
  try {
    return await operation();
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || defaultError,
    };
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  const normalizedEmail = email.trim().toLowerCase();
  
  if (!normalizedEmail) {
    return { valid: false, error: "Please enter a valid email address." };
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return { valid: false, error: "Please enter a valid email address." };
  }
  
  return { valid: true };
}

/**
 * Validate password requirements
 */
export function validatePassword(password: string, minLength: number = 8): { valid: boolean; error?: string } {
  if (password.length < minLength) {
    return { valid: false, error: `Password must be at least ${minLength} characters long` };
  }
  
  return { valid: true };
}

/**
 * Normalize email address
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Normalize name
 */
export function normalizeName(name: string): string {
  return name.trim();
}
