import { requireRole } from "@/lib/auth/roles";

export default async function PartnerDashboard() {
  // Require partner role to access this page
  const user = await requireRole('partner');

  return (
    <div className="space-y-6">
      <div className="border-l-4 border-primary p-4 bg-card">
        <h1 className="text-2xl font-bold mb-2">Partner Dashboard</h1>
        <p className="text-muted-foreground">Manage your dealership business operations.</p>
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

      {user && (
        <div className="bg-card p-4 rounded-lg border">
          <h2 className="text-lg font-semibold mb-2">Dealership Owner</h2>
          <div className="space-y-2">
            <p><strong>Name:</strong> {user.name || 'Not provided'}</p>
            <p><strong>Email:</strong> {user.email || 'Not provided'}</p>
          </div>
        </div>
      )}
    </div>
  );
}