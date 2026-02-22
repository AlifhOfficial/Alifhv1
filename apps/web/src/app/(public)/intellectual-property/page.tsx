/**
 * Intellectual Property & Copyright Notice Page - Revvup
 * Legal documentation
 */

import { Metadata } from 'next';
import { IntellectualProperty } from '@/components/pages/legal';

export const metadata: Metadata = {
  title: 'Intellectual Property & Copyright Notice - Revvup',
  description: 'Intellectual Property and Copyright Notice for REVVUP platform operated by AISH CAPITALS FZCO. Learn about ownership, licensing, and usage restrictions.',
  openGraph: {
    title: 'Intellectual Property & Copyright Notice - Revvup',
    description: 'Intellectual Property and Copyright Notice for REVVUP platform operated by AISH CAPITALS FZCO.',
    type: 'website',
  },
};

// ISR: Static page, cached until redeploy
export const revalidate = false;

export default function IntellectualPropertyPage() {
  return (
    <div className="min-h-screen bg-background">
      <IntellectualProperty />
    </div>
  );
}
