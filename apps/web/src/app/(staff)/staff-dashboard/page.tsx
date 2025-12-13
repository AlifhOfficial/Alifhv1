import { requireAuth } from "@/lib/auth/roles";
import { StaffDashboardLayout } from "@/components/layouts/dashboard-layout";
import { db } from "@alifh/database";
import * as schema from "@alifh/database";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function StaffDashboard() {
  // Get authenticated user
  const user = await requireAuth();

  // Fetch partner membership with full partner details (is dealer staff)
  const membership = await db
    .select({
      partnerId: schema.partnerStaff.partnerId,
      role: schema.partnerStaff.role,
      status: schema.partnerStaff.status,
      partner: schema.partner,
    })
    .from(schema.partnerStaff)
    .leftJoin(schema.partner, eq(schema.partnerStaff.partnerId, schema.partner.id))
    .where(
      and(
        eq(schema.partnerStaff.userId, user.id),
        eq(schema.partnerStaff.status, "active")
      )
    )
    .limit(1)
    .execute();

  // If no active membership, deny access (not dealer staff)
  if (membership.length === 0) {
    redirect('/access-denied?reason=not-dealer-staff');
  }

  const staffData = membership[0];
  
  // If user is owner, redirect to partner dashboard
  if (staffData.role === 'owner') {
    redirect('/partner-dashboard');
  }

  const dealerName = staffData.partner?.brandName || "Dealership";

  // Right panel content
  const rightPanel = (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-foreground">Your Dealership</h3>
      <div className="bg-muted/20 p-3 rounded-lg">
        <p className="text-sm font-medium">{dealerName}</p>
        <p className="text-xs text-muted-foreground capitalize">{staffData.role} Role</p>
      </div>
      
      <div className="space-y-2 mt-4">
        <button className="w-full text-left px-3 py-2 bg-muted/20 rounded-lg text-sm hover:bg-muted/30 transition-colors">
          Add Vehicle
        </button>
        <button className="w-full text-left px-3 py-2 bg-muted/20 rounded-lg text-sm hover:bg-muted/30 transition-colors">
          View Leads
        </button>
      </div>
    </div>
  );

  return (
    <StaffDashboardLayout user={user} activeTab="overview" rightPanel={rightPanel}>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-l-4 border-primary p-4 bg-card rounded-lg">
          <h1 className="text-xl font-medium">Staff Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your daily tasks at {dealerName}
          </p>
        </div>

        {/* Performance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground">Your Listings</h3>
            <p className="text-2xl font-bold">8</p>
            <p className="text-xs text-muted-foreground mt-1">Active vehicles</p>
          </div>
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground">Your Leads</h3>
            <p className="text-2xl font-bold">15</p>
            <p className="text-xs text-muted-foreground mt-1">This week</p>
          </div>
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground">Sales This Month</h3>
            <p className="text-2xl font-bold">3</p>
            <p className="text-xs text-muted-foreground mt-1">Completed deals</p>
          </div>
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground">Commission</h3>
            <p className="text-2xl font-bold">$2,400</p>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 text-left bg-muted/50 rounded-lg hover:bg-muted transition-colors">
              <h3 className="font-medium">Add Vehicle Listing</h3>
              <p className="text-sm text-muted-foreground">Create a new vehicle entry</p>
            </button>
            <button className="p-4 text-left bg-muted/50 rounded-lg hover:bg-muted transition-colors">
              <h3 className="font-medium">Manage Leads</h3>
              <p className="text-sm text-muted-foreground">Follow up with customers</p>
            </button>
            <button className="p-4 text-left bg-muted/50 rounded-lg hover:bg-muted transition-colors">
              <h3 className="font-medium">Update Inventory</h3>
              <p className="text-sm text-muted-foreground">Stock management</p>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New lead assigned</p>
                <p className="text-xs text-muted-foreground">2024 Toyota Camry - 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Listing updated</p>
                <p className="text-xs text-muted-foreground">2023 Honda Accord - 5 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Sale completed</p>
                <p className="text-xs text-muted-foreground">2022 BMW 3 Series - Yesterday</p>
              </div>
            </div>
          </div>
        </div>

        {/* Your Info */}
        <div className="bg-card p-4 rounded-lg border">
          <h2 className="text-sm font-medium mb-3">Your Details</h2>
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              <span className="text-foreground font-medium">Name:</span> {user.name || 'Not provided'}
            </p>
            <p className="text-muted-foreground">
              <span className="text-foreground font-medium">Email:</span> {user.email || 'Not provided'}
            </p>
            <p className="text-muted-foreground">
              <span className="text-foreground font-medium">Role:</span> <span className="capitalize">{staffData.role}</span>
            </p>
            <p className="text-muted-foreground">
              <span className="text-foreground font-medium">Dealership:</span> {dealerName}
            </p>
          </div>
        </div>
      </div>
    </StaffDashboardLayout>
  );
}
