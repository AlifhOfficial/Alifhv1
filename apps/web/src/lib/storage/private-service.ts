import type { UploadFileParams, UploadResult, SignedUrlOptions, StorageStatus } from "./types";
import { buildKey } from "@/utils/storage";
import { MockStorageProvider } from "./mock-provider";
import { R2PrivateStorageProvider, getPrivateBucketStatus } from "./private-provider";
import type { StorageProvider } from "./types";

const isProduction = process.env.NODE_ENV === "production";

let provider: StorageProvider | null = null;

function resolveProvider(): StorageProvider {
  if (provider) return provider;

  if (isProduction) {
    try {
      provider = new R2PrivateStorageProvider();
      return provider;
    } catch (error) {
      console.warn("R2 private storage configuration failed, falling back to mock storage.", error);
    }
  } else {
    const status = getPrivateBucketStatus();
    if (status.isConfigured) {
      try {
        provider = new R2PrivateStorageProvider();
        return provider;
      } catch (error) {
        console.warn("R2 private storage init failed in development, using mock storage.", error);
      }
    }
  }

  provider = new MockStorageProvider();
  return provider;
}

export async function uploadPrivateFile(params: UploadFileParams): Promise<UploadResult> {
  const currentProvider = resolveProvider();
  const key = buildKey({ directory: params.directory, fileName: params.fileName, key: params.key });

  return currentProvider.upload({
    key,
    data: params.data,
    contentType: params.contentType,
    cacheControl: params.cacheControl,
    metadata: params.metadata,
  });
}

export async function deletePrivateFile(key: string): Promise<void> {
  const currentProvider = resolveProvider();
  await currentProvider.delete(key);
}

export async function getPrivateSignedUrl(key: string, options?: SignedUrlOptions): Promise<string> {
  const currentProvider = resolveProvider();
  return currentProvider.getSignedUrl(key, options);
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
