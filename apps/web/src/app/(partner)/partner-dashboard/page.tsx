import { requireAuth } from "@/lib/auth/roles";
import { DashboardDisplayArea } from "@/components/dashboard-components/display-area";

export default async function PartnerDashboard() {
  const user = await requireAuth();

  return (
    <DashboardDisplayArea
      title="Partner Dashboard"
      description="Welcome to your partner dashboard"
    >
      <div className="p-6 md:p-10">
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <h2 className="text-xl font-medium text-foreground mb-2">Partner Dashboard</h2>
          <p className="text-muted-foreground">Your partner management portal</p>
        </div>
      </div>
    </DashboardDisplayArea>
  );
}
