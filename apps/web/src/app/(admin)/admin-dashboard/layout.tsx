'use client';

import { DashboardLayout, DashboardContent } from "@/components/shared/layout/dashboard-layout";
import { AppSidebar } from "@/components/shared/layout/app-sidebar";
import { PageLoader } from "@/components/shared/page-loader";
import { useAuth } from "@/providers/auth-provider";

const navSections = [
  {
    items: [
      { label: "Overview", href: "/admin-dashboard", icon: "layout-dashboard" },
    ]
  },
  {
    collapsible: { label: "Content", icon: "file-text" },
    items: [
      { label: "Listings", href: "/admin-dashboard/listings" },
      { label: "Reviews", href: "/admin-dashboard/reviews" },
    ]
  },
  {
    collapsible: { label: "Partners", icon: "building" },
    items: [
      { label: "Active Partners", href: "/admin-dashboard/partners" },
      { label: "Partner Requests", href: "/admin-dashboard/partner-requests" },
    ]
  },
  {
    collapsible: { label: "Users", icon: "users" },
    items: [
      { label: "All Users", href: "/admin-dashboard/users" },
      { label: "Ban Appeals", href: "/admin-dashboard/ban-appeals" },
      { label: "KYC Management", href: "/admin-dashboard/kyc" },
      { label: "Feedback", href: "/admin-dashboard/feedback" },
      { label: "Communications", href: "/admin-dashboard/communications" },
    ]
  },
  {
    collapsible: { label: "System", icon: "settings" },
    items: [
      { label: "Audit Logs", href: "/admin-dashboard/audit-logs" },
    ]
  },
];

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();
  
  if (isLoading) {
    return <PageLoader />;
  }
  
  if (!session) {
    if (typeof window !== 'undefined') {
      window.location.href = '/access-denied?reason=not-authenticated';
    }
    return <PageLoader />;
  }

  return (
    <DashboardLayout enableRightPanel>
      <AppSidebar user={session as any} sections={navSections} />
      <DashboardContent>{children}</DashboardContent>
    </DashboardLayout>
  );
}
