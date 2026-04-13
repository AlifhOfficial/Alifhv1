/**
 * Listing Helpers — User Inventory Management
 *
 * Pure utility functions for formatting, status mapping, and display logic.
 * No API calls — these are used by sheets and future screens.
 */

import type { CreateListingData } from "@/components/sheets/create-listing/types";
import type {
  ListingFormPayload,
  ModerationStatus,
  LifecycleStatus,
} from "@/lib/sell-car-user-api";

// ─── Status Display ──────────────────────────────────────────────────────────

/**
 * Human-readable status string from the two status fields.
 * Priority: lifecycleStatus overrides moderationStatus for terminal states.
 */
export function formatListingStatus(
  moderation: ModerationStatus,
  lifecycle: LifecycleStatus,
): string {
  // Rejected takes priority — rejected listings have lifecycleStatus 'archived'
  // but should always display as "Rejected"
  if (moderation === "rejected") return "Rejected";

  // Terminal lifecycle states
  switch (lifecycle) {
    case "sold":
      return "Sold";
    case "expired":
      return "Expired";
    case "deleted":
      return "Deleted";
    case "archived":
      return "Archived";
  }

  // Active → show moderation status
  switch (moderation) {
    case "draft":
      return "Draft";
    case "submitted":
      return "In Review";
    case "pending_review":
      return "In Review";
    case "approved":
      return "Active";
    default:
      return "Unknown";
  }
}

/**
 * Map status combination to a semantic color from the theme palette.
 * Returns a color string ready for use in styles.
 */
export function getStatusColor(
  moderation: ModerationStatus,
  lifecycle: LifecycleStatus,
  colors: {
    success: string;
    warning: string;
    error: string;
    primary: string;
    labelQuaternary: string;
    labelSecondary: string;
  },
): string {
  // Rejected takes priority — rejected listings have lifecycleStatus 'archived'
  // but should always show error color
  if (moderation === "rejected") return colors.error;

  // Terminal lifecycle states
  switch (lifecycle) {
    case "sold":
      return colors.success;
    case "expired":
      return colors.warning;
    case "deleted":
      return colors.error;
    case "archived":
      return colors.labelQuaternary;
  }

  // Active → moderation determines color
  switch (moderation) {
    case "draft":
      return colors.labelSecondary;
    case "submitted":
      return colors.warning;
    case "pending_review":
      return colors.warning;
    case "approved":
      return colors.success;
    default:
      return colors.labelQuaternary;
  }
}

/**
 * Whether this listing should navigate to the public listing detail screen.
 * Public detail is only meaningful for live, publicly viewable listings.
 */
export function canOpenPublicListing(
  moderation: ModerationStatus,
  lifecycle: LifecycleStatus,
): boolean {
  return moderation === "approved" && lifecycle === "active";
}

// ─── Expiry Helpers ──────────────────────────────────────────────────────────

export interface ExpiryCountdown {
  /** Human-readable text: "Expires in 2 days", "Expired 3 days ago" */
  text: string;
  /** True if ≤ 2 days remaining (eligible for extension) */
  isUrgent: boolean;
  /** True if already expired */
  isExpired: boolean;
  /** Days remaining (negative if expired) */
  daysLeft: number;
}

/**
 * Format an expiry date into a human-readable countdown.
 */
export function formatExpiryCountdown(expiresAt: string): ExpiryCountdown {
  const now = Date.now();
  const expiry = new Date(expiresAt).getTime();
  const diffMs = expiry - now;
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysLeft <= 0) {
    const daysAgo = Math.abs(daysLeft);
    return {
      text:
        daysAgo === 0
          ? "Expired today"
          : `Expired ${daysAgo} day${daysAgo === 1 ? "" : "s"} ago`,
      isUrgent: true,
      isExpired: true,
      daysLeft,
    };
  }

  if (daysLeft === 1) {
    return {
      text: "Expires tomorrow",
      isUrgent: true,
      isExpired: false,
      daysLeft,
    };
  }

  if (daysLeft <= 2) {
    return {
      text: `Expires in ${daysLeft} days`,
      isUrgent: true,
      isExpired: false,
      daysLeft,
    };
  }

  if (daysLeft <= 7) {
    return {
      text: `Expires in ${daysLeft} days`,
      isUrgent: false,
      isExpired: false,
      daysLeft,
    };
  }

  // More than a week
  return {
    text: `Expires in ${daysLeft} days`,
    isUrgent: false,
    isExpired: false,
    daysLeft,
  };
}

// ─── Listing Title ───────────────────────────────────────────────────────────

/**
 * Build a display title from make/model/year.
 * e.g. "2024 Toyota Camry"
 */
export function buildListingTitle(
  year: number,
  make: string,
  model: string,
  trim?: string | null,
): string {
  const parts = [String(year), make, model];
  if (trim) parts.push(trim);
  return parts.join(" ");
}

// ─── Price Formatting ────────────────────────────────────────────────────────

/**
 * Format price with currency for display.
 * e.g. "AED 125,000" or "AED 1,250,000"
 */
export function formatPrice(
  price: number | null | undefined,
  currency = "AED",
): string {
  if (price == null) return `${currency} —`;
  const formatted = price.toLocaleString("en-US");
  return `${currency} ${formatted}`;
}

// ─── Mileage Formatting ──────────────────────────────────────────────────────

/**
 * Format mileage for display.
 * e.g. "15,000 km" or "0 km"
 */
export function formatMileage(mileage: number | null | undefined): string {
  if (mileage == null) return "— km";
  return `${mileage.toLocaleString("en-US")} km`;
}

// ─── Edit Flow Mapping ───────────────────────────────────────────────────────

export function buildCreateListingInitialData(
  listing: ListingFormPayload,
): Partial<CreateListingData> {
  return {
    vin: listing.vin || "",
    vinVerified: true,
    vinVisibility: listing.vinVisibility || "public",
    make: listing.make || "",
    model: listing.model || "",
    year: listing.year?.toString() || "",
    trim: listing.trim || "",
    mileage: listing.mileage?.toString() || "",
    specs: listing.specs || "gcc",
    steeringSide: listing.steeringSide || "left",
    bodyType: listing.bodyType || "",
    exteriorColor: listing.exteriorColor || "",
    interiorColor: listing.interiorColor || "",
    doors: listing.doors?.toString() || "",
    seatingCapacity: listing.seatingCapacity?.toString() || "",
    fuelType: listing.fuelType || "",
    transmission: listing.transmission || "",
    engineSize: listing.engineSize || "",
    engineType: listing.engineType || "",
    cylinders: listing.cylinders?.toString() || "",
    powerRange: listing.powerRange || "",
    fuelEconomy: listing.fuelEconomy || "",
    torque: listing.torque || "",
    warrantyType: listing.warrantyType || "",
    exportStatus: listing.exportStatus || "local_only",
    extras: listing.extras || [],
    tags: listing.tags || [],
    price: listing.price?.toString() || "",
    isNegotiable: listing.isNegotiable ?? false,
    emirate: listing.emirate || "",
    city: listing.city || "",
    images: listing.images || [],
    description: listing.description || "",
    specialNotes: Array.isArray(listing.specialNotes?.ownerRemarks)
      ? listing.specialNotes.ownerRemarks
      : [],
  };
}
