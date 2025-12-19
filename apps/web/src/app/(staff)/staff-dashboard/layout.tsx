import { DashboardLayout, DashboardContent } from "@/components/dashboard-components/dashboard-layout";
import { Sidebar } from "@/components/dashboard-components/sidebar";
import { getSessionUser } from "@/lib/auth/session-context";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const navItems = [
  { label: "Overview", href: "/staff-dashboard", icon: "layout-dashboard" },
  { label: "Inventory", href: "/staff-dashboard/inventory", icon: "package" },
  { label: "Leads", href: "/staff-dashboard/leads", icon: "users" },
  { label: "Settings", href: "/staff-dashboard/settings", icon: "settings" },
];

export default async function StaffDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect('/');

  // Check if user is staff (not owner)
  const staffMembership = user.partnerMemberships?.find(m => m.staffRole !== 'owner');
  if (!staffMembership) redirect('/access-denied?reason=not-dealer-staff');
  if (staffMembership.staffRole === 'owner') redirect('/partner-dashboard');

  return (
    <DashboardLayout>
      <Sidebar user={user} items={navItems} />
      <DashboardContent>{children}</DashboardContent>
    </DashboardLayout>
  );
}
