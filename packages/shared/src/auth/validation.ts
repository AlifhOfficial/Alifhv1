/**
 * Validation Helpers - Simple safeParse wrapper
 * 
 * Tiny helper so every API doesn't rewrite safeParse.
 */

import { z } from 'zod';

// =============================================================================
// VALIDATION RESULT TYPE
// =============================================================================

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Array<{ field: string; message: string }> };

// =============================================================================
// VALIDATION HELPER
// =============================================================================

export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    errors: result.error.issues.map(issue => ({
      field: issue.path.join('.') || 'root',
      message: issue.message,
    })),
  };
}