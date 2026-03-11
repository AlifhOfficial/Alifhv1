import { redirect } from 'next/navigation';
import { PartnerContactSettings } from '@/components/partner/partner-contact-settings';
import { getSessionUser } from '@/lib/auth/session-context';
import { getPartnerProfileByUserId } from '@alifh/database';

export default async function ContactSettingsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/?auth=signin&redirect=/partner-dashboard/contact');
  }

  const profile = await getPartnerProfileByUserId(user.id);
  return <PartnerContactSettings initialProfile={profile as any} />;
}
