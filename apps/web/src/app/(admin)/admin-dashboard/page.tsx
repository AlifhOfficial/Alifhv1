import { DashboardDisplayArea } from "@/components/dashboard-components/display-area";
import { db } from "@alifh/database";
import * as schema from "@alifh/database";
import { eq, count } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Auth handled by layout

  // Fetch real statistics
  const [
    totalUsers,
    kycPending,
  ] = await Promise.all([
    db.select({ count: count() }).from(schema.user),
    db.select({ count: count() }).from(schema.kycRecord).where(eq(schema.kycRecord.status, "pending")),
  ]);

  const stats = {
    totalUsers: totalUsers[0]?.count ?? 0,
    kycPending: kycPending[0]?.count ?? 0,
  };

  return (
    <DashboardDisplayArea
      title="Admin Dashboard"
      description="Welcome back to the Alifh admin panel"
    >
      <div className="p-6 md:p-10">
        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-2">Pending KYC</div>
            <div className="text-2xl font-semibold text-foreground">{stats.kycPending}</div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-2">Total Users</div>
            <div className="text-2xl font-semibold text-foreground">{stats.totalUsers}</div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mt-8">
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <h2 className="text-xl font-medium text-foreground mb-2">Admin Dashboard</h2>
            <p className="text-muted-foreground">System overview and management tools</p>
          </div>
        </div>
      </div>
    </DashboardDisplayArea>
  );
}
