import type { MyListingCard, MyListingsFilter } from '@/lib/sell-car-user-api';
import { buildListingTitle } from '@/components/user-inventory-management/utilities/listing-helpers';

export interface InventorySheetRouteParams {
  activeTab?: string | string[];
  listingId?: string | string[];
  listingTitle?: string | string[];
  listingThumbnail?: string | string[];
  moderationStatus?: string | string[];
  lifecycleStatus?: string | string[];
  isArchived?: string | string[];
  expiresAt?: string | string[];
  viewCount?: string | string[];
  impressionCount?: string | string[];
  favouriteCount?: string | string[];
  superlikeCount?: string | string[];
  totalCount?: string | string[];
  activeCount?: string | string[];
  draftCount?: string | string[];
  pendingCount?: string | string[];
  soldCount?: string | string[];
  archivedCount?: string | string[];
  aiModeration?: string | string[];
  hardDelete?: string | string[];
}

export function toRouteInputParams(params: InventorySheetRouteParams) {
  return Object.fromEntries(
    Object.entries(params).flatMap(([key, value]) => {
      const singleValue = getStringParam(value);
      return singleValue === undefined ? [] : [[key, singleValue]];
    }),
  );
}

export function getStringParam(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function parseBooleanParam(value?: string | string[]) {
  return getStringParam(value) === 'true';
}

export function parseNumberParam(value?: string | string[], fallback = 0) {
  const parsed = Number(getStringParam(value));
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function parseAiModerationParam(value?: string | string[]): MyListingCard['aiModeration'] | null {
  const raw = getStringParam(value);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as MyListingCard['aiModeration'];
  } catch {
    return null;
  }
}

export function buildInventoryRouteParams(activeTab?: MyListingsFilter | string) {
  if (!activeTab || activeTab === 'all') {
    return {};
  }

  return { tab: activeTab };
}

export function buildInventoryEditTriggerParams({
  listingId,
  activeTab,
  isPublishedEdit,
}: {
  listingId: string;
  activeTab?: string;
  isPublishedEdit: boolean;
}) {
  return {
    ...buildInventoryRouteParams(activeTab),
    editListingId: listingId,
    editPublished: isPublishedEdit ? 'true' : 'false',
    editNonce: String(Date.now()),
  };
}

export function buildInventorySheetParams(listing: MyListingCard, activeTab?: MyListingsFilter) {
  return {
    ...buildInventoryRouteParams(activeTab),
    activeTab: activeTab ?? 'all',
    listingId: listing.id,
    listingTitle: buildListingTitle(listing.year, listing.make, listing.model, listing.trim),
    listingThumbnail: listing.thumbnail ?? undefined,
    moderationStatus: listing.moderationStatus,
    lifecycleStatus: listing.lifecycleStatus,
    isArchived: listing.isArchived ? 'true' : 'false',
    expiresAt: listing.expiresAt ?? undefined,
    viewCount: String(listing.viewCount ?? 0),
    impressionCount: String(listing.impressionCount ?? 0),
    favouriteCount: String(listing.favouriteCount ?? 0),
    superlikeCount: String(listing.superlikeCount ?? 0),
    aiModeration: listing.aiModeration ? JSON.stringify(listing.aiModeration) : undefined,
  };
}