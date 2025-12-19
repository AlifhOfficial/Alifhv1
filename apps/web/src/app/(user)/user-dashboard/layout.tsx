import { DashboardLayoutProvider, DashboardMainContent } from "@/components/dashboard-components/dashboard-layout-wrapper";
import { Sidebar } from "@/components/dashboard-components/sidebar";
import { getSessionUser } from "@/lib/auth/session-context";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const navItems = [
  { label: "Overview", href: "/user-dashboard", icon: "layout-dashboard" },
  { label: "Profile", href: "/user-dashboard/profile", icon: "user" },
  { label: "Favorites", href: "/user-dashboard/favorites", icon: "heart" },
  { label: "Superlikes", href: "/user-dashboard/superlikes", icon: "sparkles" },
  { label: "Dev: KYC Requests", href: "/user-dashboard/dev/kyc-requests", icon: "shield-check" },
];

export default async function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect('/');

  return (
    <DashboardLayoutProvider>
      <Sidebar user={user} items={navItems} />
      <DashboardMainContent>
        {children}
      </DashboardMainContent>
    </DashboardLayoutProvider>
  );
}