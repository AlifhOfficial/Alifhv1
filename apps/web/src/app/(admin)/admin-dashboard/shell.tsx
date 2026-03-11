'use client';

import { DashboardLayout, DashboardContent } from "@/components/shared/layout/dashboard-layout";
import { AppSidebar } from "@/components/shared/layout/app-sidebar";

interface AdminDashboardShellProps {
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
  sections: { title?: string; collapsible?: { label: string; icon: string }; items: { label: string; href: string; icon?: string }[] }[];
  children: React.ReactNode;
}

export function AdminDashboardShell({ user, sections, children }: AdminDashboardShellProps) {
  return (
    <DashboardLayout enableRightPanel>
      <AppSidebar user={user} sections={sections} />
      <DashboardContent>{children}</DashboardContent>
    </DashboardLayout>
  );
}
