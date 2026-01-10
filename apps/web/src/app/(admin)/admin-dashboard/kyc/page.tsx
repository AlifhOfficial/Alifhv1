/**
 * Admin KYC Management Page
 * 
 * View and manage KYC verification requests
 * Approve or reject user identity verifications
 */

'use client';

import { DashboardDisplayArea } from "@/components/shared/layout/display-area";
import { AdminKycList } from "@/components/admin/kyc/admin-kyc-list";

export default function AdminKycPage() {
  return (
    <DashboardDisplayArea>
      <div className="p-6 md:p-10">
        <AdminKycList />
      </div>
    </DashboardDisplayArea>
  );
}
