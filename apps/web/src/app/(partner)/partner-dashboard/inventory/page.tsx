/**
 * Partner Inventory Page
 * Server-side auth for faster initial load
 */

import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session-context';
import { DashboardDisplayArea } from "@/components/shared/layout/display-area";
import { DealerInventory } from "@/components/inventory";

export default async function PartnerInventoryPage() {
  const user = await getSessionUser();
  
  if (!user) redirect('/?auth=signin');

  // Get the first partner membership (if any)
  const membership = (user as any).partnerMemberships?.[0];

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
    <DashboardDisplayArea>
      <DealerInventory
        partnerId={membership.partnerId}
        partnerName={membership.partnerName || "Partner"}
        partnerVerified={false}
        userRole={membership.staffRole}
      />
    </DashboardDisplayArea>
  );
}
