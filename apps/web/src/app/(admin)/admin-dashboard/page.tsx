import { DashboardDisplayArea } from "@/components/dashboard-components/display-area";
import { requireRole } from "@/lib/auth/roles";

export default async function AdminDashboardPage() {
  const user = await requireRole("admin");

  return (
    <DashboardDisplayArea
      title="Admin Dashboard"
      description="Welcome back to the Alifh admin panel"
    >
      <div className="p-6 md:p-10">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-2">Pending KYC</div>
            <div className="text-2xl font-semibold text-foreground">12</div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-2">Total Users</div>
            <div className="text-2xl font-semibold text-foreground">1,234</div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-2">Active Partners</div>
            <div className="text-2xl font-semibold text-foreground">45</div>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-sm text-muted-foreground mb-2">Active Listings</div>
            <div className="text-2xl font-semibold text-foreground">567</div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-medium text-foreground mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <a
              href="/admin-dashboard/kyc"
              className="bg-card border border-border rounded-lg p-6 hover:bg-muted/50 transition-colors"
            >
              <div className="text-sm font-medium text-foreground mb-2">Review KYC Requests</div>
              <div className="text-xs text-muted-foreground">12 pending verifications</div>
            </a>
            
            <a
              href="/admin-dashboard/partners"
              className="bg-card border border-border rounded-lg p-6 hover:bg-muted/50 transition-colors"
            >
              <div className="text-sm font-medium text-foreground mb-2">Manage Partners</div>
              <div className="text-xs text-muted-foreground">View all partner accounts</div>
            </a>
            
            <a
              href="/admin-dashboard/users"
              className="bg-card border border-border rounded-lg p-6 hover:bg-muted/50 transition-colors"
            >
              <div className="text-sm font-medium text-foreground mb-2">User Management</div>
              <div className="text-xs text-muted-foreground">Manage user accounts</div>
            </a>
          </div>
        </div>
      </div>
    </DashboardDisplayArea>
  );
}
