export const PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') || 'https://revvup.ae';

export function buildPublicUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${PUBLIC_SITE_URL}${normalizedPath}`;
}

export function buildPublicListingUrl(listingIdOrSlug: string): string {
  return buildPublicUrl(`/listings/${listingIdOrSlug}`);
}
