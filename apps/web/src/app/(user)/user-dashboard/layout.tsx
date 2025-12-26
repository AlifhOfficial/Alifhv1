import { DashboardLayout, DashboardContent } from "@/components/dashboard-components/dashboard-layout";
import { Sidebar } from "@/components/dashboard-components/sidebar";
import { getSessionUser } from "@/lib/auth/session-context";
import { WebSocketProvider } from "@/providers/websocket-provider";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const navSections = [
  {
    items: [
      { label: "Overview", href: "/user-dashboard", icon: "home" },
    ]
  },
  {
    title: "Activity",
    items: [
      { label: "My Listings", href: "/user-dashboard/listings/my-listings", icon: "car-front" },
      { label: "Bookings", href: "/user-dashboard/bookings", icon: "calendar-check" },
    ]
  },
  {
    title: "Communication",
    items: [
      { label: "Messages", href: "/user-dashboard/messaging", icon: "mail" },
      { label: "Requests", href: "/user-dashboard/requests", icon: "inbox" },
    ]
  },
  {
    title: "Saved",
    items: [
      { label: "Favorites", href: "/user-dashboard/favorites", icon: "heart" },
      { label: "Superlikes", href: "/user-dashboard/superlikes", icon: "star" },
    ]
  },
  {
    title: "Account",
    items: [
      { label: "Profile", href: "/user-dashboard/profile", icon: "circle-user" },
      { label: "Settings", href: "/user-dashboard/settings", icon: "settings-2" },
    ]
  },
];

export default async function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect('/');

  return (
    <WebSocketProvider userId={user.id} autoConnect>
      <DashboardLayout>
        <Sidebar user={user} sections={navSections} />
        <DashboardContent>{children}</DashboardContent>
      </DashboardLayout>
    </WebSocketProvider>
  );
}