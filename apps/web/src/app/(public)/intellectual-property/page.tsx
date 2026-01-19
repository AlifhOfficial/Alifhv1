/**
 * Intellectual Property & Copyright Notice Page - Alifh
 * Legal documentation
 */

import { Metadata } from 'next';
import { IntellectualProperty } from '@/components/pages/legal';

export const metadata: Metadata = {
  title: 'Intellectual Property & Copyright Notice - Alifh',
  description: 'Intellectual Property and Copyright Notice for ALIFH platform operated by AISH CAPITALS FZCO. Learn about ownership, licensing, and usage restrictions.',
  openGraph: {
    title: 'Intellectual Property & Copyright Notice - Alifh',
    description: 'Intellectual Property and Copyright Notice for ALIFH platform operated by AISH CAPITALS FZCO.',
    type: 'website',
  },
};

export default function IntellectualPropertyPage() {
  return (
    <div className="min-h-screen bg-background">
      <IntellectualProperty />
    </div>
  );
}
