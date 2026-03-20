import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session-context";
import { AuthenticatedAppProviders } from "@/components/shared/providers/authenticated-app-providers";
import { GlobalChatProvider } from "@/components/shared/providers/global-chat-provider";
import { UserDashboardShell } from "./shell";

const navSections = [
  {
    items: [
      { label: "Overview", href: "/user-dashboard", icon: "compass" },
    ]
  },
  {
    items: [
      { label: "My Listings", href: "/user-dashboard/listings/my-listings", icon: "package" },
      { label: "Bookings", href: "/user-dashboard/bookings", icon: "calendar" },
      { label: "Messages", href: "/user-dashboard/messaging", icon: "message-circle" },
    ]
  },
  {
    items: [
      { label: "Favorites", href: "/user-dashboard/favorites", icon: "heart" },
      { label: "Superlikes", href: "/user-dashboard/superlikes", icon: "zap" },
    ]
  },
  {
    items: [
      { label: "Profile", href: "/user-dashboard/profile", icon: "user" },
      { label: "Settings", href: "/user-dashboard/settings", icon: "settings" },
      { label: "Requests", href: "/user-dashboard/requests", icon: "inbox" },
    ]
  },
];

export default async function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  if (!user) {
    redirect('/?auth=signin');
  }

  // Check if user is banned
  if ((user as any).banned) {
    redirect('/user-dashboard/banned');
  }

  return (
    <GlobalChatProvider>
      <AuthenticatedAppProviders>
        <UserDashboardShell user={user} sections={navSections}>
          {children}
        </UserDashboardShell>
      </AuthenticatedAppProviders>
    </GlobalChatProvider>
  );
}
