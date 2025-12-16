export const dynamic = "force-dynamic";

export default async function UserDashboard() {
  return (
    <div className="p-4 sm:p-6">
      <header className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome to your dashboard overview</p>
      </header>
      
      <div className="space-y-4 sm:space-y-6">
        <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">Overview</h2>
          <p className="text-sm text-muted-foreground">
            Your dashboard is ready. Use the navigation to explore different sections.
          </p>
        </div>
        
        <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">Quick Actions</h2>
          <p className="text-sm text-muted-foreground">
            Activity and updates will appear here as they become available.
          </p>
        </div>
      </div>
    </div>
  );
}
