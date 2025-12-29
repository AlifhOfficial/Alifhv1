/**
 * Admin Partner Requests Page
 * Review and approve/reject partner applications
 */

import { DashboardDisplayArea } from "@/components/shared/layout/display-area";
import { PartnerRequestAdminList } from "@/components/partner";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Partner Requests - Admin",
  description: "Review and manage partner applications",
};

export default async function AdminPartnerRequestsPage() {
  return (
    <DashboardDisplayArea>
      <div className="p-6 md:p-10">
        <PartnerRequestAdminList />
      </div>
    </DashboardDisplayArea>
  );
}
