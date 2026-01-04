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
      { label: "Overview", href: "/partner-dashboard", icon: "layout-dashboard" },
    ]
  },
  {
    collapsible: { label: "Business", icon: "briefcase" },
    items: [
      { label: "Inventory", href: "/partner-dashboard/inventory" },
      { label: "Lead Funnels", href: "/partner-dashboard/lead-funnels" },
      { label: "Bookings", href: "/partner-dashboard/bookings" },
      { label: "Performance", href: "/partner-dashboard/performance" },
    ]
  },
  {
    collapsible: { label: "Settings", icon: "settings" },
    items: [
      { label: "Basic Profile", href: "/partner-dashboard/basic" },
      { label: "Full Settings", href: "/partner-dashboard/profile" },
      { label: "Staff", href: "/partner-dashboard/staff" },
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
