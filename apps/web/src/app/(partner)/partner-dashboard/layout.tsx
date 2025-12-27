import { DashboardLayout, DashboardContent } from "@/components/dashboard-components/dashboard-layout";
import { AppSidebar } from "@/components/dashboard-components/app-sidebar";
import { getSessionUser } from "@/lib/auth/session-context";
import { WebSocketProvider } from "@/providers/websocket-provider";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

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

export default async function PartnerDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect('/');

  // Get partner membership (owner)
  const partnerMembership = user.partnerMemberships?.find(m => m.staffRole === 'owner');
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
