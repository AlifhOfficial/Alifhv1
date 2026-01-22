'use client';

import { useMemo } from "react";
import { DashboardLayout, DashboardContent } from "@/components/shared/layout/dashboard-layout";
import { AppSidebar } from "@/components/shared/layout/app-sidebar";
import { PageLoader } from "@/components/shared/page-loader";
import { useAuth } from "@/providers/auth-provider";
import { redirect } from "next/navigation";

const getNavSections = (isBlackTier: boolean) => [
  {
    items: [
      { label: "Overview", href: "/partner-dashboard/insights", icon: "compass" },
      { label: "Inventory", href: "/partner-dashboard/inventory", icon: "package" },
      { label: "Bookings", href: "/partner-dashboard/bookings", icon: "calendar" },
      { label: "Leads", href: "/partner-dashboard/lead-funnels", icon: "inbox" },
      { label: "Analytics", href: "/partner-dashboard/analytics", icon: "bar-chart" },
      { label: "Staff", href: "/partner-dashboard/staff", icon: "users" },
    ]
  },
  {
    items: [
      ...(isBlackTier ? [{ label: "Black", href: "/partner-dashboard/showroom", icon: "crown" }] : []),
      { label: "Business Profile", href: "/partner-dashboard/basic", icon: "briefcase" },
      { label: "Contact Info", href: "/partner-dashboard/contact", icon: "phone" },
    ]
  },
  {
    items: [
      { label: "Billing", href: "/partner-dashboard/subscription", icon: "credit-card" },
    ]
  },
];

export default function PartnerDashboardLayout({ children }: { children: React.ReactNode }) {
  const { session: user, isLoading } = useAuth();

  // Get partner membership (owner)
  const partnerMembership = (user as any)?.partnerMemberships?.find((m: any) => m.staffRole === 'owner');
  
  const isBlackTier = partnerMembership?.partnerTier === 'black';
  const navSections = useMemo(() => getNavSections(isBlackTier), [isBlackTier]);
  
  if (isLoading) {
    return <PageLoader />;
  }
  
  if (!user) {
    redirect('/');
  }

  if (!partnerMembership) {
    redirect('/access-denied?reason=not-partner-owner');
  }

  // Get company info for sidebar
  const staffOverride = {
    companyLogo: partnerMembership?.partnerLogo,
    companyName: partnerMembership?.partnerName || 'Partner',
  };

  return (
    <DashboardLayout enableRightPanel>
      <AppSidebar user={user} sections={navSections} staffOverride={staffOverride} />
      <DashboardContent>{children}</DashboardContent>
    </DashboardLayout>
  );
}
