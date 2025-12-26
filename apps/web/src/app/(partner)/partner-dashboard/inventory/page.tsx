import { DashboardDisplayArea } from "@/components/dashboard-components/display-area";
import { PartnerInventoryClient } from "@/components/inventory";
import { getSessionUser } from "@/lib/auth/session-context";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PartnerInventoryPage() {
  const user = await getSessionUser();
  if (!user) redirect('/');

  // Get the first partner membership (if any)
  const membership = user.partnerMemberships?.[0];

  if (!membership?.partnerId) {
    return (
      <DashboardDisplayArea>
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="rounded-xl border border-border p-8 text-center">
            <h2 className="text-lg font-medium text-foreground mb-2">No Partner Access</h2>
            <p className="text-sm text-muted-foreground">You need to be associated with a partner to manage inventory.</p>
          </div>
        </div>
      </DashboardDisplayArea>
    );
  }

  return (
    <DashboardDisplayArea
     
    >
      <PartnerInventoryClient
        partnerId={membership.partnerId}
        partnerName={membership.partnerName || "Partner"}
        partnerVerified={false}
        userRole={membership.staffRole}
      />
    </DashboardDisplayArea>
  );
}
