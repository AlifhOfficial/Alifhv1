import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins/magic-link";
import { db } from "@alifh/database";
import * as schema from "@alifh/database";
import { eq } from "drizzle-orm";
import { emailService } from "@/lib/email";

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
    sendResetPassword: async ({ user, url, token }, request) => {
      // Double-check user exists (should already be validated by Better Auth)
      const existingUsers = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, user.email))
        .limit(1)
        .execute();
      
      if (!existingUsers || existingUsers.length === 0) {
        console.log("🚫 Password reset request for non-existent user:", user.email);
        throw new Error("No account found with this email address.");
      }

      console.log("📧 Sending password reset to existing user:", user.email);
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
      sendMagicLink: async ({ email, url, token }, ctx) => {
        // Check if user exists before sending magic link
        const existingUsers = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.email, email))
          .limit(1)
          .execute();
        
        if (!existingUsers || existingUsers.length === 0) {
          console.log("🚫 Magic link request for non-existent user:", email);
          throw new Error("No account found with this email address. Magic links are only available for existing users.");
        }

        const user = existingUsers[0];
        console.log("� Sending magic link to existing user:", email);
        console.log("🔗 Magic link URL:", url);
        console.log("🔗 Token:", token);
        
        await emailService.sendMagicLink({ 
          user: { email: user.email, name: user.name || email.split('@')[0] }, 
          url, 
          token 
        });
      },
      expiresIn: 60 * 10, // 10 minutes
      disableSignUp: true, // Only allow existing users to use magic link
    }),
  ],

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
