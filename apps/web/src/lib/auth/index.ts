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
import { customSession } from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";
import { stripe } from "@better-auth/stripe";
import Twilio from "twilio";
import { db, CacheKeys, CacheTTL, eq, and, sql, setSessionCacheInvalidator, sessionCache, invalidateUserSessions } from "@alifh/database";
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

// Register session cache invalidator with database package
// This is called when profile/role updates happen - invalidates ALL caches for the user
setSessionCacheInvalidator((key) => {
  // Extract userId from key format "user:{userId}:session"
  const match = key.match(/^user:(.+):session$/);
  if (match) {
    // Invalidate by userId - clears both userId-keyed and token-keyed caches
    invalidateUserSessions(match[1]);
  } else {
    // Fallback: delete by exact key
    sessionCache.delete(key);
  }
});

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
      subscription: schema.subscription,
      userRelations: schema.userRelations,
      accountRelations: schema.accountRelations,
      sessionRelations: schema.sessionRelations,
      passkeyRelations: schema.passkeyRelations,
      subscriptionRelations: schema.subscriptionRelations,
    }
  }),

  session: {
    expiresIn: AUTH_CONFIG.SESSION.EXPIRES_IN,
    updateAge: AUTH_CONFIG.SESSION.UPDATE_AGE,
    // Cookie cache disabled - follows "Single Source of Truth = Server Memory Cache" philosophy
    // Server-side sessionCache handles caching with proper invalidation
    // See: packages/database/src/caches/README.md
    cookieCache: {
      enabled: false,
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
        // Twilio Verify generates its own code, so we ignore the `code` param
        // Try WhatsApp first (cheaper, no toll fraud, works on Wi-Fi)
        try {
          await twilioClient.verify.v2
            .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
            .verifications.create({
              to: phoneNumber,
              channel: "whatsapp",
            });
          console.log("[PhoneVerify] OTP sent via WhatsApp");
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
        console.log("[PhoneVerify] OTP sent via SMS");
      },
      // Use Twilio Verify to validate OTP - bypasses Better Auth's internal verification
      verifyOTP: async ({ phoneNumber, code }, ctx) => {
        try {
          const check = await twilioClient.verify.v2
            .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
            .verificationChecks.create({
              to: phoneNumber,
              code,
            });
          return check.status === "approved";
        } catch (error) {
          console.error("[PhoneVerify] Twilio Verify error:", error);
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
      const cacheKey = CacheKeys.userSession(user.id);
      
      // Try in-memory cache first
      const cached = sessionCache.get<{
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
        return {
          user: {
            ...user,
            ...cached,
          },
          session,
        };
      }

      // OPTIMIZED: Single SQL query with LEFT JOINs instead of 3 parallel queries
      // This reduces 3 HTTP round-trips to Neon down to 1
      const result = await db.execute<{
        role: string;
        banned: boolean;
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
        subscription_tier: string | null;
      }>(sql`
        SELECT 
          u.role, u.banned,
          p.avatar, p.first_name, p.last_name, p.preferences, p.updated_at,
          ps.id as staff_id, ps.role as staff_role,
          pt.id as partner_id, pt.brand_name, pt.status as partner_status, 
          pt.tier, pt.logo, pt.subscription_tier
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
      const userRecord = { role: firstRow.role, banned: firstRow.banned };
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
            subscriptionTier: row.subscription_tier,
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
        subscriptionTier: m.partner.subscriptionTier,
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
        hasPartnerAccess,
        isAlifhAdmin,
        partnerMemberships,
        avatar,
        avatarUrl,
        firstName: profileRecord?.firstName,
        lastName: profileRecord?.lastName,
        useGeneratedAvatar,
      };
      
      // Cache in memory for 5 minutes
      sessionCache.set(cacheKey, sessionData, CacheTTL.userSession);

      return {
        user: {
          ...user,
          ...sessionData,
        },
        session,
      };
    }),
    passkey(),
    // Stripe integration for partner subscriptions (only if configured)
    ...(isStripeConfigured ? [stripe({
      stripeClient: getStripeClient(),
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      createCustomerOnSignUp: true, // Auto-create Stripe customer for new users
      onCustomerCreate: async ({ stripeCustomer, user }) => {
        console.log(`[Stripe] Customer ${stripeCustomer.id} created for user ${user.id}`);
      },
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
          const newTier = plan.name === 'black' ? 'black' : 'standard';
          
          await db.update(schema.partner)
            .set({ 
              subscriptionTier: plan.name,
              tier: newTier as any,
              updatedAt: new Date(),
            })
            .where(eq(schema.partner.id, partnerId));
          
          console.log(`[Stripe] Partner ${partnerId} subscribed to ${plan.name} plan`);
          
          // Invalidate session cache for all partner staff so they get fresh data
          const staff = await db.query.partnerStaff.findMany({
            where: eq(schema.partnerStaff.partnerId, partnerId),
            columns: { userId: true },
          });
          for (const s of staff) {
            invalidateUserSessions(s.userId);
          }
          console.log(`[Stripe] Invalidated ${staff.length} user sessions for partner ${partnerId}`);
        },
        onSubscriptionUpdate: async ({ subscription }) => {
          console.log(`[Stripe] Subscription ${subscription.id} updated: ${subscription.status}`);
          
          // Invalidate sessions when subscription status changes
          const partnerId = subscription.referenceId;
          if (partnerId) {
            const staff = await db.query.partnerStaff.findMany({
              where: eq(schema.partnerStaff.partnerId, partnerId),
              columns: { userId: true },
            });
            for (const s of staff) {
              invalidateUserSessions(s.userId);
            }
          }
        },
        onSubscriptionCancel: async ({ subscription }) => {
          // Downgrade partner to basic tier on cancellation
          const partnerId = subscription.referenceId;
          
          await db.update(schema.partner)
            .set({ 
              subscriptionTier: 'basic',
              tier: 'standard',
              updatedAt: new Date(),
            })
            .where(eq(schema.partner.id, partnerId));
          
          console.log(`[Stripe] Partner ${partnerId} subscription cancelled`);
          
          // Invalidate session cache for all partner staff
          const staff = await db.query.partnerStaff.findMany({
            where: eq(schema.partnerStaff.partnerId, partnerId),
            columns: { userId: true },
          });
          for (const s of staff) {
            invalidateUserSessions(s.userId);
          }
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
  },

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },

  // Block banned users - uses cached session data from customSession
  // The actual ban check happens in customSession which already queries user.banned
  // This hook runs AFTER session creation, so we check sessionCache for efficiency
  denyList: {
    async check({ userId }) {
      if (!userId) return false;
      
      // Check session cache first (populated by customSession)
      const cacheKey = CacheKeys.userSession(userId);
      const cached = sessionCache.get<{ banned: boolean; banReason?: string }>(cacheKey);
      
      if (cached?.banned) {
        return {
          blocked: true,
          message: "Your account has been suspended.",
        };
      }
      
      // No cache = first sign-in, customSession will handle it
      // The proxy will block banned users on subsequent requests
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
    "http://192.168.1.14:3000",
    "http://192.168.1.14:8081",
    "exp://192.168.1.14:8081",
  ].filter(Boolean),

  advanced: {
    // Use 'lax' for OAuth state cookies to work with popup windows
    // 'strict' can cause state_mismatch errors with OAuth flows
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
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
      subscriptionTier: string | null;
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
    subscriptionTier: string | null;
    staffRole: string;
  }>;
};
