/**
 * R2 upload helpers.
 * Singleton S3Client with connection reuse for high throughput.
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import {
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_ENDPOINT,
  R2_BUCKET_NAME,
} from './config.ts';

const CDN_CACHE = 'public, max-age=31536000, immutable';

const client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
  requestHandler: {
    requestTimeout: 30_000,
    httpsAgent: {
      keepAlive: true,
      keepAliveMsecs: 1000,
      maxSockets: 50,
    },
  } as any,
});

export async function putWebp(key: string, body: Buffer): Promise<void> {
  await client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: 'image/webp',
      CacheControl: CDN_CACHE,
    }),
  );
}
