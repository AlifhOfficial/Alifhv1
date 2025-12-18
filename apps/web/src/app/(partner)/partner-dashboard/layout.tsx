import { DashboardLayoutProvider, DashboardMainContent } from "@/components/dashboard-components/dashboard-layout-wrapper";
import { Sidebar } from "@/components/dashboard-components/sidebar";
import { ThreeColumnLayout } from "@/components/dashboard-components/three-column-layout";
import { requireAuth } from "@/lib/auth/roles";

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
  const user = await requireAuth();
  
  // Auth check already done in middleware - no need to re-query DB
  // Middleware validates partner access via hasPartnerAccess field

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
