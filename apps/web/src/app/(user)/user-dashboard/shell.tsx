'use client';

import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { DashboardLayout, DashboardContent } from "@/components/shared/layout/dashboard-layout";
import { AppSidebar } from "@/components/shared/layout/app-sidebar";
import { PageLoader } from "@/components/shared/page-loader";

interface UserDashboardShellProps {
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
  children: React.ReactNode;
}

export function UserDashboardShell({ user, sections, children }: UserDashboardShellProps) {
  return (
    <Suspense fallback={<PageLoader />}>
      <UserDashboardShellInner user={user} sections={sections}>
        {children}
      </UserDashboardShellInner>
    </Suspense>
  );
}

function UserDashboardShellInner({ user, sections, children }: UserDashboardShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isFullHeightPage = pathname?.includes('/messaging');
  const hasConversationOpen = isFullHeightPage && !!searchParams?.get('conversationId');

  return (
    <DashboardLayout enableRightPanel>
      <AppSidebar user={user} sections={sections} />
      <DashboardContent fullHeight={isFullHeightPage} hideFooterOnMobile={hasConversationOpen}>
        {children}
      </DashboardContent>
    </DashboardLayout>
  );
}
