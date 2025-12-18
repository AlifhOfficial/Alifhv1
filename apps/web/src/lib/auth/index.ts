import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins/magic-link";
import { admin } from "better-auth/plugins/admin";
import { customSession } from "better-auth/plugins";
import { db, memoryCache, CacheKeys, CacheTTL } from "@alifh/database";
import * as schema from "@alifh/database";
import { UserRole } from "@/lib/auth/types";
import { eq, and } from "drizzle-orm";

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
      // Include relations for Better Auth joins
      userRelations: schema.userRelations,
      accountRelations: schema.accountRelations,
      sessionRelations: schema.sessionRelations,
    }
  }),

  session: {
    expiresIn: AUTH_CONFIG.SESSION.EXPIRES_IN,
    updateAge: AUTH_CONFIG.SESSION.UPDATE_AGE,
    // Enable cookie caching to avoid DB queries on every session check
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes - balances performance with data freshness
      strategy: "compact", // Most compact format, best performance
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
    // Custom session to include role and partner membership data
    customSession(async ({ user, session }) => {
      const cacheKey = CacheKeys.userSession(user.id);
      
      // Try to get from cache first (30s TTL)
      const cached = memoryCache.get<{
        role: string;
        banned: boolean;
        hasPartnerAccess: boolean;
        isAlifhAdmin: boolean;
        partnerMemberships: any[];
      }>(cacheKey);

      if (cached) {
        // Only log if SESSION_DEBUG is enabled to reduce noise
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

      // Cache miss - load from database
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

      // Filter only active partners
      const activePartnerships = (userRecord.partnerMemberships || []).filter(
        m => m.partner.status === 'active'
      );

      const hasPartnerAccess = activePartnerships.length > 0;
      const isAlifhAdmin = ['admin', 'super_admin'].includes(userRecord.role || 'user');
      
      // Map to PartnerMembership type
      const partnerMemberships = activePartnerships.map(m => ({
        staffId: m.id,
        partnerId: m.partner.id,
        partnerName: m.partner.brandName,
        partnerTier: m.partner.tier,
        staffRole: m.role,
        permissions: m.permissions,
      }));

      // Cache the result for 30 seconds
      const sessionData = {
        role: userRecord.role,
        banned: userRecord.banned,
        hasPartnerAccess,
        isAlifhAdmin,
        partnerMemberships,
      };
      
      memoryCache.set(cacheKey, sessionData, CacheTTL.userSession);
      
      // Only log if SESSION_DEBUG is enabled to reduce noise
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

  // Redirect auth errors to our custom error page (not Better Auth's default)
  pages: {
    signIn: "/",
    signUp: "/",
    error: "/auth/error", // Custom error page that shows our modal
  },

  trustedOrigins: [
    process.env.NEXTAUTH_URL || "http://localhost:3000",
    process.env.NEXT_PUBLIC_NETWORK_URL || "",
    "http://192.168.1.14:3000", // Local network access
    "http://192.168.1.14:8081", // Expo mobile dev
    "exp://192.168.1.14:8081", // Expo protocol
  ].filter(Boolean),
});

export type PartnerMembership = {
  partnerId: string;
  role: "owner" | "admin" | "sales" | "viewer";
  status: "active" | "invited" | "suspended" | "left";
};

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
