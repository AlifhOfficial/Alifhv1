import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session-context";
import { AdminDashboardShell } from "./shell";

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
      { label: "Feedback", href: "/admin-dashboard/feedback" },
      { label: "Communications", href: "/admin-dashboard/communications" },
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
  const user = await getSessionUser();

  if (!user) {
    redirect('/access-denied?reason=not-authenticated');
  }

  if (!user.isAlifhAdmin) {
    redirect('/access-denied?reason=insufficient-permissions');
  }

  return (
    <AdminDashboardShell user={user} sections={navSections}>
      {children}
    </AdminDashboardShell>
  );
}
