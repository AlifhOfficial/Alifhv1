import { DashboardDisplayArea } from "@/components/dashboard-components/display-area";
import { requireRole } from "@/lib/auth/roles";
import { db } from "@alifh/database";
import * as schema from "@alifh/database";
import { eq, count, and, sql } from "drizzle-orm";

export default async function AdminDashboardPage() {
  const user = await requireRole("admin");

  // Fetch real statistics
  const [
    totalUsers,
    kycPending,
    partnersStats,
    partnerRequests,
  ] = await Promise.all([
    db.select({ count: count() }).from(schema.user),
    db.select({ count: count() }).from(schema.kycRecord).where(eq(schema.kycRecord.status, "pending")),
    db.select({
      total: count(),
      active: sql<number>`count(*) filter (where ${schema.partner.status} = 'active')`,
      pending: sql<number>`count(*) filter (where ${schema.partner.status} = 'pending')`,
    }).from(schema.partner),
    db.select({ count: count() }).from(schema.partnerRequest).where(eq(schema.partnerRequest.status, "pending")),
  ]);

  const stats = {
    totalUsers: totalUsers[0]?.count ?? 0,
    kycPending: kycPending[0]?.count ?? 0,
    activePartners: Number(partnersStats[0]?.active ?? 0),
    totalPartners: partnersStats[0]?.total ?? 0,
    pendingPartners: Number(partnersStats[0]?.pending ?? 0),
    partnerRequests: partnerRequests[0]?.count ?? 0,
  };

  return (
    <DashboardDisplayArea
      title="Admin Dashboard"
      description="Welcome back to the Alifh admin panel"
    >
      <div className="p-6 md:p-10">
        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-2">Pending KYC</div>
            <div className="text-2xl font-semibold text-foreground">{stats.kycPending}</div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-2">Total Users</div>
            <div className="text-2xl font-semibold text-foreground">{stats.totalUsers}</div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-2">Active Partners</div>
            <div className="text-2xl font-semibold text-foreground">{stats.activePartners}</div>
            <div className="text-xs text-muted-foreground mt-1">of {stats.totalPartners} total</div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-2">Partner Requests</div>
            <div className="text-2xl font-semibold text-foreground">{stats.partnerRequests}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-foreground mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <a
              href="/admin-dashboard/kyc"
              className="bg-card border border-border rounded-lg p-6 hover:bg-muted/50 transition-colors"
            >
              <div className="text-sm font-medium text-foreground mb-2">Review KYC Requests</div>
              <div className="text-xs text-muted-foreground">{stats.kycPending} pending verifications</div>
            </a>
            
            <a
              href="/admin-dashboard/partners"
              className="bg-card border border-border rounded-lg p-6 hover:bg-muted/50 transition-colors"
            >
              <div className="text-sm font-medium text-foreground mb-2">Manage Partners</div>
              <div className="text-xs text-muted-foreground">{stats.activePartners} active partners</div>
            </a>
            
            <a
              href="/admin-dashboard/partner-requests"
              className="bg-card border border-border rounded-lg p-6 hover:bg-muted/50 transition-colors"
            >
              <div className="text-sm font-medium text-foreground mb-2">Partner Applications</div>
              <div className="text-xs text-muted-foreground">{stats.partnerRequests} pending requests</div>
            </a>
            
            <a
              href="/admin-dashboard/users"
              className="bg-card border border-border rounded-lg p-6 hover:bg-muted/50 transition-colors"
            >
              <div className="text-sm font-medium text-foreground mb-2">User Management</div>
              <div className="text-xs text-muted-foreground">{stats.totalUsers} registered users</div>
            </a>

            <a
              href="/admin-dashboard/reviews"
              className="bg-card border border-border rounded-lg p-6 hover:bg-muted/50 transition-colors"
            >
              <div className="text-sm font-medium text-foreground mb-2">Review Moderation</div>
              <div className="text-xs text-muted-foreground">Moderate partner reviews</div>
            </a>

            <a
              href="/admin-dashboard/audit-logs"
              className="bg-card border border-border rounded-lg p-6 hover:bg-muted/50 transition-colors"
            >
              <div className="text-sm font-medium text-foreground mb-2">Audit Logs</div>
              <div className="text-xs text-muted-foreground">View system activity</div>
            </a>
          </div>
        </div>
      </div>
    </DashboardDisplayArea>
  );
}
