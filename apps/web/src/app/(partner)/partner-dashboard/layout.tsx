import { DashboardLayoutProvider, DashboardMainContent } from "@/components/dashboard-components/dashboard-layout-wrapper";
import { Sidebar } from "@/components/dashboard-components/sidebar";
import { ThreeColumnLayout } from "@/components/dashboard-components/three-column-layout";
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
  
  // Auth check already done in middleware - proxy validates partner access

  return (
    <DashboardLayoutProvider>
      <Sidebar user={user} items={navItems} />
      <DashboardMainContent>
        <ThreeColumnLayout>
          {children}
        </ThreeColumnLayout>
      </DashboardMainContent>
    </DashboardLayoutProvider>
  );
}
