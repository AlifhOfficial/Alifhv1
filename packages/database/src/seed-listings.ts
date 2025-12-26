/**
 * Legacy entrypoint for listing seeding.
 *
 * The original `seed-listings.ts` drifted far from the current `car_listing` schema.
 * Keep this file so existing docs/commands still work, but delegate to the
 * schema-aligned seeder.
 */

import './seed-listings-new';

