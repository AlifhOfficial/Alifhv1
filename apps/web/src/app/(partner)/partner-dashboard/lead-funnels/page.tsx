'use client';

import { DashboardDisplayArea } from "@/components/shared/layout/display-area";
import { PartnerLeadFunnelsView } from "@/components/partner/lead-funnels/partner-lead-funnels-view";
import { useAuth } from "@/providers/auth-provider";
import { redirect } from "next/navigation";

export default function PartnerLeadFunnelsPage() {
  const { session } = useAuth();
  
  if (!session) redirect('/');

  // Get the first partner membership (if any) - must be manager or owner
  const membership = (session as any).partnerMemberships?.find(
    (m: any) => m.staffRole === 'manager' || m.staffRole === 'owner'
  );

  if (!membership?.partnerId) {
    return (
      <DashboardDisplayArea>
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="rounded-xl border border-border p-8 text-center">
            <h2 className="text-lg font-medium text-foreground mb-2">Manager Access Required</h2>
            <p className="text-sm text-muted-foreground">Only managers and owners can view all lead funnels.</p>
          </div>
        </div>
      </DashboardDisplayArea>
    );
  }

  return (
    <DashboardDisplayArea>
      <PartnerLeadFunnelsView
        partnerId={membership.partnerId}
        partnerName={membership.partnerName || "Partner"}
      />
    </DashboardDisplayArea>
  );
}
