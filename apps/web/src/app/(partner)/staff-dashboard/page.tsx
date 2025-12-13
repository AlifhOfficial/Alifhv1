import { requireRole } from "@/lib/auth/roles";

export default async function StaffDashboard() {
  const user = await requireRole('staff');

  return (
    <div className="space-y-6">
      <div className="border-l-4 border-primary p-4 bg-card">
        <h1 className="text-2xl font-bold mb-2">Staff Dashboard</h1>
        <p className="text-muted-foreground">Handle customer inquiries and manage bookings.</p>
      </div>

      {/* Staff Activity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-sm font-medium text-muted-foreground">Pending Inquiries</h3>
          <p className="text-2xl font-bold">7</p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-sm font-medium text-muted-foreground">Today's Bookings</h3>
          <p className="text-2xl font-bold">3</p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-sm font-medium text-muted-foreground">Follow-ups Due</h3>
          <p className="text-2xl font-bold">5</p>
        </div>
      </div>

      {/* Customer Service Tools */}
      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">Customer Service</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="p-4 text-left bg-muted/50 rounded-lg hover:bg-muted transition-colors">
            <h3 className="font-medium">Customer Inquiries</h3>
            <p className="text-sm text-muted-foreground">Respond to customer messages</p>
          </button>
          <button className="p-4 text-left bg-muted/50 rounded-lg hover:bg-muted transition-colors">
            <h3 className="font-medium">Book Test Drive</h3>
            <p className="text-sm text-muted-foreground">Schedule customer appointments</p>
          </button>
          <button className="p-4 text-left bg-muted/50 rounded-lg hover:bg-muted transition-colors">
            <h3 className="font-medium">Vehicle Inventory</h3>
            <p className="text-sm text-muted-foreground">View available vehicles</p>
          </button>
          <button className="p-4 text-left bg-muted/50 rounded-lg hover:bg-muted transition-colors">
            <h3 className="font-medium">Customer History</h3>
            <p className="text-sm text-muted-foreground">View customer interactions</p>
          </button>
        </div>
      </div>

      {user && (
        <div className="bg-card p-4 rounded-lg border">
          <h2 className="text-lg font-semibold mb-2">Staff Member</h2>
          <div className="space-y-2">
            <p><strong>Name:</strong> {user.name || 'Not provided'}</p>
            <p><strong>Email:</strong> {user.email || 'Not provided'}</p>
          </div>
        </div>
      )}
    </div>
  );
}