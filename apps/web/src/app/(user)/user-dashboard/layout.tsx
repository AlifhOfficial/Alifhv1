import { DashboardLayout, DashboardContent } from "@/components/dashboard-components/dashboard-layout";
import { AppSidebar } from "@/components/dashboard-components/app-sidebar";
import { getSessionUser } from "@/lib/auth/session-context";
import { WebSocketProvider } from "@/providers/websocket-provider";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const navSections = [
  {
    items: [
      { label: "Overview", href: "/user-dashboard", icon: "layout-dashboard" },
    ]
  },
  {
    collapsible: { label: "Activity", icon: "package" },
    items: [
      { label: "My Listings", href: "/user-dashboard/listings/my-listings" },
      { label: "Bookings", href: "/user-dashboard/bookings" },
    ]
  },
  {
    collapsible: { label: "Communication", icon: "message-square" },
    items: [
      { label: "Messages", href: "/user-dashboard/messaging" },
      { label: "Requests", href: "/user-dashboard/requests" },
    ]
  },
  {
    collapsible: { label: "Saved", icon: "heart" },
    items: [
      { label: "Favorites", href: "/user-dashboard/favorites" },
      { label: "Superlikes", href: "/user-dashboard/superlikes" },
    ]
  },
  {
    collapsible: { label: "Account", icon: "user" },
    items: [
      { label: "Profile", href: "/user-dashboard/profile" },
      { label: "Settings", href: "/user-dashboard/settings" },
    ]
  },
];

export default async function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect('/');

  return (
    <WebSocketProvider userId={user.id} autoConnect>
      <DashboardLayout enableRightPanel>
        <AppSidebar user={user} sections={navSections} />
        <DashboardContent>{children}</DashboardContent>
      </DashboardLayout>
    </WebSocketProvider>
  );
}