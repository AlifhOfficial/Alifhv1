import { redirect } from 'next/navigation';
import { PartnerContactSettings } from '@/components/partner/partner-contact-settings';
import { getSessionUser } from '@/lib/auth/session-context';
import { getPartnerContactProfile } from '@alifh/database';

export default async function ContactSettingsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/?auth=signin&redirect=/partner-dashboard/contact');
  }

  const partnerId = (user as any).partnerMemberships?.[0]?.partnerId;
  if (!partnerId) {
    redirect('/access-denied?reason=not-partner-manager');
  }

  const profile = await getPartnerContactProfile(partnerId);
  return <PartnerContactSettings initialProfile={profile as any} />;
}
