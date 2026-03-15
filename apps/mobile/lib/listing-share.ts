import { Platform, Share } from 'react-native';
import { buildPublicListingUrl, buildPublicUrl } from '@/lib/config';

const BRAND_TAGLINE = 'Buy and sell cars on Revvup. Free. Forever.';

/**
 * Canonical branded OG image URL for a listing.
 * Matches the web opengraph-image route — sharing the listing URL
 * causes iMessage/WhatsApp/Telegram to fetch this as the link preview.
 */
export function buildListingBrandedImageUrl(listingIdOrSlug: string): string {
  return buildPublicUrl(`/listings/${listingIdOrSlug}/opengraph-image`);
}

interface ShareListingOptions {
  listingIdOrSlug: string;
  title: string;
  details?: string | null;
}

export async function shareListing({ listingIdOrSlug, title, details }: ShareListingOptions) {
  const shareUrl = buildPublicListingUrl(listingIdOrSlug);
  const body = details ? `${title}\n${details}\n${BRAND_TAGLINE}` : `${title}\n${BRAND_TAGLINE}`;

  if (Platform.OS === 'web') {
    if (navigator?.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
    }
    return;
  }

  if (Platform.OS === 'ios') {
    // iOS: share ONLY the url — no message field.
    // Passing message+url puts both on the clipboard (double paste bug).
    // Apps like iMessage/WhatsApp/Telegram fetch the OG tags from the URL
    // and render the branded 1200×630 card automatically.
    await Share.share({
      title,
      url: shareUrl,
    });
    return;
  }

  // Android: embed URL in the message body so link-preview kicks in.
  await Share.share({
    title,
    message: `${body}\n${shareUrl}`,
  });
}
