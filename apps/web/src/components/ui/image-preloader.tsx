/**
 * Image Preloader Component
 * 
 * Server component that triggers browser to start fetching images immediately
 * during HTML parse, before React hydration. This eliminates the image loading
 * delay that occurs when image URLs are only known after client-side JS runs.
 * 
 * Uses React 18's preload API which injects <link rel="preload"> into <head>.
 * 
 * Usage:
 * ```tsx
 * // In a Server Component
 * <ImagePreloader src="https://cdn.example.com/image.jpg" />
 * ```
 */

import { preconnect, preload } from 'react-dom';

interface ImagePreloaderProps {
  /** Image URL to preload */
  src: string;
  /** Resource type - defaults to 'image' */
  as?: 'image';
  /** Fetch priority - 'high' for LCP images */
  fetchPriority?: 'high' | 'low' | 'auto';
}

/**
 * Preloads an image using React's preload API.
 * 
 * This is a Server Component that tells the browser to start fetching
 * the image immediately when parsing HTML, before React hydration begins.
 * 
 * For listing detail pages, preloading the primary image eliminates the
 * flash/delay that occurs when:
 * 1. Server renders skeleton (client component)
 * 2. Client hydrates
 * 3. React Query initializes with data
 * 4. Image URL becomes known
 * 5. Browser starts fetching (THIS IS TOO LATE!)
 * 
 * With preload, step 5 happens at step 0 (HTML parse time).
 */
export function ImagePreloader({ src, as = 'image', fetchPriority = 'high' }: ImagePreloaderProps) {
  try {
    const origin = new URL(src).origin;
    preconnect(origin);
  } catch {
    // Ignore invalid or relative URLs.
  }

  // React's preload() injects <link rel="preload"> into <head>
  // This runs during SSR, so the link tag is in initial HTML
  preload(src, { 
    as,
    fetchPriority,
  });
  
  // This component renders nothing - it just triggers the preload
  return null;
}
