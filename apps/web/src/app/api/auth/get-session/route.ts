import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@alifh/database";
import * as schema from "@alifh/database";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Get session from Better Auth using the request headers
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
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
      permissions: m.permissions,
    }));

    // Extend user with computed fields
    const extendedUser = {
      ...session.user,
      hasPartnerAccess,
      isAlifhAdmin,
      partnerMemberships,
    };

    console.log('[get-session API] Extended session data:', {
      userId: extendedUser.id,
      email: extendedUser.email,
      role: extendedUser.role,
      hasPartnerAccess: extendedUser.hasPartnerAccess,
      isAlifhAdmin: extendedUser.isAlifhAdmin,
      partnershipCount: extendedUser.partnerMemberships?.length || 0,
      partnerMemberships: extendedUser.partnerMemberships,
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
