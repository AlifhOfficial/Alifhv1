export default async function UserDashboard() {
  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your dashboard overview</p>
      </header>
      
      <div className="space-y-6">
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-medium mb-3">Overview</h2>
          <p className="text-muted-foreground">
            Your dashboard is ready. Use the navigation on the left to explore different sections.
          </p>
        </div>
        
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-medium mb-3">Quick Actions</h2>
          <p className="text-muted-foreground">
            Activity and updates will appear here as they become available.
          </p>
        </div>
      </div>
    </div>
  );
}
