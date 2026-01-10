/**
 * KYC Data Encryption Module
 * 
 * Provides AES-256-GCM encryption for sensitive KYC data like:
 * - Document numbers (Emirates ID, passport numbers)
 * - Personal identification data
 * 
 * Security Best Practices:
 * - Uses AES-256-GCM (authenticated encryption)
 * - Unique IV for each encryption
 * - Encryption key stored in environment variable
 * - Data encrypted at rest in database
 * 
 * @module lib/kyc/encryption
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 16;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Check if encryption is configured
 */
export function isEncryptionConfigured(): boolean {
  return Boolean(process.env.KYC_ENCRYPTION_SECRET);
}

// Get encryption key from environment
const getEncryptionKey = (): Buffer => {
  const secret = process.env.KYC_ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error('KYC_ENCRYPTION_SECRET environment variable is required');
  }
  // Use a static salt for key derivation (consistent across restarts)
  const salt = process.env.KYC_ENCRYPTION_SALT || 'alifh-kyc-salt-v1';
  return scryptSync(secret, salt, KEY_LENGTH);
};

/**
 * Encrypts sensitive data using AES-256-GCM
 * Returns original value if encryption is not configured (for backwards compatibility)
 * 
 * @param plaintext - The sensitive data to encrypt
 * @returns Base64 encoded encrypted data (includes IV and auth tag)
 */
export function encryptSensitiveData(plaintext: string): string {
  if (!plaintext) return plaintext;
  
  // If encryption is not configured, return plaintext (development mode)
  if (!isEncryptionConfigured()) {
    return plaintext;
  }
  
  try {
    const key = getEncryptionKey();
    const iv = randomBytes(IV_LENGTH);
    
    const cipher = createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    const authTag = cipher.getAuthTag();
    
    // Combine IV + authTag + encrypted data
    // Format: base64(IV) + ':' + base64(authTag) + ':' + base64(encrypted)
    return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
  } catch (error) {
    console.error('[KYC/Encryption] Encryption failed:', error);
    throw new Error('Failed to encrypt sensitive data');
  }
}

/**
 * Decrypts sensitive data encrypted with encryptSensitiveData
 * 
 * @param encryptedData - Base64 encoded encrypted data
 * @returns The original plaintext
 */
export function decryptSensitiveData(encryptedData: string): string {
  if (!encryptedData) return encryptedData;
  
  // Check if data is encrypted (has our format)
  if (!encryptedData.includes(':')) {
    // Data might not be encrypted (legacy), return as-is
    return encryptedData;
  }
  
  try {
    const key = getEncryptionKey();
    const [ivBase64, authTagBase64, encrypted] = encryptedData.split(':');
    
    if (!ivBase64 || !authTagBase64 || !encrypted) {
      // Invalid format, return as-is (might be unencrypted legacy data)
      return encryptedData;
    }
    
    const iv = Buffer.from(ivBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');
    
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('[KYC/Encryption] Decryption failed:', error);
    // Return masked value if decryption fails (don't expose the encrypted data)
    return '********';
  }
}

/**
 * Checks if a value appears to be encrypted
 */
export function isEncrypted(value: string): boolean {
  if (!value) return false;
  const parts = value.split(':');
  return parts.length === 3 && parts.every(p => p.length > 0);
}

/**
 * Masks a sensitive value for display
 * Shows first 2 and last 2 characters only
 */
export function maskSensitiveValue(value: string): string {
  if (!value || value.length <= 4) return '****';
  return `${value.substring(0, 2)}${'*'.repeat(value.length - 4)}${value.substring(value.length - 2)}`;
}

/**
 * Masks document number for safe logging/display
 * Format: 784-****-*******-*
 */
export function maskDocumentNumber(docNumber: string): string {
  if (!docNumber) return '';
  
  // Emirates ID format: 784-XXXX-XXXXXXX-X
  if (docNumber.includes('-')) {
    const parts = docNumber.split('-');
    return parts.map((part, i) => i === 0 ? part : '*'.repeat(part.length)).join('-');
  }
  
  // Generic masking for other document types
  return maskSensitiveValue(docNumber);
}

// Re-export for convenience
export const kycEncryption = {
  encrypt: encryptSensitiveData,
  decrypt: decryptSensitiveData,
  isEncrypted,
  mask: maskSensitiveValue,
  maskDocNumber: maskDocumentNumber,
};
