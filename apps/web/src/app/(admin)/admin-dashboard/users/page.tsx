/**
 * Admin Users Page
 * Manage user accounts and view user details
 */

import { DashboardDisplayArea } from "@/components/dashboard-components/display-area";
import { AdminUsersList } from "@/components/admin/users/admin-users-list";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "User Management - Admin",
  description: "Manage user accounts and view user details",
};

export default async function AdminUsersPage() {
  return (
    <DashboardDisplayArea
      title="User Management"
      description="View and manage all user accounts"
    >
      <div className="p-6 md:p-10">
        <AdminUsersList />
      </div>
    </DashboardDisplayArea>
  );
}
