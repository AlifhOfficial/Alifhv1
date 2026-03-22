/**
 * Admin Users Page
 * Manage user accounts and view user details
 */

import { DashboardDisplayArea } from "@/components/shared/layout/display-area";
import { AdminUsersList } from "@/components/admin/users/admin-users-list";

export default function AdminUsersPage() {
  return (
    <DashboardDisplayArea>
      <div className="p-6 md:p-10">
        <AdminUsersList />
      </div>
    </DashboardDisplayArea>
  );
}
