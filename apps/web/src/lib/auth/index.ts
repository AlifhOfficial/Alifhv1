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
 * - Session caching (30s TTL) for partner memberships
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
import { db, memoryCache, CacheKeys, CacheTTL } from "@alifh/database";
import * as schema from "@alifh/database";
import { UserRole } from "@/types/auth";
import { eq } from "drizzle-orm";
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
      maxAge: 300,
      strategy: "compact",
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
    }),
    customSession(async ({ user, session }) => {
      const cacheKey = CacheKeys.userSession(user.id);
      
      const cached = memoryCache.get<{
        role: string;
        banned: boolean;
        hasPartnerAccess: boolean;
        isAlifhAdmin: boolean;
        partnerMemberships: any[];
      }>(cacheKey);

      if (cached) {
        if (process.env.SESSION_DEBUG === 'true') {
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

      const userRecord = await db.query.user.findFirst({
        where: eq(schema.user.id, user.id),
        columns: {
          id: true,
          role: true,
          banned: true,
        },
        with: {
          partnerMemberships: {
            where: eq(schema.partnerStaff.status, "active"),
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
          },
        },
      });

      if (!userRecord) {
        return { user, session };
      }

      const activePartnerships = (userRecord.partnerMemberships || []).filter(
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

      const sessionData = {
        role: userRecord.role,
        banned: userRecord.banned,
        hasPartnerAccess,
        isAlifhAdmin,
        partnerMemberships,
      };
      
      memoryCache.set(cacheKey, sessionData, CacheTTL.userSession);
      
      if (process.env.SESSION_DEBUG === 'true') {
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

  pages: {
    signIn: "/",
    signUp: "/",
    error: "/auth/error",
  },

  trustedOrigins: [
    process.env.NEXTAUTH_URL || "http://localhost:3000",
    process.env.NEXT_PUBLIC_NETWORK_URL || "",
    "http://192.168.1.14:3000",
    "http://192.168.1.14:8081",
    "exp://192.168.1.14:8081",
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
