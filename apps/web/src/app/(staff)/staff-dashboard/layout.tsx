import { DashboardLayout, DashboardContent } from "@/components/dashboard-components/dashboard-layout";
import { Sidebar } from "@/components/dashboard-components/sidebar";
import { getSessionUser } from "@/lib/auth/session-context";
import { WebSocketProvider } from "@/providers/websocket-provider";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const navItems = [
  { label: "Overview", href: "/staff-dashboard", icon: "layout-dashboard" },
  { label: "Works For", href: "/staff-dashboard/works-for", icon: "building" },
  { label: "Work Listings", href: "/staff-dashboard/work-listings", icon: "car" },
  { label: "Consignment Leads", href: "/staff-dashboard/consignment/leads", icon: "handshake" },
  { label: "Bookings", href: "/staff-dashboard/bookings", icon: "calendar" },
  { label: "Messages", href: "/staff-dashboard/messaging", icon: "message-square" },
  { label: "Profile", href: "/staff-dashboard/profile", icon: "user" },
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
      <DashboardLayout>
        <Sidebar user={user} items={navItems} />
        <DashboardContent>{children}</DashboardContent>
      </DashboardLayout>
    </WebSocketProvider>
  );
}
