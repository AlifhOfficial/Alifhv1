import { PartnerProfileView } from "@/components/partner/partner-profile-view";
import { getSessionUser } from "@/lib/auth/session-context";
import { redirect } from "next/navigation";

export default async function PartnerProfileSettingsPage() {
  const user = await getSessionUser();
  if (!user) redirect('/');

  // Get the first active partner membership
  const partnerId = user.partnerMemberships?.[0]?.partnerId;

  if (!partnerId) {
    redirect("/access-denied");
  }

  return <PartnerProfileView partnerId={partnerId} />;
}
