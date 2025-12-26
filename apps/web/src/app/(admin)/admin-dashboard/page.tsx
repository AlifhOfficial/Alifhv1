/**
 * Admin Dashboard Page
 * Main admin dashboard with statistics and overview
 */

import { DashboardDisplayArea } from "@/components/dashboard-components/display-area";
import { AdminDashboardStats } from "@/components/admin/admin-dashboard-stats";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard with system statistics and overview",
};

export default async function AdminDashboardPage() {
  return (
    <DashboardDisplayArea>
      <div className="p-6 md:p-10">
        <AdminDashboardStats />
      </div>
    </DashboardDisplayArea>
  );
}
