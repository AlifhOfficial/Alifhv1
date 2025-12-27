import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl as awsGetSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { StorageProvider, UploadResult, SignedUrlOptions } from "./types";
import { normalizeKey, toUint8Array } from "@/utils/storage";

const bucketName = process.env.R2_PRIVATE_BUCKET_NAME || "alifh-private-data";
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const accountId = process.env.R2_ACCOUNT_ID;
const explicitEndpoint = process.env.R2_ENDPOINT;

const endpoint = explicitEndpoint || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined);

function ensureConfigured() {
  if (!bucketName || !accessKeyId || !secretAccessKey || !endpoint) {
    throw new Error("R2 private storage is not fully configured. Check environment variables.");
  }
}

export class R2PrivateStorageProvider implements StorageProvider {
  private client: S3Client;

  constructor() {
    ensureConfigured();
    this.client = new S3Client({
      region: "auto",
      endpoint,
      credentials: {
        accessKeyId: accessKeyId!,
        secretAccessKey: secretAccessKey!,
      },
    });
  }

  async upload(params: { key: string; data: any; contentType: string; cacheControl?: string; metadata?: Record<string, string> }): Promise<UploadResult> {
    const key = normalizeKey(params.key);
    const body = await toUint8Array(params.data);

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: params.contentType,
      CacheControl: params.cacheControl,
      Metadata: params.metadata,
    });

    const result = await this.client.send(command);

    // Private bucket - no public URL, only signed URLs
    return {
      key,
      etag: result.ETag ?? undefined,
      url: undefined, // Private files don't have public URLs
    };
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: normalizeKey(key),
      })
    );
  }

  async getSignedUrl(key: string, options?: SignedUrlOptions): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: normalizeKey(key),
      ResponseContentDisposition: options?.downloadName
        ? `attachment; filename="${encodeURIComponent(options.downloadName)}"`
        : undefined,
    });

    return awsGetSignedUrl(this.client, command, {
      expiresIn: options?.expiresIn ?? 3600, // 1 hour default for private files
    });
  }
}

export function getPrivateBucketStatus() {
  return {
    provider: "r2-private" as const,
    bucket: bucketName,
    isConfigured: Boolean(bucketName && accessKeyId && secretAccessKey && endpoint),
  };
}
