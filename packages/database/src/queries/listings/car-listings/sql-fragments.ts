/**
 * Shared SQL Fragments for Listings
 * 
 * Reusable SQL expressions to avoid duplication across queries.
 * 
 * @module queries/listings/car-listings/sql-fragments
 */

import { sql, SQL } from 'drizzle-orm';
import { carListing } from '../../../schema/listing';

/**
 * SQL expression for checking if a listing is currently public.
 * A listing is public when:
 * - moderationStatus = 'approved'
 * - lifecycleStatus = 'active'
 * - needsRemoderation = false
 * - expiresAt is not null and in the future
 * 
 * @param now - Current date for expiry comparison (defaults to SQL now())
 * @returns SQL boolean expression
 */
export function isPublicSql(now?: Date): SQL<boolean> {
  const expiryCheck = now
    ? sql`${carListing.expiresAt} > ${now}`
    : sql`${carListing.expiresAt} > now()`;

  return sql<boolean>`
    (${carListing.moderationStatus} = 'approved'
      AND ${carListing.lifecycleStatus} = 'active'
      AND ${carListing.needsRemoderation} = false
      AND ${carListing.expiresAt} IS NOT NULL
      AND ${expiryCheck})
  `;
}

/**
 * SQL expression for extracting suspension reason from specialNotes JSON.
 * Handles both old and new JSON structure formats.
 * 
 * @returns SQL string | null expression
 */
export function suspensionReasonSql(): SQL<string | null> {
  return sql<string | null>`
    coalesce(
      ${carListing.specialNotes} ->> 'suspensionReason',
      ${carListing.specialNotes} -> 'moderation' ->> 'reason'
    )
  `;
}

/**
 * SQL expression for extracting suspended timestamp from specialNotes JSON.
 * Handles both old and new JSON structure formats.
 * 
 * @returns SQL string | null expression
 */
export function suspendedAtSql(): SQL<string | null> {
  return sql<string | null>`
    coalesce(
      ${carListing.specialNotes} ->> 'suspendedAt',
      ${carListing.specialNotes} -> 'moderation' ->> 'suspendedAt'
    )
  `;
}

/**
 * SQL expression for checking if a listing is a black listing.
 * Only checks the listing-level flag - partner tier does NOT auto-grant black status.
 * Black listings are quota-controlled: black tier partners get 5, others get 1.
 * 
 * @returns SQL boolean expression
 */
export function isBlkListingSql(): SQL<boolean> {
  return sql<boolean>`${carListing.isBlkListing}`;
}
