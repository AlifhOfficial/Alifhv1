import { Platform, Share } from 'react-native';
import { buildListingShareImageUrl, buildListingSharePayload, type ListingShareInput } from '@alifh/shared';
import { PUBLIC_SITE_URL } from '@/lib/config';

/**
 * Canonical branded OG image URL for a listing.
 * Matches the web opengraph-image route — sharing the listing URL
 * causes iMessage/WhatsApp/Telegram to fetch this as the link preview.
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

  if (Platform.OS === 'web') {
    if (navigator?.clipboard) {
      await navigator.clipboard.writeText(payload.textWithUrl);
    }
    return;
  }

  await Share.share({
    message: payload.textWithUrl,
  });
}
