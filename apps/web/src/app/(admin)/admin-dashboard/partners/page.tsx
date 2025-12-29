/**
 * Admin Active Partners Page
 * Manage active partners (suspend, tier, etc.)
 */

import { DashboardDisplayArea } from "@/components/shared/layout/display-area";
import { AdminPartnersList } from "@/components/admin/partners";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Active Partners - Admin",
  description: "Manage active partners and their settings",
};

export default async function AdminPartnersPage() {
  return (
    <DashboardDisplayArea>
      <div className="p-6 md:p-10">
        <AdminPartnersList />
      </div>
    </DashboardDisplayArea>
  );
}
