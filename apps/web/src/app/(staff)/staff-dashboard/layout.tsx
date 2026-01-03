'use client';

import { DashboardLayout, DashboardContent } from "@/components/shared/layout/dashboard-layout";
import { AppSidebar } from "@/components/shared/layout/app-sidebar";
import { WebSocketProvider } from "@/providers/websocket-provider";
import { useAuth } from "@/providers/auth-provider";
import { redirect } from "next/navigation";

const navSections = [
  {
    items: [
      { label: "Overview", href: "/staff-dashboard", icon: "layout-dashboard" },
      { label: "Global Inventory", href: "/staff-dashboard/inventory", icon: "package" },
    ]
  },
  {
    collapsible: { label: "Work", icon: "briefcase" },
    items: [
      { label: "Works For", href: "/staff-dashboard/works-for" },
      { label: "Work Listings", href: "/staff-dashboard/work-listings" },
      { label: "Consignment Leads", href: "/staff-dashboard/consignment/leads" },
    ]
  },
  {
    collapsible: { label: "Activity", icon: "package" },
    items: [
      { label: "Bookings", href: "/staff-dashboard/bookings" },
      { label: "Messages", href: "/staff-dashboard/messaging" },
    ]
  },
  {
    collapsible: { label: "Account", icon: "user" },
    items: [
      { label: "Profile", href: "/staff-dashboard/profile" },
    ]
  },
];

export default function StaffDashboardLayout({ children }: { children: React.ReactNode }) {
  const { session: user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    redirect('/');
  }

  // Check if user is staff (not owner)
  const staffMembership = (user as any).partnerMemberships?.find((m: any) => m.staffRole !== 'owner');
  if (!staffMembership) redirect('/access-denied?reason=not-dealer-staff');
  if (staffMembership.staffRole === 'owner') redirect('/partner-dashboard');

  return (
    <WebSocketProvider userId={user.id} autoConnect>
      <DashboardLayout enableRightPanel>
        <AppSidebar user={user} sections={navSections} />
        <DashboardContent>{children}</DashboardContent>
      </DashboardLayout>
    </WebSocketProvider>
  );
}
