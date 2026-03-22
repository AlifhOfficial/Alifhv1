import type { UploadFileParams, UploadResult, SignedUrlOptions, StorageStatus } from "./types";
import { buildKey } from "@/utils/storage";
import { R2StorageProvider, getR2Status } from "./r2-provider";

let provider: R2StorageProvider | null = null;

function resolveProvider(): R2StorageProvider {
  if (provider) return provider;
  provider = new R2StorageProvider();
  return provider;
}

export async function uploadFile(params: UploadFileParams): Promise<UploadResult> {
  const key = buildKey({ directory: params.directory, fileName: params.fileName, key: params.key });
  return resolveProvider().upload({
    key,
    data: params.data,
    contentType: params.contentType,
    cacheControl: params.cacheControl,
    metadata: params.metadata,
  });
}

export async function deleteFile(key: string): Promise<void> {
  await resolveProvider().delete(key);
}

export async function getSignedUrl(key: string, options?: SignedUrlOptions): Promise<string> {
  return resolveProvider().getSignedUrl(key, options);
}

export function getStorageStatus(): StorageStatus {
  return getR2Status();
}
