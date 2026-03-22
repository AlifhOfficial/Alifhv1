import type { UploadFileParams, UploadResult, SignedUrlOptions, StorageStatus } from "./types";
import { buildKey } from "@/utils/storage";
import { R2PrivateStorageProvider, getPrivateBucketStatus } from "./private-provider";

let provider: R2PrivateStorageProvider | null = null;

function resolveProvider(): R2PrivateStorageProvider {
  if (provider) return provider;
  provider = new R2PrivateStorageProvider();
  return provider;
}

export async function uploadPrivateFile(params: UploadFileParams): Promise<UploadResult> {
  const key = buildKey({ directory: params.directory, fileName: params.fileName, key: params.key });
  return resolveProvider().upload({
    key,
    data: params.data,
    contentType: params.contentType,
    cacheControl: params.cacheControl,
    metadata: params.metadata,
  });
}

export async function deletePrivateFile(key: string): Promise<void> {
  await resolveProvider().delete(key);
}

export async function getPrivateSignedUrl(key: string, options?: SignedUrlOptions): Promise<string> {
  return resolveProvider().getSignedUrl(key, options);
}

export function getPrivateStorageStatus(): StorageStatus {
  try {
    const status = getPrivateBucketStatus();
    if (status.isConfigured) {
      return {
        provider: "r2",
        bucket: status.bucket,
        publicUrl: null, // Private bucket has no public URL
        isConfigured: true,
      };
    }
  } catch (error) {
    console.warn("Error reading R2 private bucket status", error);
  }

  return {
    provider: "mock",
    bucket: undefined,
    publicUrl: undefined,
    isConfigured: true,
  };
}
