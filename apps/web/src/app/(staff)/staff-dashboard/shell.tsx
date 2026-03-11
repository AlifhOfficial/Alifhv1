'use client';

import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { DashboardLayout, DashboardContent } from "@/components/shared/layout/dashboard-layout";
import { AppSidebar } from "@/components/shared/layout/app-sidebar";
import { PageLoader } from "@/components/shared/page-loader";

interface StaffDashboardShellProps {
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

export function StaffDashboardShell({ user, sections, staffOverride, children }: StaffDashboardShellProps) {
  return (
    <Suspense fallback={<PageLoader />}>
      <StaffDashboardShellInner user={user} sections={sections} staffOverride={staffOverride}>
        {children}
      </StaffDashboardShellInner>
    </Suspense>
  );
}

function StaffDashboardShellInner({ user, sections, staffOverride, children }: StaffDashboardShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Check if current page needs full height (no padding, full container)
  const isFullHeightPage = pathname?.includes('/messaging');
  // Only hide footer on mobile when a conversation is actually open
  const hasConversationOpen = isFullHeightPage && !!searchParams?.get('conversationId');

  return (
    <DashboardLayout enableRightPanel>
      <AppSidebar user={user} sections={sections} staffOverride={staffOverride} />
      <DashboardContent fullHeight={isFullHeightPage} hideFooterOnMobile={hasConversationOpen}>
        {children}
      </DashboardContent>
    </DashboardLayout>
  );
}
