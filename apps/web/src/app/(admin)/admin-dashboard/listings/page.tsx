/**
 * Admin Listings Management Page
 * View and manage all listings on the platform
 */

import { DashboardDisplayArea } from "@/components/shared/layout/display-area";
import { AdminListingsView } from "@/components/admin/listings/admin-listings-view";

export default function AdminListingsPage() {

  return (
    <DashboardDisplayArea>
      <div className="p-6 regular:p-10">
        <AdminListingsView />
      </div>
    </DashboardDisplayArea>
  );
}
