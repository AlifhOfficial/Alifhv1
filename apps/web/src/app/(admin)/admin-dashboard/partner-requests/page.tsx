/**
 * Admin Partner Requests Page
 * Review and approve/reject partner applications
 */

import { DashboardDisplayArea } from "@/components/shared/layout/display-area";
import { PartnerRequestAdminList } from "@/components/partner/partner-request/partner-request-admin-list";

export default function PartnerRequestsPage() {
  return (
    <DashboardDisplayArea>
      <div className="p-6 md:p-10">
        <PartnerRequestAdminList />
      </div>
    </DashboardDisplayArea>
  );
}
