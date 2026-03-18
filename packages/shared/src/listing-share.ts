const BRAND_TAGLINE = 'Buy and sell cars on Revvup. Free. Forever.';
const SHARE_INTRO = 'Look what I found on Revvup';

const priceFormatter = new Intl.NumberFormat('en-AE', {
  style: 'currency',
  currency: 'AED',
  maximumFractionDigits: 0,
});

const EMIRATE_LABELS: Record<string, string> = {
  dubai: 'Dubai',
  abu_dhabi: 'Abu Dhabi',
  sharjah: 'Sharjah',
  ajman: 'Ajman',
  ras_al_khaimah: 'Ras Al Khaimah',
  fujairah: 'Fujairah',
  umm_al_quwain: 'Umm Al Quwain',
};

const SPECS_LABELS: Record<string, string> = {
  gcc: 'GCC',
  us: 'US',
  european: 'European',
  japanese: 'Japanese',
  canadian: 'Canadian',
  american: 'American',
};

export interface ListingShareInput {
  baseUrl: string;
  listingId: string;
  title?: string | null;
  details?: string | null;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  trim?: string | null;
  price?: number | null;
  mileage?: number | null;
  emirate?: string | null;
  specs?: string | null;
}

export interface ListingSharePayload {
  title: string;
  details: string | null;
  url: string;
  imageUrl: string;
  text: string;
  textWithUrl: string;
}

function normalizeBaseUrl(baseUrl: string): string {
  const trimmed = baseUrl.replace(/\/$/, '');

  try {
    const url = new URL(trimmed);
    if (url.hostname === 'www.revvup.ae') {
      return `https://revvup.ae${url.pathname === '/' ? '' : url.pathname}`;
    }
  } catch {
    // Fall back to the raw input below.
  }

  return trimmed;
}

function formatEmirate(emirate?: string | null): string | null {
  if (!emirate) return null;
  const normalized = emirate.trim().toLowerCase().replace(/\s+/g, '_');
  return EMIRATE_LABELS[normalized] || emirate.replace(/_/g, ' ');
}

function formatSpecs(specs?: string | null): string | null {
  if (!specs) return null;
  const normalized = specs.trim().toLowerCase();
  return SPECS_LABELS[normalized] || specs;
}

function buildTitle(input: ListingShareInput): string {
  if (input.title?.trim()) return input.title.trim();

  const title = [input.year, input.make, input.model, input.trim]
    .filter((part) => part !== null && part !== undefined && String(part).trim().length > 0)
    .join(' ')
    .trim();

  return title || 'Car listing on Revvup';
}

function buildDetails(input: ListingShareInput): string | null {
  if (input.details !== undefined) {
    const normalized = input.details?.trim();
    return normalized || null;
  }

  const specsLabel = formatSpecs(input.specs);
  const parts = [
    typeof input.price === 'number' ? priceFormatter.format(input.price) : null,
    typeof input.mileage === 'number' ? `${input.mileage.toLocaleString()} km` : null,
    specsLabel ? `${specsLabel} Specs` : null,
    formatEmirate(input.emirate),
  ].filter((part): part is string => Boolean(part));

  return parts.length > 0 ? parts.join(' • ') : null;
}

export function buildListingShareUrl(baseUrl: string, listingId: string): string {
  return `${normalizeBaseUrl(baseUrl)}/listings/${encodeURIComponent(listingId)}`;
}

export function buildListingShareImageUrl(baseUrl: string, listingId: string): string {
  return `${buildListingShareUrl(baseUrl, listingId)}/opengraph-image`;
}

export function buildListingSharePayload(input: ListingShareInput): ListingSharePayload {
  const title = buildTitle(input);
  const details = buildDetails(input);
  const url = buildListingShareUrl(input.baseUrl, input.listingId);
  const imageUrl = buildListingShareImageUrl(input.baseUrl, input.listingId);
  const text = [SHARE_INTRO, title, details, BRAND_TAGLINE].filter(Boolean).join('\n');

  return {
    title,
    details,
    url,
    imageUrl,
    text,
    textWithUrl: `${text}\n${url}`,
  };
}
