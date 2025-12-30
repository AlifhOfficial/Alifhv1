/**
 * Admin Partner Requests Page
 * Review and approve/reject partner applications
 */

'use client';

import { DashboardDisplayArea } from "@/components/shared/layout/display-area";
import { PartnerRequestAdminList } from "@/components/partner";

export default function PartnerRequestsPage() {
  return (
    <DashboardDisplayArea>
      <div className="p-6 md:p-10">
        <PartnerRequestAdminList />
      </div>
    </DashboardDisplayArea>
  );
}
