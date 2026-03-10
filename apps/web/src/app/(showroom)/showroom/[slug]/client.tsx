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
  /**
   * Initial listings data from server-side fetch.
   * Avoids client-side waterfall for inventory section.
   */
  initialListings?: any | null;
}

export function ShowroomPageClient({ slug, initialShowroom, initialListings }: ShowroomPageClientProps) {
  return <ShowroomView slug={slug} initialShowroom={initialShowroom} initialListings={initialListings} />;
}
