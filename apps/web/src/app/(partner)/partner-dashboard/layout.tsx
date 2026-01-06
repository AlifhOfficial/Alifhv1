'use client';

import { DashboardLayout, DashboardContent } from "@/components/shared/layout/dashboard-layout";
import { AppSidebar } from "@/components/shared/layout/app-sidebar";
import { PageLoader } from "@/components/shared/page-loader";
import { WebSocketProvider } from "@/providers/websocket-provider";
import { useAuth } from "@/providers/auth-provider";
import { redirect } from "next/navigation";

const navSections = [
  {
    items: [
      { label: "Overview", href: "/partner-dashboard/insights", icon: "layout-dashboard" },
    ]
  },
  {
    collapsible: { label: "Operations", icon: "briefcase" },
    items: [
      { label: "Inventory", href: "/partner-dashboard/inventory" },
      { label: "Bookings", href: "/partner-dashboard/bookings" },
      { label: "Leads", href: "/partner-dashboard/lead-funnels" },
    ]
  },
  {
    collapsible: { label: "Insights", icon: "bar-chart" },
    items: [
      { label: "Analytics", href: "/partner-dashboard/analytics" },
    ]
  },
  {
    collapsible: { label: "Team", icon: "users" },
    items: [
      { label: "Staff", href: "/partner-dashboard/staff" },
    ]
  },
  {
    collapsible: { label: "Settings", icon: "settings" },
    items: [
      { label: "Business Profile", href: "/partner-dashboard/basic" },
      { label: "Account", href: "/partner-dashboard/profile" },
    ]
  },
];

export default function PartnerDashboardLayout({ children }: { children: React.ReactNode }) {
  const { session: user, isLoading } = useAuth();
  
  if (isLoading) {
    return <PageLoader />;
  }
  
  if (!user) {
    redirect('/');
  }

  // Get partner membership (owner)
  const partnerMembership = (user as any).partnerMemberships?.find((m: any) => m.staffRole === 'owner');
  if (!partnerMembership) redirect('/access-denied?reason=not-partner-owner');

  return (
    <WebSocketProvider userId={user.id} autoConnect>
      <DashboardLayout enableRightPanel>
        <AppSidebar user={user} sections={navSections} />
        <DashboardContent>{children}</DashboardContent>
      </DashboardLayout>
    </WebSocketProvider>
  );
}
