'use client';

import { DashboardLayout, DashboardContent } from "@/components/shared/layout/dashboard-layout";
import { AppSidebar } from "@/components/shared/layout/app-sidebar";
import { PageLoader } from "@/components/shared/page-loader";
import { useAuth } from "@/providers/auth-provider";
import { redirect } from "next/navigation";

const navSections = [
  {
    items: [
      { label: "Browse", href: "/staff-dashboard/inventory", icon: "compass" },
      { label: "Our Listings", href: "/staff-dashboard/work-listings", icon: "package" },
      { label: "Leads", href: "/staff-dashboard/consignment", icon: "inbox" },
      { label: "Bookings", href: "/staff-dashboard/bookings", icon: "calendar" },
      { label: "Messages", href: "/staff-dashboard/messaging", icon: "message-circle" },
    ]
  },
  {
    items: [
      { label: "Dealership", href: "/staff-dashboard/works-for", icon: "briefcase" },
      { label: "Profile", href: "/staff-dashboard/profile", icon: "user" },
    ]
  },
];

export default function StaffDashboardLayout({ children }: { children: React.ReactNode }) {
  const { session: user, isLoading } = useAuth();
  
  if (isLoading) {
    return <PageLoader />;
  }
  
  if (!user) {
    redirect('/');
  }

  // Check if user is staff (not owner)
  const staffMembership = (user as any).partnerMemberships?.find((m: any) => m.staffRole !== 'owner');
  if (!staffMembership) redirect('/access-denied?reason=not-dealer-staff');
  if (staffMembership.staffRole === 'owner') redirect('/partner-dashboard');

  // Get company info for sidebar
  const staffOverride = {
    companyLogo: staffMembership.partnerLogo,
    companyName: staffMembership.partnerName,
  };

  return (
    <DashboardLayout enableRightPanel>
      <AppSidebar user={user} sections={navSections} staffOverride={staffOverride} />
      <DashboardContent>{children}</DashboardContent>
    </DashboardLayout>
  );
}
