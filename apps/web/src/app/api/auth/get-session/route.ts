import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { AUTH_CONFIG } from "@/lib/auth/config";
import { db } from "@alifh/database";
import * as schema from "@alifh/database";
import { eq, and } from "drizzle-orm";

// TODO: Replace in-memory rate limiting with edge-based solution
//
// ISSUES WITH CURRENT IN-MEMORY RATE LIMITING:
// - Does not work across multiple server instances
// - Memory not shared between edge functions
// - Can be bypassed by distributing requests across instances
// - Manual bucket management and cleanup required
//
// RECOMMENDED SOLUTIONS:
// 1. Vercel Edge Config + Rate Limiting
//    - Built-in rate limiting at edge level
//    - Works before request hits your API
//    - No code changes needed, just config
//
// 2. Upstash Rate Limiting (@upstash/ratelimit)
//    - Serverless Redis-based rate limiting
//    - import { Ratelimit } from '@upstash/ratelimit'
//    - const ratelimit = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(60, '1m') })
//    - const { success } = await ratelimit.limit(identifier)
//
// 3. Vercel Firewall / WAF
//    - Platform-level DDoS protection
//    - Rate limiting at CDN edge
//    - No application code needed
//
// 4. Cloudflare Rate Limiting
//    - If using Cloudflare as CDN
//    - Configure rate limits in dashboard
//    - Applied before reaching origin server

// Use centralized config values
const RATE_LIMIT_WINDOW_MS = AUTH_CONFIG.RATE_LIMIT.WINDOW_MS;
const RATE_LIMIT_MAX_REQUESTS = AUTH_CONFIG.RATE_LIMIT.MAX_REQUESTS;

type RateLimitBucket = {
  count: number;
  expiresAt: number;
};

const globalForRateLimit = globalThis as typeof globalThis & {
  __alifhGetSessionRateLimit?: Map<string, RateLimitBucket>;
};

const rateLimitBuckets =
  globalForRateLimit.__alifhGetSessionRateLimit ??
  (globalForRateLimit.__alifhGetSessionRateLimit = new Map<string, RateLimitBucket>());

const isDev = process.env.NODE_ENV !== "production";

function getClientIdentifier(request: NextRequest): string {
  const xfwd = request.headers.get("x-forwarded-for");
  if (xfwd) return xfwd.split(",")[0]?.trim() ?? "unknown";
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp;
  return "unknown";
}

function checkRateLimit(identifier: string) {
  const now = Date.now();
  const existing = rateLimitBuckets.get(identifier);
  if (!existing || existing.expiresAt <= now) {
    rateLimitBuckets.set(identifier, {
      count: 1,
      expiresAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  existing.count += 1;
  rateLimitBuckets.set(identifier, existing);
  return true;
}

function logStructured(event: string, payload: Record<string, unknown>) {
  const message = JSON.stringify({ event, ...payload });
  if (isDev) {
    // eslint-disable-next-line no-console
    console.debug("[get-session]", message);
  } else {
    // eslint-disable-next-line no-console
    console.info(message);
  }
}

export async function GET(request: NextRequest) {
  try {
    const clientIdentifier = getClientIdentifier(request);

    if (!checkRateLimit(clientIdentifier)) {
      logStructured("auth.session.rate_limited", { clientIdentifier });
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: {
            "retry-after": String(RATE_LIMIT_WINDOW_MS / 1000),
          },
        }
      );
    }

    const startTime = Date.now();

    // Get session from Better Auth using the request headers
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      logStructured("auth.session.missing", { clientIdentifier });
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Better Auth's api.getSession() does NOT call fetchUser automatically
    // We need to manually load the extended user data (partner memberships)
    const userId = session.user.id;
    
    // OPTIMIZED: Load user with role AND partner memberships in a single query
    const userRecord = await db.query.user.findFirst({
      where: eq(schema.user.id, userId),
      columns: {
        id: true,
        role: true,
        banned: true,
      },
      // Join partner memberships in the same query to avoid N+1
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
      logStructured("auth.session.user_not_found", { clientIdentifier, userId });
      return NextResponse.json(
        { error: "User not found" },
        { status: 401 }
      );
    }

    // Filter only memberships to active partners (done in memory, already loaded)
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

    const extendedUser = {
      ...session.user,
      role: userRecord.role,
      banned: userRecord.banned,
      hasPartnerAccess,
      isAlifhAdmin,
      partnerMemberships,
    };

    logStructured("auth.session.extended", {
      clientIdentifier,
      userId: extendedUser.id,
      role: extendedUser.role,
      hasPartnerAccess: extendedUser.hasPartnerAccess,
      isAlifhAdmin: extendedUser.isAlifhAdmin,
      partnershipCount: extendedUser.partnerMemberships?.length ?? 0,
      durationMs: Date.now() - startTime,
    });

    // Return the FULL extended session data - manually loaded partner memberships
    // The middleware depends on these fields for routing decisions
    const sessionUser = session.user as any;
    
    return NextResponse.json(
      {
        user: {
          id: extendedUser.id,
          email: extendedUser.email,
          name: extendedUser.name,
          avatar: sessionUser.avatar,
          avatarUrl: sessionUser.avatarUrl,
          emailVerified: extendedUser.emailVerified,
          createdAt: extendedUser.createdAt,
          updatedAt: extendedUser.updatedAt,
          // Explicitly pass the role from database
          role: extendedUser.role || 'user',
          banned: sessionUser.banned ?? false,
          banReason: sessionUser.banReason,
          banExpires: sessionUser.banExpires,
          // Extended fields - manually loaded from partner_staff table
          hasPartnerAccess: extendedUser.hasPartnerAccess,
          isAlifhAdmin: extendedUser.isAlifhAdmin,
          partnerMemberships: extendedUser.partnerMemberships,
        },
        session: session.session,
      },
      {
        status: 200,
        headers: {
          // Cache for 60s to reduce duplicate session fetches
          // Use private cache (browser only, not CDN)
          'Cache-Control': 'private, max-age=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    console.error("[get-session] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
