'use client';

import { DashboardLayout, DashboardContent } from "@/components/shared/layout/dashboard-layout";
import { AppSidebar } from "@/components/shared/layout/app-sidebar";

interface PartnerDashboardShellProps {
  user: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
    useGeneratedAvatar?: boolean | null;
  };
  sections: { title?: string; items: { label: string; href: string; icon: string }[] }[];
  staffOverride: {
    companyLogo?: string | null;
    companyName?: string | null;
  };
  children: React.ReactNode;
}

export function PartnerDashboardShell({ user, sections, staffOverride, children }: PartnerDashboardShellProps) {
  return (
    <DashboardLayout enableRightPanel>
      <AppSidebar user={user} sections={sections} staffOverride={staffOverride} />
      <DashboardContent>{children}</DashboardContent>
    </DashboardLayout>
  );
}
