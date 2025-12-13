/**
 * Auth Validators - Zod Schemas for Auth Inputs
 * 
 * Clean validation schemas for sign in/up and partner requests.
 */

import { z } from 'zod';

// =============================================================================
// BASE FIELD SCHEMAS
// =============================================================================

const email = z.string().email('Invalid email address');
const password = z.string().min(8, 'Password must be at least 8 characters');
const name = z.string().min(1, 'Name is required').max(100, 'Name too long');

// =============================================================================
// AUTH INPUT SCHEMAS
// =============================================================================

export const signInSchema = z.object({
  email,
  password,
  rememberMe: z.boolean().default(false),
});

export const signUpSchema = z.object({
  name,
  email,
  password,
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine(val => val, {
    message: 'You must agree to the terms and conditions',
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;