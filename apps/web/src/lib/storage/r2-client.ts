/**
 * Singleton R2/S3 Client
 * 
 * Reuses TCP connections across requests for faster uploads.
 * Import this instead of creating new S3Client instances.
 */

import { S3Client } from '@aws-sdk/client-s3';

const bucketName = process.env.R2_BUCKET_NAME;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const accountId = process.env.R2_ACCOUNT_ID;
const explicitEndpoint = process.env.R2_ENDPOINT;

const endpoint = explicitEndpoint || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined);

// Singleton client - reused across requests in warm serverless instances
let _client: S3Client | null = null;

/**
 * Get singleton S3 client for R2 operations
 * Throws if R2 is not configured
 */
export function getR2Client(): S3Client {
  if (_client) return _client;
  
  if (!bucketName || !accessKeyId || !secretAccessKey || !endpoint) {
    throw new Error('R2 storage not configured. Check R2_* environment variables.');
  }
  
  _client = new S3Client({
    region: 'auto',
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    // Connection reuse settings for better performance
    requestHandler: {
      requestTimeout: 30000,
      httpsAgent: {
        maxSockets: 50,        // Allow more concurrent connections
        keepAlive: true,       // Reuse TCP connections
        keepAliveMsecs: 1000,  // Keep alive for 1 second between requests
      },
    } as any,
  });
  
  return _client;
}

/**
 * R2 bucket name
 */
export function getR2Bucket(): string {
  if (!bucketName) throw new Error('R2_BUCKET_NAME not configured');
  return bucketName;
}

/**
 * CDN base URL for public access
 */
export function getCdnUrl(): string {
  return process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '';
}
