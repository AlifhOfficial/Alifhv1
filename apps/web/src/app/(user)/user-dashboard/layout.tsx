"use client";

import { DashboardLayout, DashboardContent } from "@/components/shared/layout/dashboard-layout";
import { AppSidebar } from "@/components/shared/layout/app-sidebar";
import { PageLoader } from "@/components/shared/page-loader";
import { useAuth } from "@/providers/auth-provider";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const navSections = [
  {
    items: [
      { label: "Overview", href: "/user-dashboard", icon: "compass" },
    ]
  },
  {
    items: [
      { label: "My Listings", href: "/user-dashboard/listings/my-listings", icon: "package" },
      { label: "Bookings", href: "/user-dashboard/bookings", icon: "calendar" },
      { label: "Messages", href: "/user-dashboard/messaging", icon: "message-circle" },
    ]
  },
  {
    items: [
      { label: "Favorites", href: "/user-dashboard/favorites", icon: "heart" },
      { label: "Superlikes", href: "/user-dashboard/superlikes", icon: "zap" },
    ]
  },
  {
    items: [
      { label: "Profile", href: "/user-dashboard/profile", icon: "user" },
      { label: "Settings", href: "/user-dashboard/settings", icon: "settings" },
      { label: "Requests", href: "/user-dashboard/requests", icon: "inbox" },

    ]
  },
];

interface UserDashboardLayoutProps {
  children: React.ReactNode;
}

export default function UserDashboardLayout({ children }: UserDashboardLayoutProps) {
  const { session: user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  
  // Check if user is banned - must be before any conditional returns
  const isBanned = user ? (user as any).isBanned === true : false;
  const isOnBannedPage = pathname === '/user-dashboard/banned';
  
  // Handle redirects properly in client component
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/access-denied?reason=not-authenticated');
    } else if (user && isBanned && !isOnBannedPage) {
      router.push('/user-dashboard/banned');
    }
  }, [user, isBanned, isOnBannedPage, isLoading, router]);
  
  if (isLoading) {
    return <PageLoader />;
  }
  
  if (!user) {
    return <PageLoader />;
  }

  // If banned and not on banned page, show loader while redirecting
  if (isBanned && !isOnBannedPage) {
    return <PageLoader />;
  }

  // Check if current page needs full height (no padding, full container)
  const isFullHeightPage = pathname?.includes('/messaging');

  return (
    <DashboardLayout enableRightPanel>
      <AppSidebar user={user} sections={navSections} />
      <DashboardContent fullHeight={isFullHeightPage}>{children}</DashboardContent>
    </DashboardLayout>
  );
}