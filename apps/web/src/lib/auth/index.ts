import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins/magic-link";
import { admin } from "better-auth/plugins/admin";
import { db } from "@alifh/database";
import * as schema from "@alifh/database";
import { UserRole } from "@alifh/shared";

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
        partner: roles.partner,
        staff: roles.staff,
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

export type Session = typeof auth.$Infer.Session & {
  user: typeof auth.$Infer.Session.user & {
    role: UserRole;
  };
};

export type AuthUser = typeof auth.$Infer.Session.user & {
  role: UserRole;
};
