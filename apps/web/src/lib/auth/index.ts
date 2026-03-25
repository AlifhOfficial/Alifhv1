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
import { phoneNumber } from "better-auth/plugins/phone-number";
import { emailOTP } from "better-auth/plugins/email-otp";
import { bearer } from "better-auth/plugins/bearer";
import { customSession } from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";
import { stripe } from "@better-auth/stripe";
import Twilio from "twilio";
import { db, eq, and, sql } from "@alifh/database";
import * as schema from "@alifh/database";
import { UserRole } from "@/types/auth";
import { emailService } from "@/lib/email";
import { ac, roles } from "@/lib/auth/permissions";
import { AUTH_CONFIG } from "./config";
import { getStripeClient, getStripePlans } from "@/lib/stripe/config";

// Check if Stripe is configured
const isStripeConfigured = !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);

// Twilio Verify client for phone OTP
const twilioClient = Twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      account: schema.account,
      session: schema.session,
      verification: schema.verification,
      passkey: schema.passkey,
      userRelations: schema.userRelations,
      accountRelations: schema.accountRelations,
      sessionRelations: schema.sessionRelations,
      passkeyRelations: schema.passkeyRelations,
    }
  }),

  session: {
    expiresIn: AUTH_CONFIG.SESSION.EXPIRES_IN,
    updateAge: AUTH_CONFIG.SESSION.UPDATE_AGE,
    // Cookie cache: stores verified session (incl. partnerMemberships) in a signed HttpOnly cookie.
    // Eliminates DB round-trips on repeat API calls (upload-token, etc.) — ~1ms vs ~500ms.
    // Trade-off: role/membership changes take up to 5min to propagate.
    cookieCache: {
      enabled: true,
      maxAge: 300, // 5 minutes
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }) => {
      await emailService.sendPasswordReset({ user, url, token });
    },
  },

  // NOTE: emailVerification is disabled - we use emailOTP plugin instead
  // This solves cross-browser session issues by keeping user in same tab
  // emailVerification: { ... }

  plugins: [
    // Bearer token auth for mobile app (React Native can't use cookies)
    bearer(),
    // Email OTP for verification (solves cross-browser issue)
    emailOTP({
      otpLength: 6,
      expiresIn: 600, // 10 minutes
      sendVerificationOnSignUp: true,
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        await emailService.sendVerificationOTP({ email, otp, type });
      },
    }),
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
    phoneNumber({
      // Use Twilio Verify for OTP - WhatsApp first, SMS fallback
      sendOTP: async ({ phoneNumber, code }, ctx) => {
        console.log("[PhoneVerify] sendOTP called for:", phoneNumber);
        // Twilio Verify generates its own code, so we ignore the `code` param
        // Try WhatsApp first (cheaper, no toll fraud, works on Wi-Fi)
        try {
          await twilioClient.verify.v2
            .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
            .verifications.create({
              to: phoneNumber,
              channel: "whatsapp",
            });
          console.log("[PhoneVerify] OTP sent via WhatsApp to:", phoneNumber);
          return;
        } catch (whatsappError: any) {
          // WhatsApp failed - fall back to SMS
          console.log("[PhoneVerify] WhatsApp failed, falling back to SMS:", whatsappError?.message);
        }
        
        // Fallback to SMS
        await twilioClient.verify.v2
          .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
          .verifications.create({
            to: phoneNumber,
            channel: "sms",
          });
        console.log("[PhoneVerify] OTP sent via SMS to:", phoneNumber);
      },
      // Use Twilio Verify to validate OTP - bypasses Better Auth's internal verification
      verifyOTP: async ({ phoneNumber, code }, ctx) => {
        console.log("[PhoneVerify] verifyOTP called for:", phoneNumber, "code:", code);
        try {
          const check = await twilioClient.verify.v2
            .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
            .verificationChecks.create({
              to: phoneNumber,
              code,
            });
          console.log("[PhoneVerify] Verification result:", check.status, "for:", phoneNumber);
          return check.status === "approved";
        } catch (error: any) {
          // 20404 = Verification not found (expired, already verified, or too many attempts)
          if (error?.code === 20404) {
            console.warn("[PhoneVerify] Verification expired or not found for:", phoneNumber);
          } else {
            console.error("[PhoneVerify] Twilio Verify error:", error);
          }
          return false;
        }
      },
      // Validate UAE phone numbers (+971)
      phoneNumberValidator: (phone) => {
        // Accept +971 (UAE) numbers, 9 digits after country code
        const uaeRegex = /^\+971[0-9]{9}$/;
        // Also accept international format
        const intlRegex = /^\+[1-9][0-9]{6,14}$/;
        return uaeRegex.test(phone) || intlRegex.test(phone);
      },
      otpLength: 6,
      expiresIn: 600, // 10 minutes
    }),
    customSession(async ({ user, session }) => {
      // Always fetch fresh session data from DB
      // OPTIMIZED: Single SQL query with LEFT JOINs instead of 3 parallel queries
      // This reduces 3 HTTP round-trips to Neon down to 1
      const result = await db.execute<{
        role: string;
        banned: boolean;
        phone_number_verified: boolean | null;
        avatar: string | null;
        first_name: string | null;
        last_name: string | null;
        preferences: unknown | null;
        updated_at: Date | null;
        staff_id: string | null;
        staff_role: string | null;
        partner_id: string | null;
        brand_name: string | null;
        partner_status: string | null;
        tier: string | null;
        logo: string | null;
        billing_active: boolean | null;
      }>(sql`
        SELECT 
          u.role, u.banned, u.phone_number_verified,
          p.avatar, p.first_name, p.last_name, p.preferences, p.updated_at,
          ps.id as staff_id, ps.role as staff_role,
          pt.id as partner_id, pt.brand_name, pt.status as partner_status, 
          pt.tier, pt.logo, pt.billing_active
        FROM "user" u
        LEFT JOIN user_profile p ON p.user_id = u.id
        LEFT JOIN partner_staff ps ON ps.user_id = u.id AND ps.status = 'active'
        LEFT JOIN partner pt ON pt.id = ps.partner_id AND pt.status = 'active'
        WHERE u.id = ${user.id}
      `);
      
      const rows = result.rows;
      if (!rows || rows.length === 0) {
        return { user, session };
      }
      
      // First row has user + profile data
      const firstRow = rows[0];
      const userRecord = {
        role: firstRow.role,
        banned: firstRow.banned,
        phoneNumberVerified: firstRow.phone_number_verified ?? false,
      };
      const profileRecord = firstRow.avatar !== undefined ? {
        avatar: firstRow.avatar,
        firstName: firstRow.first_name,
        lastName: firstRow.last_name,
        preferences: firstRow.preferences,
        updatedAt: firstRow.updated_at,
      } : null;
      
      // Build memberships from all rows (each row is a different partnership)
      // Already filtered by status = 'active' in SQL query
      const memberships = rows
        .filter(row => row.staff_id !== null && row.partner_id !== null)
        .map(row => ({
          id: row.staff_id!,
          role: row.staff_role!,
          partner: {
            id: row.partner_id!,
            brandName: row.brand_name!,
            status: row.partner_status!,
            tier: row.tier,
            logo: row.logo,
            billingActive: row.billing_active ?? true,
          },
        }));

      const hasPartnerAccess = memberships.length > 0;
      const isAlifhAdmin = ['admin', 'super_admin'].includes(userRecord.role || 'user');
      
      const partnerMemberships = memberships.map(m => ({
        staffId: m.id,
        partnerId: m.partner.id,
        partnerName: m.partner.brandName,
        partnerLogo: m.partner.logo,
        partnerTier: m.partner.tier,
        billingActive: m.partner.billingActive,
        staffRole: m.role,
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
        phoneNumberVerified: userRecord.phoneNumberVerified,
        hasPartnerAccess,
        isAlifhAdmin,
        partnerMemberships,
        avatar,
        avatarUrl,
        firstName: profileRecord?.firstName,
        lastName: profileRecord?.lastName,
        useGeneratedAvatar,
      };

      return {
        user: {
          ...user,
          ...sessionData,
        },
        session,
      };
    }),
    passkey({
      rpID: process.env.NODE_ENV === 'production' ? 'revvup.ae' : 'localhost',
      rpName: 'Revvup',
      origin: process.env.NODE_ENV === 'production'
        ? 'https://revvup.ae'
        : null, // Falls back to request Origin header in dev
    }),
    // Stripe integration for partner subscriptions (only if configured)
    ...(isStripeConfigured ? [stripe({
      stripeClient: getStripeClient(),
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      // Don't create Stripe customer on signup - create after email verification
      // This prevents orphaned Stripe customers from unverified users
      createCustomerOnSignUp: false,
      subscription: {
        enabled: true,
        plans: getStripePlans(),
        // Only partner owners can manage subscriptions
        authorizeReference: async ({ user, referenceId, action }) => {
          console.log(`[Stripe] authorizeReference called: user=${user.id}, referenceId=${referenceId}, action=${action}`);
          
          // referenceId is partner.id - verify user is owner of this partner
          const ownership = await db.query.partnerStaff.findFirst({
            where: and(
              eq(schema.partnerStaff.userId, user.id),
              eq(schema.partnerStaff.partnerId, referenceId),
              eq(schema.partnerStaff.isOwner, true),
              eq(schema.partnerStaff.status, 'active')
            ),
          });
          
          console.log(`[Stripe] Ownership check result:`, ownership ? 'found' : 'not found');
          
          if (!ownership) {
            console.warn(`[Stripe] Unauthorized: User ${user.id} is not owner of partner ${referenceId}`);
            return false;
          }
          
          return true;
        },
        onSubscriptionComplete: async ({ subscription, plan }) => {
          // Update partner tier based on subscription plan
          const partnerId = subscription.referenceId;
          const newTier = plan.name === 'black' ? 'black' : 'flow';
          
          await db.update(schema.partner)
            .set({ 
              tier: newTier as any,
              updatedAt: new Date(),
            })
            .where(eq(schema.partner.id, partnerId));
          
          console.log(`[Stripe] Partner ${partnerId} subscribed to ${plan.name} plan`);
        },
        onSubscriptionUpdate: async ({ subscription }) => {
          console.log(`[Stripe] Subscription ${subscription.id} updated: ${subscription.status}`);
        },
        onSubscriptionCancel: async ({ subscription }) => {
          // Downgrade partner to flow tier on cancellation
          const partnerId = subscription.referenceId;
          
          await db.update(schema.partner)
            .set({ 
              tier: 'flow',
              updatedAt: new Date(),
            })
            .where(eq(schema.partner.id, partnerId));
          
          console.log(`[Stripe] Partner ${partnerId} subscription cancelled`);
        },
      },
    })] : []),
  ],

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      prompt: "select_account", // Always show account picker
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID!, // Services ID for web: ae.revvup.web.auth
      clientSecret: process.env.APPLE_CLIENT_SECRET!, // JWT generated from .p8 key
      // Apple only sends name on FIRST sign-in, and may use private relay email
      mapProfileToUser: (profile) => {
        const email = profile.email || "";
        const isPrivateEmail = email.includes("privaterelay.appleid.com");
        
        // Use Apple's provided name, or a friendly fallback
        // Avoid ugly email prefix like "j2h59vxg55"
        let name = profile.name;
        if (!name || name.trim() === "") {
          name = isPrivateEmail ? "Apple User" : email.split("@")[0] || "Apple User";
        }
        
        return {
          email,
          name,
          image: profile.picture || null,
          emailVerified: true, // Apple emails are verified
        };
      },
    },
  },

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "apple"],
    },
  },

  // Block banned users - check DB directly
  // customSession already queries user.banned on every request
  // The proxy blocks banned users via the session header
  denyList: {
    async check({ userId }) {
      if (!userId) return false;
      
      // Check DB directly for ban status
      const result = await db.execute<{ banned: boolean }>(sql`
        SELECT banned FROM "user" WHERE id = ${userId} LIMIT 1
      `);
      
      if (result.rows?.[0]?.banned) {
        return {
          blocked: true,
          message: "Your account has been suspended.",
        };
      }
      
      return false;
    },
  },

  // Don't set pages.signIn - it overrides the callbackURL parameter in OAuth flows
  // This caused the popup auth to load the entire app instead of the callback page
  pages: {
    error: "/auth/error",
  },

  // In development, dynamically allow any local network IP
  // In production, only explicit origins from env are trusted
  trustedOrigins: process.env.NODE_ENV === 'production' 
    ? [
        process.env.BETTER_AUTH_URL || "http://localhost:3000",
        "http://192.168.1.15:3000",
        process.env.NEXT_PUBLIC_NETWORK_URL || "",
        ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",").map(o => o.trim()) || []),
      ].filter(Boolean)
    : (request: Request) => {
        // Start with explicit origins from env
        const origins = [
          "http://localhost:3000",
          "http://localhost:3001",
          "http://127.0.0.1:3000",
          "http://192.168.1.15:3000",
          process.env.NEXT_PUBLIC_NETWORK_URL || "",
          ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",").map(o => o.trim()) || []),
        ].filter(Boolean);
        
        // Also extract the origin from the request and allow it if it's a local network IP
        const requestOrigin = request.headers.get('origin');
        if (requestOrigin) {
          try {
            const url = new URL(requestOrigin);
            const host = url.hostname;
            const isLocalNetwork = 
              /^192\.168\.\d{1,3}\.\d{1,3}$/.test(host) ||
              /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host) ||
              /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(host) ||
              host === 'localhost' || 
              host === '127.0.0.1';
            
            if (isLocalNetwork && !origins.includes(requestOrigin)) {
              origins.push(requestOrigin);
            }
          } catch {
            // Invalid URL, ignore
          }
        }
        
        return origins;
      },

  advanced: {
    // Use 'lax' for OAuth state cookies to work with popup windows
    // 'strict' can cause state_mismatch errors with OAuth flows
    defaultCookieAttributes: {
      sameSite: "lax",
      // Use BETTER_AUTH_URL to determine if we're actually serving over HTTPS.
      // This correctly handles: dev (http), local prod build (http), and production (https).
      // NODE_ENV alone is wrong — `bun start` is production mode but may run on http://localhost.
      secure: process.env.BETTER_AUTH_URL?.startsWith("https://") ?? false,
    },
  },

  // Database hooks - create Stripe customer on user creation (covers OAuth sign-ups)
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Only create Stripe customer if Stripe is configured
          if (!isStripeConfigured) return;
          
          try {
            const stripeClient = getStripeClient();
            
            // Check if customer already exists
            const existing = await stripeClient.customers.list({
              email: user.email,
              limit: 1,
            });
            
            let customerId: string;
            if (existing.data.length > 0) {
              customerId = existing.data[0].id;
            } else {
              const customer = await stripeClient.customers.create({
                email: user.email,
                name: user.name || undefined,
                metadata: { userId: user.id },
              });
              customerId = customer.id;
            }
            
            // Update user with Stripe customer ID
            await db.update(schema.user)
              .set({ stripeCustomerId: customerId })
              .where(eq(schema.user.id, user.id));
            
            console.log(`[Auth] Stripe customer ${customerId} created for user ${user.id}`);
          } catch (error) {
            console.error('[Auth] Failed to create Stripe customer:', error);
            // Don't throw - user creation should still succeed
          }
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session & {
  user: typeof auth.$Infer.Session.user & {
    role: UserRole;
    hasPartnerAccess?: boolean;
    partnerMemberships?: Array<{
      staffId: string;
      partnerId: string;
      partnerName: string;
      partnerLogo: string | null;
      partnerTier: string | null;
      billingActive: boolean;
      staffRole: string;
    }>;
  };
};

export type AuthUser = typeof auth.$Infer.Session.user & {
  role: UserRole;
  hasPartnerAccess?: boolean;
  partnerMemberships?: Array<{
    staffId: string;
    partnerId: string;
    partnerName: string;
    partnerLogo: string | null;
    partnerTier: string | null;
    billingActive: boolean;
    staffRole: string;
  }>;
};
