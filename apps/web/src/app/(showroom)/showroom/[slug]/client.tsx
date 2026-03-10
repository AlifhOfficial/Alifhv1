/**
 * Showroom Page Client Component
 * 
 * Client-side wrapper that uses the ShowroomView component.
 * Separated from page.tsx to allow server-side metadata generation.
 */

'use client';

import { ShowroomView } from '@/components/pages/showroom';
import type { ShowroomData } from '@/components/pages/showroom/types';

interface ShowroomPageClientProps {
  slug: string;
  /**
   * Initial showroom data from server-side fetch.
   * When provided, content renders immediately.
   */
  initialShowroom?: ShowroomData | null;
}

export function ShowroomPageClient({ slug, initialShowroom }: ShowroomPageClientProps) {
  return <ShowroomView slug={slug} initialShowroom={initialShowroom} />;
}
