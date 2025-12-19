import { DashboardLayout, DashboardContent } from "@/components/dashboard-components/dashboard-layout";
import { Sidebar } from "@/components/dashboard-components/sidebar";
import { getSessionUser } from "@/lib/auth/session-context";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const navItems = [
  { label: "Overview", href: "/partner-dashboard", icon: "layout-dashboard" },
  { label: "Inventory", href: "/partner-dashboard/inventory", icon: "car" },
  { label: "Profile", href: "/partner-dashboard/profile", icon: "building" },
  { label: "Team", href: "/partner-dashboard/team", icon: "users" },
  { label: "Reviews", href: "/partner-dashboard/reviews", icon: "star" },
  { label: "Performance", href: "/partner-dashboard/performance", icon: "bar-chart" },
  { label: "Settings", href: "/partner-dashboard/settings", icon: "settings" },
];

export default async function PartnerDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect('/');

  return (
    <DashboardLayout enableRightPanel>
      <Sidebar user={user} items={navItems} />
      <DashboardContent>{children}</DashboardContent>
    </DashboardLayout>
  );
}
