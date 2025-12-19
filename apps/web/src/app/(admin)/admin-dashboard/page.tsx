import { DashboardDisplayArea } from "@/components/dashboard-components/display-area";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // TODO: Build admin dashboard with proper API endpoints
  // No direct database access allowed in presentation layer
  
  return (
    <DashboardDisplayArea
      title="Admin Dashboard"
      description="Welcome back to the Alifh admin panel"
    >
      <div className="p-6 md:p-10">
        {/* Welcome Message */}
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <h2 className="text-xl font-medium text-foreground mb-2">Admin Dashboard</h2>
          <p className="text-muted-foreground">System overview and management tools</p>
          <p className="text-sm text-muted-foreground mt-4">Coming soon...</p>
        </div>
      </div>
    </DashboardDisplayArea>
  );
}
