import { DashboardLayout, DashboardContent } from "@/components/dashboard-components/dashboard-layout";
import { AppSidebar } from "@/components/dashboard-components/app-sidebar";
import { requireRole } from "@/lib/auth/roles";
import { WebSocketProvider } from "@/providers/websocket-provider";

export const dynamic = "force-dynamic";

const navSections = [
  {
    items: [
      { label: "Overview", href: "/admin-dashboard", icon: "layout-dashboard" },
    ]
  },
  {
    collapsible: { label: "Content", icon: "file-text" },
    items: [
      { label: "Listings", href: "/admin-dashboard/listings" },
      { label: "Reviews", href: "/admin-dashboard/reviews" },
    ]
  },
  {
    collapsible: { label: "Partners", icon: "building" },
    items: [
      { label: "Active Partners", href: "/admin-dashboard/partners" },
      { label: "Partner Requests", href: "/admin-dashboard/partner-requests" },
    ]
  },
  {
    collapsible: { label: "Users", icon: "users" },
    items: [
      { label: "All Users", href: "/admin-dashboard/users" },
      { label: "Ban Appeals", href: "/admin-dashboard/ban-appeals" },
      { label: "KYC Management", href: "/admin-dashboard/kyc" },
    ]
  },
  {
    collapsible: { label: "System", icon: "settings" },
    items: [
      { label: "Audit Logs", href: "/admin-dashboard/audit-logs" },
    ]
  },
];

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("admin");

  return (
    <WebSocketProvider userId={user.id} autoConnect>
      <DashboardLayout enableRightPanel>
        <AppSidebar user={user} sections={navSections} />
        <DashboardContent>{children}</DashboardContent>
      </DashboardLayout>
    </WebSocketProvider>
  );
}
