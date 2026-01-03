/**
 * Shared error utilities for listing queries
 * 
 * @module queries/listings/car-listings/error-utils
 */

/**
 * Check if error is due to missing database column
 * Used for graceful degradation during schema migrations
 */
export function isMissingColumnError(err: unknown, columnName: string): boolean {
  const anyErr = err as any;
  const code = anyErr?.code ?? anyErr?.cause?.code;
  const message = String(anyErr?.message ?? anyErr?.cause?.message ?? '');
  return code === '42703' && message.includes(columnName);
}
