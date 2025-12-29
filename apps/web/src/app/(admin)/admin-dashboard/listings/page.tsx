/**
 * Admin Listings Management Page
 * View and manage all listings on the platform
 */

import { DashboardDisplayArea } from "@/components/shared/layout/display-area";
import { requireRole } from "@/lib/auth/roles";
import { AdminListingsView } from "@/components/admin/listings/admin-listings-view";

export const dynamic = "force-dynamic";

export default async function AdminListingsPage() {
  await requireRole("admin");

  return (
    <DashboardDisplayArea>
      <div className="p-6 md:p-10">
        <AdminListingsView />
      </div>
    </DashboardDisplayArea>
  );
}
