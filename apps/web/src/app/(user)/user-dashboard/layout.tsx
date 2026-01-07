"use client";

import { DashboardLayout, DashboardContent } from "@/components/shared/layout/dashboard-layout";
import { AppSidebar } from "@/components/shared/layout/app-sidebar";
import { PageLoader } from "@/components/shared/page-loader";
import { WebSocketProvider } from "@/providers/websocket-provider";
import { useAuth } from "@/providers/auth-provider";
import { redirect, usePathname } from "next/navigation";
import { useEffect } from "react";

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
    collapsible: { label: "Communication", icon: "message-circle" },
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
  const pathname = usePathname();
  
  // Check if user is banned - must be before any conditional returns
  const isBanned = user ? (user as any).isBanned === true : false;
  const isOnBannedPage = pathname === '/user-dashboard/banned';
  
  // useEffect must be called unconditionally (before any returns)
  useEffect(() => {
    if (user && isBanned && !isOnBannedPage) {
      redirect('/user-dashboard/banned');
    }
  }, [user, isBanned, isOnBannedPage]);
  
  if (isLoading) {
    return <PageLoader />;
  }
  
  if (!user) {
    redirect('/');
  }

  // If banned and not on banned page, show loader while redirecting
  if (isBanned && !isOnBannedPage) {
    return <PageLoader />;
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