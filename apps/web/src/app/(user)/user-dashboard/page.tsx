import { requireAuth } from "@/lib/auth/roles";

export default async function UserDashboard() {
  const user = await requireAuth();

  return (
    <div className="space-y-6">
      <div className="border-l-4 border-primary p-4 bg-card">
        <h1 className="text-2xl font-bold mb-2">My Dashboard</h1>
        <p className="text-muted-foreground">Manage your car listings and marketplace activity.</p>
      </div>

      {/* User Activity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-sm font-medium text-muted-foreground">My Listings</h3>
          <p className="text-2xl font-bold">3</p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-sm font-medium text-muted-foreground">Active Chats</h3>
          <p className="text-2xl font-bold">5</p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-sm font-medium text-muted-foreground">Saved Cars</h3>
          <p className="text-2xl font-bold">12</p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-sm font-medium text-muted-foreground">Inquiries Sent</h3>
          <p className="text-2xl font-bold">8</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="p-4 text-left bg-muted/50 rounded-lg hover:bg-muted transition-colors">
            <h3 className="font-medium">Sell Your Car</h3>
            <p className="text-sm text-muted-foreground">Create a new listing</p>
          </button>
          <button className="p-4 text-left bg-muted/50 rounded-lg hover:bg-muted transition-colors">
            <h3 className="font-medium">Browse Cars</h3>
            <p className="text-sm text-muted-foreground">Find your next vehicle</p>
          </button>
          <button className="p-4 text-left bg-muted/50 rounded-lg hover:bg-muted transition-colors">
            <h3 className="font-medium">Messages</h3>
            <p className="text-sm text-muted-foreground">Chat with dealers and sellers</p>
          </button>
        </div>
      </div>

      {user && (
        <div className="bg-card p-4 rounded-lg border">
          <h2 className="text-lg font-semibold mb-2">Your Profile</h2>
          <div className="space-y-2">
            <p><strong>Name:</strong> {user.name || 'Not provided'}</p>
            <p><strong>Email:</strong> {user.email || 'Not provided'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
