import { DashboardDisplayArea } from "@/components/dashboard-components/display-area";
import { PartnerInventoryClient } from "@/components/inventory/partner-inventory-client";
import { requireAuth } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";

export default async function PartnerInventoryPage() {
  const user = await requireAuth();

  // Get the first partner membership (if any)
  const membership = user.partnerMemberships?.[0];

  if (!membership?.partnerId) {
    return (
      <DashboardDisplayArea
        title="Inventory"
        description="Manage your vehicle listings"
      >
        <div className="p-6 md:p-10">
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <h2 className="text-xl font-medium text-foreground mb-2">No Partner Access</h2>
            <p className="text-muted-foreground">You need to be associated with a partner to manage inventory.</p>
          </div>
        </div>
      </DashboardDisplayArea>
    );
  }

  return (
    <DashboardDisplayArea
      title="Inventory"
      description="Manage your vehicle listings"
    >
      <PartnerInventoryClient
        partnerId={membership.partnerId}
        partnerName={membership.partnerName || "Partner"}
        partnerVerified={false}
      />
    </DashboardDisplayArea>
  );
}
