/**
 * Admin Dashboard Page
 * Main admin dashboard with statistics and overview
 */

'use client';

import { DashboardDisplayArea } from "@/components/shared/layout/display-area";
import { AdminDashboardStats } from "@/components/admin/admin-dashboard-stats";

export default function AdminDashboardPage() {
  return (
    <DashboardDisplayArea>
      <div className="p-6 md:p-10">
        <AdminDashboardStats />
      </div>
    </DashboardDisplayArea>
  );
}
