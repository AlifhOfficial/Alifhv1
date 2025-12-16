import { DashboardLayoutProvider, DashboardMainContent } from "@/components/dashboard-components/dashboard-layout-wrapper";
import { Sidebar } from "@/components/dashboard-components/sidebar";
import { ThreeColumnLayout } from "@/components/dashboard-components/three-column-layout";
import { requireAuth } from "@/lib/auth/roles";
import { db } from "@alifh/database";
import * as schema from "@alifh/database";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const navItems = [
  { label: "Overview", href: "/partner-dashboard", icon: "layout-dashboard" },
  { label: "Profile", href: "/partner-dashboard/profile", icon: "building" },
  { label: "Team", href: "/partner-dashboard/team", icon: "users" },
  { label: "Reviews", href: "/partner-dashboard/reviews", icon: "star" },
  { label: "Performance", href: "/partner-dashboard/performance", icon: "bar-chart" },
  { label: "Settings", href: "/partner-dashboard/settings", icon: "settings" },
];

export default async function PartnerDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth();

  // Check partner membership
  const membership = await db
    .select()
    .from(schema.partnerStaff)
    .where(
      and(
        eq(schema.partnerStaff.userId, user.id),
        eq(schema.partnerStaff.status, "active")
      )
    )
    .limit(1);

  if (membership.length === 0 && user.role !== 'admin' && user.role !== 'super_admin') {
    redirect('/access-denied?reason=not-partner-member');
  }

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
