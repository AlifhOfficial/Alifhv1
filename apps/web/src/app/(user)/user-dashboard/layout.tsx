"use client";

import { DashboardLayout, DashboardContent } from "@/components/shared/layout/dashboard-layout";
import { AppSidebar } from "@/components/shared/layout/app-sidebar";
import { WebSocketProvider } from "@/providers/websocket-provider";
import { useAuth } from "@/providers/auth-provider";
import { redirect } from "next/navigation";

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

export default function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  const { session: user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    redirect('/');
  }

  return (
    <WebSocketProvider userId={user.id} autoConnect>
      <DashboardLayout enableRightPanel>
        <AppSidebar user={user} sections={navSections} />
        <DashboardContent>{children}</DashboardContent>
      </DashboardLayout>
    </WebSocketProvider>
  );
}