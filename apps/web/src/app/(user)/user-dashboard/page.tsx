import { DashboardPageLayout } from '@/components/layout';

export const dynamic = "force-dynamic";

export default async function UserDashboard() {
  return (
    <DashboardPageLayout title="Dashboard">
      <p className="text-sm text-muted-foreground mb-6">Welcome to your dashboard overview</p>
      
      <div className="space-y-6">
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-medium mb-3">Overview</h2>
          <p className="text-sm text-muted-foreground">
            Your dashboard is ready. Use the navigation to explore different sections.
          </p>
        </div>
        
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-medium mb-3">Quick Actions</h2>
          <p className="text-sm text-muted-foreground">
            Activity and updates will appear here as they become available.
          </p>
        </div>
      </div>
    </DashboardPageLayout>
  );
}
