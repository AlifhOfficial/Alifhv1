import { buildPublicListingUrl } from '@/lib/site-url';

interface ShareListingOptions {
  listingIdOrSlug: string;
  title: string;
  details?: string | null;
}

function buildShareText(title: string, details?: string | null) {
  return details
    ? `Buy and sell cars on Revvup. Free. Forever.\n${title}\n${details}`
    : `Buy and sell cars on Revvup. Free. Forever.\n${title}`;
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
