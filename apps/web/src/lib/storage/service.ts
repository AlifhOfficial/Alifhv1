import type { UploadFileParams, UploadResult, SignedUrlOptions, StorageStatus } from "./types";
import { buildKey } from "./utils";
import { MockStorageProvider } from "./mock-provider";
import { R2StorageProvider, getR2Status } from "./r2-provider";
import type { StorageProvider } from "./types";

const isProduction = process.env.NODE_ENV === "production";

let provider: StorageProvider | null = null;

function resolveProvider(): StorageProvider {
  if (provider) return provider;

  if (isProduction) {
    try {
      provider = new R2StorageProvider();
      return provider;
    } catch (error) {
      console.warn("R2 storage configuration failed, falling back to mock storage.", error);
    }
  } else {
    const status = getR2Status();
    if (status.isConfigured) {
      try {
        provider = new R2StorageProvider();
        return provider;
      } catch (error) {
        console.warn("R2 storage init failed in development, using mock storage.", error);
      }
    }
  }

  provider = new MockStorageProvider();
  return provider;
}

export async function uploadFile(params: UploadFileParams): Promise<UploadResult> {
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

export async function deleteFile(key: string): Promise<void> {
  const currentProvider = resolveProvider();
  await currentProvider.delete(key);
}

export async function getSignedUrl(key: string, options?: SignedUrlOptions): Promise<string> {
  const currentProvider = resolveProvider();
  return currentProvider.getSignedUrl(key, options);
}

export function getStorageStatus(): StorageStatus {
  try {
    const status = getR2Status();
    if (status.isConfigured) {
      return status;
    }
  } catch (error) {
    console.warn("Error reading R2 status", error);
  }

  return {
    provider: "mock",
    bucket: undefined,
    publicUrl: undefined,
    isConfigured: true,
  };
}
