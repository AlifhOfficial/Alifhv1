/**
 * Admin Communications Page
 * Manage incoming contact messages and inquiries
 */

import { Metadata } from 'next';
import { DashboardDisplayArea } from "@/components/shared/layout/display-area";
import { AdminCommunicationsView } from '@/components/communications';

export const metadata: Metadata = {
  title: 'Communications | Admin Dashboard',
  description: 'Manage incoming contact messages and support inquiries',
};

export default function AdminCommunicationsPage() {
  return (
    <DashboardDisplayArea>
      <AdminCommunicationsView />
    </DashboardDisplayArea>
  );
}
