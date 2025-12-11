import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@alifh/database";
import * as schema from "@alifh/database";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      account: schema.account,
      session: schema.session,
      verification: schema.verification,
    }
  }),

  // Define custom user fields
  user: {
    additionalFields: {
      platformRole: {
        type: "string",
        defaultValue: "user",
        required: false,
      },
      status: {
        type: "string", 
        defaultValue: "active",
        required: false,
      },
      activePartnerId: {
        type: "string",
        required: false,
      },
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },

  callbacks: {
    async signUp({ user }) {
      return {
        user: {
          ...user,
          platformRole: "user",
          status: "active",
        },
      };
    },

    async signIn({ user }) {
      if (user.status === "suspended" || user.status === "banned") {
        throw new Error(`Account is ${user.status}. Please contact support.`);
      }
      return { user };
    },
  },

  trustedOrigins: [
    process.env.NEXTAUTH_URL || "http://localhost:3000",
  ],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
