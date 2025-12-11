import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

/**
 * Better Auth API Route Handler
 * 
 * Handles all authentication requests:
 * - POST /api/auth/sign-in
 * - POST /api/auth/sign-up
 * - POST /api/auth/sign-out
 * - GET /api/auth/session
 * - And more...
 * 
 * Better Auth automatically creates all necessary endpoints.
 */
export const { GET, POST } = toNextJsHandler(auth);
