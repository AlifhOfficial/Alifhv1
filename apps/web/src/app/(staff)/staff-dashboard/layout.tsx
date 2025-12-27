import { DashboardLayout, DashboardContent } from "@/components/dashboard-components/dashboard-layout";
import { AppSidebar } from "@/components/dashboard-components/app-sidebar";
import { getSessionUser } from "@/lib/auth/session-context";
import { WebSocketProvider } from "@/providers/websocket-provider";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const navSections = [
  {
    items: [
      { label: "Overview", href: "/staff-dashboard", icon: "layout-dashboard" },
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

export default async function StaffDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect('/');

  // Check if user is staff (not owner)
  const staffMembership = user.partnerMemberships?.find(m => m.staffRole !== 'owner');
  if (!staffMembership) redirect('/access-denied?reason=not-dealer-staff');
  if (staffMembership.staffRole === 'owner') redirect('/partner-dashboard');

  return (
    <WebSocketProvider userId={user.id} autoConnect>
      <DashboardLayout enableRightPanel>
        <AppSidebar user={user} sections={navSections} />
        <DashboardContent fullHeight>{children}</DashboardContent>
      </DashboardLayout>
    </WebSocketProvider>
  );
}
