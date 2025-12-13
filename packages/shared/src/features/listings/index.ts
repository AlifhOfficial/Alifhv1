/**
 * Shared listing domain contracts.
 *
 * Keep this module UI-agnostic so both web and mobile can consume it.
 */

export type ListingId = string;

export type ListingStatus = "draft" | "published" | "archived" | "sold";

export interface ListingSummary {
  id: ListingId;
  title: string;
  partnerId: string;
  status: ListingStatus;
  priceAed: number;
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListingFilters {
  partnerIds?: string[];
  statuses?: ListingStatus[];
  priceMinAed?: number;
  priceMaxAed?: number;
  search?: string;
}

export interface ListingSort {
  field: "createdAt" | "priceAed" | "updatedAt";
  direction: "asc" | "desc";
}
