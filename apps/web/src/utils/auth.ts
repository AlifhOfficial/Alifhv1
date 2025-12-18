/**
 * Authentication Utilities - Production
 * 
 * Shared helpers for error handling, validation, and normalization.
 * Eliminates code duplication across auth handlers.
 * 
 * @module utils/auth
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
 * Transforms Better Auth API response to standardized result format
 * 
 * @param result - Better Auth API response
 * @param defaultError - Fallback error message
 * @returns Standardized auth result with success flag
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
 * Wraps async auth operations with error handling
 * 
 * @param operation - Async function returning AuthResult
 * @param defaultError - Fallback error message
 * @returns Auth result with caught errors normalized
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
 * Validates email format
 * @param email - Email address to validate
 * @returns Validation result with error message if invalid
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  const normalizedEmail = email.trim().toLowerCase();
  
  if (!normalizedEmail) {
    return { valid: false, error: "Please enter a valid email address." };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return { valid: false, error: "Please enter a valid email address." };
  }
  
  return { valid: true };
}

/**
 * Validates password meets minimum length requirement
 * @param password - Password to validate
 * @param minLength - Minimum required length (default: 8)
 * @returns Validation result with error message if invalid
 */
export function validatePassword(password: string, minLength: number = 8): { valid: boolean; error?: string } {
  if (password.length < minLength) {
    return { valid: false, error: `Password must be at least ${minLength} characters long` };
  }
  
  return { valid: true };
}

/**
 * Normalizes email to lowercase trimmed format
 * @param email - Email to normalize
 * @returns Lowercase trimmed email
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Normalizes name by trimming whitespace
 * @param name - Name to normalize
 * @returns Trimmed name
 */
export function normalizeName(name: string): string {
  return name.trim();
}
