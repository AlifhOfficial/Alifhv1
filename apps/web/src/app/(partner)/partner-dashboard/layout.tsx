import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session-context";
import { AuthenticatedAppProviders } from "@/components/shared/providers/authenticated-app-providers";
import { PartnerDashboardShell } from "./shell";

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

export default async function PartnerDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  if (!user) {
    redirect('/');
  }

  // Get partner membership (owner)
  const partnerMembership = (user as any).partnerMemberships?.find((m: any) => m.staffRole === 'owner');

  if (!partnerMembership) {
    redirect('/access-denied?reason=not-partner-owner');
  }

  const isBlackTier = partnerMembership.partnerTier === 'black';
  const navSections = getNavSections(isBlackTier);

  const staffOverride = {
    companyLogo: partnerMembership.partnerLogo,
    companyName: partnerMembership.partnerName || 'Partner',
  };

  return (
    <AuthenticatedAppProviders>
      <PartnerDashboardShell user={user} sections={navSections} staffOverride={staffOverride}>
        {children}
      </PartnerDashboardShell>
    </AuthenticatedAppProviders>
  );
}
