import { Platform, Share } from 'react-native';
import { buildPublicListingUrl } from '@/lib/config';

interface ShareListingOptions {
  listingIdOrSlug: string;
  title: string;
}

const BRAND_LINE = 'Buy and sell cars on Revvup. Free. Forever.';

export async function shareListing({ listingIdOrSlug, title }: ShareListingOptions) {
  const shareUrl = buildPublicListingUrl(listingIdOrSlug);

  if (Platform.OS === 'web') {
    if (navigator?.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
    }
    return;
  }

  if (Platform.OS === 'ios') {
    await Share.share({
      title,
      message: BRAND_LINE,
      url: shareUrl,
    });
    return;
  }

  await Share.share({
    title,
    message: `${BRAND_LINE}\n${shareUrl}`,
  });
}
