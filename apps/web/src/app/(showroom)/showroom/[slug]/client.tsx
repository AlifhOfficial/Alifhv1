/**
 * Showroom Page Client Component
 * 
 * Client-side wrapper that uses the ShowroomView component.
 * Separated from page.tsx to allow server-side metadata generation.
 */

'use client';

import { ShowroomView } from '@/components/pages/showroom';

interface ShowroomPageClientProps {
  slug: string;
}

export function ShowroomPageClient({ slug }: ShowroomPageClientProps) {
  return <ShowroomView slug={slug} />;
}
