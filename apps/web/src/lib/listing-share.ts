import { buildListingShareImageUrl, buildListingSharePayload, type ListingShareInput } from '@alifh/shared';
import { PUBLIC_SITE_URL } from '@/lib/site-url';

/**
 * Canonical branded OG image URL for a listing.
 * Used by web metadata, mobile share payloads, and any preview surface.
 */
export function buildListingBrandedImageUrl(listingId: string): string {
  return buildListingShareImageUrl(PUBLIC_SITE_URL, listingId);
}

type ShareListingOptions = Omit<ListingShareInput, 'baseUrl'>;

export async function shareListing(options: ShareListingOptions) {
  const payload = buildListingSharePayload({
    ...options,
    baseUrl: PUBLIC_SITE_URL,
  });

  try {
    if (navigator.share) {
      await navigator.share({
        text: payload.textWithUrl,
      });
      return;
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(payload.textWithUrl);
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return;
    }

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(payload.textWithUrl);
      } catch {
        // Ignore clipboard failures after share failure.
      }
    }
  }
}
