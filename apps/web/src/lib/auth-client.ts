'use client';

import { createAuthClient } from 'better-auth/react';
import type { Auth } from './auth';

/**
 * Better Auth Client
 * 
 * Client-side authentication hooks and utilities.
 * Use this in React components to access auth state and methods.
 * 
 * Usage:
 * ```tsx
 * import { useSession, signIn, signOut } from '@/lib/auth-client';
 * 
 * function MyComponent() {
 *   const { data: session } = useSession();
 *   
 *   if (!session) {
 *     return <button onClick={() => signIn.email({ email, password })}>Sign In</button>;
 *   }
 *   
 *   return <button onClick={() => signOut()}>Sign Out</button>;
 * }
 * ```
 */
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  $Infer,
} = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
});

/**
 * Type inference for user session
 */
export type Session = typeof $Infer.Session;
