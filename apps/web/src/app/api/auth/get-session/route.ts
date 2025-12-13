import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@alifh/database";
import * as schema from "@alifh/database";
import { eq, and } from "drizzle-orm";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 60;

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

function sanitizePermissions(permissions: unknown) {
  const fallback = {
    manageListings: false,
    manageTeam: false,
    viewAnalytics: false,
    manageBookings: false,
    respondToLeads: false,
    manageFinancials: false,
    manageSettings: false,
    exportData: false,
  };

  type PermissionKeys = keyof typeof fallback;
  const keys = Object.keys(fallback) as PermissionKeys[];

  if (!permissions || typeof permissions !== "object") {
    return { ...fallback };
  }

  const record = permissions as Record<string, unknown>;
  return keys.reduce((acc, key) => {
    acc[key] = Boolean(record[key]);
    return acc;
  }, { ...fallback });
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

    const userId = session.user.id;

    // Manually load partner memberships (since Better Auth doesn't persist custom fields)
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
    const isAlifhAdmin = ['admin', 'super_admin'].includes(session.user.role as string);
    
    // Map to PartnerMembership type
    const partnerMemberships = activePartnerships.map(m => ({
      staffId: m.id,
      partnerId: m.partner.id,
      partnerName: m.partner.brandName,
      partnerTier: m.partner.tier,
      staffRole: m.role,
      permissions: sanitizePermissions(m.permissions),
    }));

    // Extend user with computed fields
    const extendedUser = {
      ...session.user,
      hasPartnerAccess,
      isAlifhAdmin,
      partnerMemberships,
    };

    logStructured("auth.session.extended", {
      clientIdentifier,
      userId: extendedUser.id,
      role: extendedUser.role,
      hasPartnerAccess: extendedUser.hasPartnerAccess ?? false,
      isAlifhAdmin: extendedUser.isAlifhAdmin ?? false,
      partnershipCount: extendedUser.partnerMemberships?.length ?? 0,
      durationMs: Date.now() - startTime,
    });

    // Return the extended session data
    return NextResponse.json({
      user: extendedUser,
      session: session.session,
    });
  } catch (error) {
    console.error("[get-session] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
