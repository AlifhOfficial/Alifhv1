const BRAND_ASSET_VERSION = '20260315-brand-kit';
const BRAND_ASSET_BASE_URL = `${(process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://cdn.revvup.ae').replace(/\/$/, '')}/marketing/brand`;
const withVersion = (url: string) => `${url}?v=${BRAND_ASSET_VERSION}`;

export const BRAND_LOGO_SVG = withVersion(`${BRAND_ASSET_BASE_URL}/Revvup_logo.svg`);
export const BRAND_LOGO_SCHEMA_URL = BRAND_LOGO_SVG;
export const BRAND_FAVICON_SVG_URL = withVersion(`${BRAND_ASSET_BASE_URL}/favicon.svg`);
export const BRAND_FAVICON_PNG_URL = withVersion(`${BRAND_ASSET_BASE_URL}/favicon.png`);
export const BRAND_FAVICON_ICO_URL = withVersion(`${BRAND_ASSET_BASE_URL}/favicon.ico`);
export const BRAND_APPLE_TOUCH_ICON_URL = withVersion(`${BRAND_ASSET_BASE_URL}/apple-touch-icon.png`);
export const BRAND_ICON_192_URL = withVersion(`${BRAND_ASSET_BASE_URL}/icon-192x192.png`);
export const BRAND_ICON_512_URL = withVersion(`${BRAND_ASSET_BASE_URL}/icon-512x512.png`);
