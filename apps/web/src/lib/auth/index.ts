import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins/magic-link";
import { admin } from "better-auth/plugins/admin";
import { db } from "@alifh/database";
import * as schema from "@alifh/database";
import { UserRole } from "@alifh/shared";
import { eq, and } from "drizzle-orm";

import { emailService } from "@/lib/email";
import { ac, roles } from "./permissions";

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
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    
    // Extend the user object in the session
    async fetchUser(userId) {
      console.log('[Session] Fetching user:', userId);
      
      // Fetch user with partner membership check
      const user = await db.query.user.findFirst({
        where: eq(schema.user.id, userId),
      });

      if (!user) {
        console.log('[Session] User not found:', userId);
        return null;
      }

      console.log('[Session] User found:', {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      // Load active partner memberships with partner details
      const memberships = await db.query.partnerStaff.findMany({
        where: and(
          eq(schema.partnerStaff.userId, userId),
          eq(schema.partnerStaff.status, "active")
        ),
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
      });

      // Filter only memberships to active partners
      const activePartnerships = memberships.filter(
        m => m.partner.status === 'active'
      );

      const hasPartnerAccess = activePartnerships.length > 0;
      const isAlifhAdmin = ['admin', 'super_admin'].includes(user.role);
      
      // Map to PartnerMembership type
      const partnerMemberships = activePartnerships.map(m => ({
        staffId: m.id,
        partnerId: m.partner.id,
        partnerName: m.partner.brandName,
        partnerTier: m.partner.tier,
        staffRole: m.role,
        permissions: m.permissions,
      }));
      
      console.log('[Session] Partner membership check:', {
        userId,
        hasPartnerAccess,
        isAlifhAdmin,
        partnerCount: activePartnerships.length,
        memberships: partnerMemberships.map(m => ({
          partner: m.partnerName,
          role: m.staffRole,
        })),
      });

      // Return user with extended fields
      return {
        ...user,
        hasPartnerAccess,
        isAlifhAdmin,
        partnerMemberships,
      } as any; // Cast to any to bypass Better Auth type restrictions
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
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
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
      expiresIn: 60 * 10,
    }),
    admin({
      defaultRole: "user",
      ac,
      roles: {
        admin: roles.admin,
        user: roles.user,
      },
    }),
  ],

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  trustedOrigins: [
    process.env.NEXTAUTH_URL || "http://localhost:3000",
  ],
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
