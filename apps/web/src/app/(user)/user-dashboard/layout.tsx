import { DashboardLayoutProvider, DashboardMainContent } from "@/components/dashboard-components/dashboard-layout-wrapper";
import { SimpleSidebar } from "@/components/dashboard-components/simple-sidebar";
import { requireAuth } from "@/lib/auth/roles";

const navItems = [
  { label: "Overview", href: "/user-dashboard", icon: "layout-dashboard" },
  { label: "Profile", href: "/user-dashboard/profile", icon: "user" },
  { label: "Favorites", href: "/user-dashboard/favs", icon: "heart" },
  { label: "Dev: KYC Requests", href: "/user-dashboard/dev/kyc-requests", icon: "shield-check" },
];

export default async function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth();

  return (
    <DashboardLayoutProvider>
      <SimpleSidebar user={user} items={navItems} />
      <DashboardMainContent>
        {children}
      </DashboardMainContent>
    </DashboardLayoutProvider>
  );
}