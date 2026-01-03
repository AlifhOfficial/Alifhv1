/**
 * Better Auth Configuration - Production
 * 
 * Main authentication system configuration with Drizzle adapter.
 * Implements session caching, role-based access control, and partner membership context.
 * 
 * Features:
 * - Email/password authentication with verification
 * - Magic link authentication
 * - Google OAuth integration
 * - Role-based permissions (admin plugin)
 * - Session caching (5min TTL) for partner memberships
 * - Account linking for trusted providers
 * 
 * @module lib/auth
 * @see {@link docs/Auth/AUTH_IMPLEMENTATION.md} for architecture details
 */

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins/magic-link";
import { admin } from "better-auth/plugins/admin";
import { customSession } from "better-auth/plugins";
import { db, memoryCache, CacheKeys, CacheTTL, eq, and } from "@alifh/database";
import * as schema from "@alifh/database";
import { UserRole } from "@/types/auth";
import { emailService } from "@/lib/email";
import { ac, roles } from "@/lib/auth/permissions";
import { AUTH_CONFIG } from "./config";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      account: schema.account,
      session: schema.session,
      verification: schema.verification,
      userRelations: schema.userRelations,
      accountRelations: schema.accountRelations,
      sessionRelations: schema.sessionRelations,
    }
  }),

  session: {
    expiresIn: AUTH_CONFIG.SESSION.EXPIRES_IN,
    updateAge: AUTH_CONFIG.SESSION.UPDATE_AGE,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes - matches our memory cache TTL
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }) => {
      await emailService.sendPasswordReset({ user, url, token });
    },
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      await emailService.sendVerificationEmail({ user, url, token });
    },
    sendOnSignUp: AUTH_CONFIG.EMAIL_VERIFICATION.SEND_ON_SIGN_UP,
    autoSignInAfterVerification: AUTH_CONFIG.EMAIL_VERIFICATION.AUTO_SIGN_IN_AFTER_VERIFICATION,
  },

  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url, token }) => {
        await emailService.sendMagicLink({ 
          user: { email, name: email.split('@')[0] }, 
          url, 
          token 
        });
      },
      expiresIn: AUTH_CONFIG.MAGIC_LINK.EXPIRES_IN,
      disableSignUp: AUTH_CONFIG.MAGIC_LINK.DISABLE_SIGN_UP,
    }),
    admin({
      defaultRole: "user",
      ac,
      roles: {
        admin: roles.admin,
        user: roles.user,
      },
      // Block banned users from signing in
      async impersonationAllowed({ adminUser, targetUser }) {
        // Only super_admin can impersonate, and cannot impersonate other admins
        if (adminUser.role !== 'super_admin') return false;
        if (targetUser.role === 'admin' || targetUser.role === 'super_admin') return false;
        return true;
      },
    }),
    customSession(async ({ user, session }) => {
      const cacheKey = CacheKeys.userSession(user.id);
      
      const cached = memoryCache.get<{
        role: string;
        banned: boolean;
        hasPartnerAccess: boolean;
        isAlifhAdmin: boolean;
        partnerMemberships: any[];
        avatar?: string | null;
        avatarUrl?: string | null;
        firstName?: string | null;
        lastName?: string | null;
        useGeneratedAvatar?: boolean;
      }>(cacheKey);

      if (cached) {
        // Always log cache hits in dev for debugging
        if (process.env.NODE_ENV === 'development') {
          console.log(`[customSession] Cache HIT for user ${user.id.slice(0, 8)}... (saved DB query)`);
        }
        return {
          user: {
            ...user,
            ...cached,
          },
          session,
        };
      }

      // Run all queries in parallel for faster execution
      const [userRecord, profileRecord, memberships] = await Promise.all([
        // 1. Basic user data (PK lookup)
        db.query.user.findFirst({
          where: eq(schema.user.id, user.id),
          columns: {
            id: true,
            role: true,
            banned: true,
          },
        }),
        // 2. Profile data (unique index lookup)
        db.query.userProfile.findFirst({
          where: eq(schema.userProfile.userId, user.id),
          columns: {
            avatar: true,
            firstName: true,
            lastName: true,
            preferences: true,
            updatedAt: true, // Needed for avatar cache busting
          },
        }),
        // 3. Partner memberships with partner info (indexed)
        db.query.partnerStaff.findMany({
          where: and(
            eq(schema.partnerStaff.userId, user.id),
            eq(schema.partnerStaff.status, "active")
          ),
          columns: {
            id: true,
            role: true,
            permissions: true,
          },
          with: {
            partner: {
              columns: {
                id: true,
                brandName: true,
                status: true,
                tier: true,
              },
            },
          },
        }) as unknown as Promise<Array<{
          id: string;
          role: string;
          permissions: unknown;
          partner: { id: string; brandName: string; status: string; tier: string | null };
        }>>,
      ]);

      if (!userRecord) {
        return { user, session };
      }

      const activePartnerships = (memberships || []).filter(
        m => m.partner.status === 'active'
      );

      const hasPartnerAccess = activePartnerships.length > 0;
      const isAlifhAdmin = ['admin', 'super_admin'].includes(userRecord.role || 'user');
      
      const partnerMemberships = activePartnerships.map(m => ({
        staffId: m.id,
        partnerId: m.partner.id,
        partnerName: m.partner.brandName,
        partnerTier: m.partner.tier,
        staffRole: m.role,
        permissions: m.permissions,
      }));

      // Get avatar URL if avatar exists - use public URL (no signing needed)
      // IMPORTANT: Include cache buster to ensure fresh images after upload
      let avatarUrl: string | null = null;
      const avatar = profileRecord?.avatar;
      if (avatar && !avatar.startsWith('http')) {
        const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
        if (publicUrl) {
          // Use updatedAt timestamp for cache busting, or current time as fallback
          const cacheBuster = profileRecord?.updatedAt 
            ? new Date(profileRecord.updatedAt).getTime() 
            : Date.now();
          avatarUrl = `${publicUrl.replace(/\/$/, '')}/${avatar}?v=${cacheBuster}`;
          
          if (process.env.SESSION_DEBUG === 'true') {
            console.log(`[customSession] Avatar URL: ${avatarUrl}`);
          }
        }
      } else if (avatar) {
        avatarUrl = avatar;
      }

      // Extract useGeneratedAvatar from preferences (defaults to true)
      const preferences = profileRecord?.preferences as { useGeneratedAvatar?: boolean } | null;
      const useGeneratedAvatar = preferences?.useGeneratedAvatar ?? true;

      const sessionData = {
        role: userRecord.role,
        banned: userRecord.banned,
        hasPartnerAccess,
        isAlifhAdmin,
        partnerMemberships,
        avatar,
        avatarUrl,
        firstName: profileRecord?.firstName,
        lastName: profileRecord?.lastName,
        useGeneratedAvatar,
      };
      
      memoryCache.set(cacheKey, sessionData, CacheTTL.userSession);
      
      // Always log cache misses in dev for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log(`[customSession] Cache MISS for user ${user.id.slice(0, 8)}... - loaded from DB (${activePartnerships.length} memberships)`);
      }

      return {
        user: {
          ...user,
          ...sessionData,
        },
        session,
      };
    }),
  ],

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },

  // Block banned users from signing in
  denyList: {
    async check({ userId }) {
      if (!userId) return false;
      
      const userRecord = await db.query.user.findFirst({
        where: eq(schema.user.id, userId),
        columns: { banned: true, banReason: true },
      });
      
      if (userRecord?.banned) {
        return {
          blocked: true,
          message: userRecord.banReason || "Your account has been suspended.",
        };
      }
      
      return false;
    },
  },

  pages: {
    signIn: "/",
    signUp: "/",
    error: "/auth/error",
  },

  trustedOrigins: [
    process.env.NEXTAUTH_URL || "http://localhost:3000",
    process.env.NEXT_PUBLIC_NETWORK_URL || "",
    "http://192.168.1.103:3000",
    "http://192.168.1.103:8081",
    "exp://192.168.1.103:8081",
  ].filter(Boolean),
});

export type Session = typeof auth.$Infer.Session & {
  user: typeof auth.$Infer.Session.user & {
    role: UserRole;
    hasPartnerAccess?: boolean;
  };
};

export type AuthUser = typeof auth.$Infer.Session.user & {
  role: UserRole;
  hasPartnerAccess?: boolean;
};
