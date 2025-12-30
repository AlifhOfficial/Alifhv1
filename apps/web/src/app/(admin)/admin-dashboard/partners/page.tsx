/**
 * Admin Active Partners Page
 * Manage active partners (suspend, tier, etc.)
 */

'use client';

import { DashboardDisplayArea } from "@/components/shared/layout/display-area";
import { AdminPartnersList } from "@/components/admin/partners";

export default function AdminPartnersPage() {
  return (
    <DashboardDisplayArea>
      <div className="p-6 md:p-10">
        <AdminPartnersList />
      </div>
    </DashboardDisplayArea>
  );
}
