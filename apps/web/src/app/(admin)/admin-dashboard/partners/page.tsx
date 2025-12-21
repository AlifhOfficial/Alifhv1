/**
 * Admin Partners Page
 * Manage partner applications and approvals
 */

import { DashboardDisplayArea } from "@/components/dashboard-components/display-area";
import { PartnerRequestAdminList } from "@/components/partner";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Partner Applications - Admin",
  description: "Manage partner applications and approvals",
};

export default async function AdminPartnersPage() {
  return (
    <DashboardDisplayArea
      title="Partner Applications"
      description="Review and manage partner applications"
    >
      <div className="p-6 md:p-10">
        <PartnerRequestAdminList />
      </div>
    </DashboardDisplayArea>
  );
}
