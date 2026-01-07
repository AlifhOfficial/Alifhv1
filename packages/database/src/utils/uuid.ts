/**
 * Generate UUIDv7 (time-sortable) when running in Bun,
 * fallback to UUIDv4 during Next.js build or in other runtimes.
 * 
 * UUIDv7 benefits:
 * - Time-sortable (better for database indexes)
 * - Better B-tree index locality (reduces fragmentation)
 * - Still globally unique like v4
 */
export function generateId(): string {
  // @ts-ignore - Bun global may not exist during Next.js build
  if (typeof globalThis.Bun !== 'undefined' && globalThis.Bun.randomUUIDv7) {
    return globalThis.Bun.randomUUIDv7();
  }
  // Fallback to v4 for Next.js build and non-Bun runtimes
  return crypto.randomUUID();
}
