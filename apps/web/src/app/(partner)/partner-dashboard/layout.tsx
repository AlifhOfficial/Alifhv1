import { DashboardLayout, DashboardContent } from "@/components/dashboard-components/dashboard-layout";
import { Sidebar } from "@/components/dashboard-components/sidebar";
import { getSessionUser } from "@/lib/auth/session-context";
import { WebSocketProvider } from "@/providers/websocket-provider";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const navItems = [
  { label: "Overview", href: "/partner-dashboard", icon: "layout-dashboard" },
  { label: "Inventory", href: "/partner-dashboard/inventory", icon: "package" },
  { label: "Bookings", href: "/partner-dashboard/bookings", icon: "calendar" },
  // V1: Messaging moved to staff-dashboard - partner owners access via staff role
  { label: "Basic Profile", href: "/partner-dashboard/basic", icon: "building" },
  { label: "Full Settings", href: "/partner-dashboard/profile", icon: "settings" },
  { label: "Staff", href: "/partner-dashboard/staff", icon: "users" },
];

export default async function PartnerDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect('/');

  // Get partner membership (owner)
  const partnerMembership = user.partnerMemberships?.find(m => m.staffRole === 'owner');
  if (!partnerMembership) redirect('/access-denied?reason=not-partner-owner');

  return (
    <WebSocketProvider userId={user.id} autoConnect>
      <DashboardLayout enableRightPanel>
        <Sidebar user={user} items={navItems} />
        <DashboardContent>{children}</DashboardContent>
      </DashboardLayout>
    </WebSocketProvider>
  );
}
