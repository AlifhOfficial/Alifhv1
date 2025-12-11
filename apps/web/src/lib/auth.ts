import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db, user, session, account, verification } from '@alifh/database';

/**
 * Better Auth Configuration
 * 
 * Provides authentication services for the Alifh platform.
 * Using Drizzle adapter with Neon PostgreSQL.
 * 
 * Features:
 * - Email/Password authentication
 * - OAuth (Google, Apple) - ready for configuration
 * - Session management
 * - Email verification
 */
export const auth = betterAuth({
  // Database adapter
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user,
      session,
      account,
      verification,
    },
  }),

  // Base configuration
  secret: process.env.BETTER_AUTH_SECRET || '',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  
  // Email provider (Resend)
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Can enable later
  },

  // User configuration
  user: {
    // Keep it simple - Better Auth will use the standard fields
    // firstName and lastName are available in the schema but not required
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },

  // OAuth providers (ready to enable)
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      enabled: false, // Enable when ready
    },
    // Apple can be added later
  },
});

/**
 * Export auth types for client-side usage
 */
export type Auth = typeof auth;
