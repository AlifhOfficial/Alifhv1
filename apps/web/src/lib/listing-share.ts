import { buildPublicListingUrl, buildPublicUrl } from '@/lib/site-url';

const BRAND_TAGLINE = 'Buy and sell cars on Revvup. Free. Forever.';

/**
 * Canonical branded OG image URL for a listing.
 * Used by web metadata, mobile share payloads, and any preview surface.
 */
export function buildListingBrandedImageUrl(listingIdOrSlug: string): string {
  return buildPublicUrl(`/listings/${listingIdOrSlug}/opengraph-image`);
}

interface ShareListingOptions {
  listingIdOrSlug: string;
  title: string;
  details?: string | null;
}

function buildShareText(title: string, details?: string | null) {
  return details
    ? `${BRAND_TAGLINE}\n${title}\n${details}`
    : `${BRAND_TAGLINE}\n${title}`;
}

export async function shareListing({
  listingIdOrSlug,
  title,
  details,
}: ShareListingOptions) {
  const url = buildPublicListingUrl(listingIdOrSlug);
  const text = buildShareText(title, details);

  try {
    if (navigator.share) {
      await navigator.share({ title, text, url });
      return;
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return;
    }

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        // Ignore clipboard failures after share failure.
      }
    }
  }
}
