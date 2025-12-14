import { DashboardLayoutProvider, DashboardMainContent } from "@/components/dashboard-components/dashboard-layout-wrapper";
import { SimpleSidebar } from "@/components/dashboard-components/simple-sidebar";
import { requireRole } from "@/lib/auth/roles";

const navItems = [
  { label: "Overview", href: "/admin-dashboard", icon: "layout-dashboard" },
  { label: "KYC Management", href: "/admin-dashboard/kyc", icon: "shield-check" },
  { label: "Users", href: "/admin-dashboard/users", icon: "users" },
  { label: "Partners", href: "/admin-dashboard/partners", icon: "building" },
  { label: "Settings", href: "/admin-dashboard/settings", icon: "settings" },
];

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("admin");

  return (
    <DashboardLayoutProvider>
      <SimpleSidebar user={user} items={navItems} />
      <DashboardMainContent>
        {children}
      </DashboardMainContent>
    </DashboardLayoutProvider>
  );
}
