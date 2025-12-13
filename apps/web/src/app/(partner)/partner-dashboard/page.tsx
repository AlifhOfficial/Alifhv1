import { requireRole } from "@/lib/auth/roles";
import { PartnerDashboardLayout } from "@/components/layouts/dashboard-layout";

export default async function PartnerDashboard() {
  const user = await requireRole('partner');

  // Right panel content
  const rightPanel = (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-foreground">Quick Actions</h3>
      <div className="space-y-2">
        <button className="w-full text-left px-3 py-2 bg-muted/20 rounded-lg text-sm hover:bg-muted/30 transition-colors">
          Add New Listing
        </button>
        <button className="w-full text-left px-3 py-2 bg-muted/20 rounded-lg text-sm hover:bg-muted/30 transition-colors">
          View Inquiries
        </button>
      </div>
    </div>
  );

  return (
    <PartnerDashboardLayout user={user} activeTab="overview" rightPanel={rightPanel}>
      <div className="space-y-6">
        <div className="border-l-4 border-primary p-4 bg-card rounded-lg">
          <h1 className="text-xl font-medium">Partner Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your dealership business operations.</p>
        </div>

      {/* Business Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-sm font-medium text-muted-foreground">Total Listings</h3>
          <p className="text-2xl font-bold">24</p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-sm font-medium text-muted-foreground">Active Inquiries</h3>
          <p className="text-2xl font-bold">12</p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-sm font-medium text-muted-foreground">This Month Sales</h3>
          <p className="text-2xl font-bold">8</p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-sm font-medium text-muted-foreground">Revenue</h3>
          <p className="text-2xl font-bold">$45,600</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 text-left bg-muted/50 rounded-lg hover:bg-muted transition-colors">
            <h3 className="font-medium">Add New Listing</h3>
            <p className="text-sm text-muted-foreground">List a new vehicle for sale</p>
          </button>
          <button className="p-4 text-left bg-muted/50 rounded-lg hover:bg-muted transition-colors">
            <h3 className="font-medium">Manage Staff</h3>
            <p className="text-sm text-muted-foreground">Add or remove team members</p>
          </button>
          <button className="p-4 text-left bg-muted/50 rounded-lg hover:bg-muted transition-colors">
            <h3 className="font-medium">View Analytics</h3>
            <p className="text-sm text-muted-foreground">Business performance metrics</p>
          </button>
        </div>
      </div>

      <div className="bg-card p-4 rounded-lg border">
        <h2 className="text-sm font-medium mb-3">Account Details</h2>
        <div className="space-y-2 text-sm">
          <p className="text-muted-foreground"><span className="text-foreground font-medium">Name:</span> {user.name || 'Not provided'}</p>
          <p className="text-muted-foreground"><span className="text-foreground font-medium">Email:</span> {user.email || 'Not provided'}</p>
        </div>
      </div>
      </div>
    </PartnerDashboardLayout>
  );
}
