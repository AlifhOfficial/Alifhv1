import { DashboardLayout, DashboardContent } from "@/components/dashboard-components/dashboard-layout";
import { Sidebar } from "@/components/dashboard-components/sidebar";
import { requireRole } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";

const navItems = [
  { label: "Overview", href: "/admin-dashboard", icon: "layout-dashboard" },
  { label: "Partners", href: "/admin-dashboard/partners", icon: "building" },
  { label: "Partner Requests", href: "/admin-dashboard/partner-requests", icon: "inbox" },
  { label: "KYC Management", href: "/admin-dashboard/kyc", icon: "shield-check" },
  { label: "Reviews", href: "/admin-dashboard/reviews", icon: "star" },
  { label: "Users", href: "/admin-dashboard/users", icon: "users" },
  { label: "Audit Logs", href: "/admin-dashboard/audit-logs", icon: "file-text" },
];

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("admin");

  return (
    <DashboardLayout>
      <Sidebar user={user} items={navItems} />
      <DashboardContent>{children}</DashboardContent>
    </DashboardLayout>
  );
}
