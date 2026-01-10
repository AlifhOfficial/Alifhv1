/**
 * KYC Duplicate Document Detection Module
 * 
 * OPTIMIZED: Uses indexed document_hash column for O(1) lookups.
 * Falls back to legacy O(n) scan if hash column not populated.
 * 
 * @module lib/kyc/duplicate-check
 */

import { createHash } from 'crypto';
import { db, kycRecord, eq, and, ne, isNull } from '@alifh/database';
import { decryptSensitiveData, isEncrypted } from './encryption';

/**
 * Create a normalized SHA-256 hash of a document number for comparison.
 * Normalizes by removing spaces/dashes and lowercasing.
 */
export function hashDocumentNumber(docNumber: string): string {
  const normalized = docNumber.replace(/[\s-]/g, '').toLowerCase();
  return createHash('sha256').update(normalized).digest('hex');
}

/**
 * O(1) OPTIMIZED: Check if a document hash exists in the indexed column.
 * This is the primary check method using the kyc_record_documentHash_idx index.
 * 
 * @param docHash - The SHA-256 hash of the document number
 * @param currentUserId - The user ID to exclude from the check
 * @returns true if duplicate found, false otherwise
 */
async function checkDuplicateByHash(
  docHash: string,
  currentUserId: string
): Promise<boolean> {
  // Single indexed query - O(1) with btree index
  const existingRecord = await db.query.kycRecord.findFirst({
    where: and(
      eq(kycRecord.documentHash, docHash),
      eq(kycRecord.status, 'approved'),
      ne(kycRecord.userId, currentUserId)
    ),
    columns: { id: true },
  });

  return !!existingRecord;
}

/**
 * LEGACY: Check duplicates by decrypting records without hash (O(n)).
 * Only used as fallback when documentHash column is not populated.
 * 
 * @deprecated Use checkDuplicateByHash when hash column is available
 */
async function checkDuplicateLegacy(
  docHash: string,
  currentUserId: string
): Promise<boolean> {
  // Only fetch approved records from other users WITHOUT a hash (filter at DB level)
  const existingRecords = await db.query.kycRecord.findMany({
    where: and(
      eq(kycRecord.status, 'approved'),
      ne(kycRecord.userId, currentUserId),
      isNull(kycRecord.documentHash)
    ),
    columns: {
      id: true,
      documentNumber: true,
    },
    limit: 100,
  });

  for (const record of existingRecords) {
    if (!record.documentNumber) continue;

    const decrypted = isEncrypted(record.documentNumber)
      ? decryptSensitiveData(record.documentNumber)
      : record.documentNumber;

    const existingHash = hashDocumentNumber(decrypted);
    if (existingHash === docHash) {
      return true;
    }
  }

  return false;
}

/**
 * Check if a document number has already been used by another verified user.
 * 
 * OPTIMIZED: First tries O(1) indexed lookup on documentHash column.
 * Falls back to legacy O(n) scan only for records without hash populated.
 * 
 * @param docNumber - The plaintext document number to check
 * @param currentUserId - The user ID to exclude from the check
 * @returns true if duplicate found, false otherwise
 */
export async function checkDuplicateDocument(
  docNumber: string,
  currentUserId: string
): Promise<boolean> {
  const docHash = hashDocumentNumber(docNumber);

  // Primary: O(1) indexed lookup
  const foundByHash = await checkDuplicateByHash(docHash, currentUserId);
  if (foundByHash) return true;

  // Fallback: Check legacy records without hash column populated
  // This path diminishes over time as new records get hashes
  return checkDuplicateLegacy(docHash, currentUserId);
}
