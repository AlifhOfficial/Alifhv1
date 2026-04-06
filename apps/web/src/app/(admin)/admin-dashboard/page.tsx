/**
 * Admin Dashboard Page
 * Main admin dashboard with statistics and overview
 */

import { DashboardDisplayArea } from "@/components/shared/layout/display-area";
import { AdminDashboardStats } from "@/components/admin/admin-dashboard-stats";

export default function AdminDashboardPage() {
  return (
    <DashboardDisplayArea>
      <div className="p-6 regular:p-10">
        <AdminDashboardStats />
      </div>
    </DashboardDisplayArea>
  );
}
