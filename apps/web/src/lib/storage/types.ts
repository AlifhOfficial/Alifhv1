import type { Readable } from "node:stream";

export type StorageData = Buffer | Uint8Array | ArrayBuffer | string | Readable;

export interface UploadFileParams {
  /** Optional directory prefix, e.g. "avatars" */
  directory?: string;
  /** Optional key override. If omitted we generate one. */
  key?: string;
  /** Raw file contents */
  data: StorageData;
  /** MIME type */
  contentType: string;
  /** Optional name used when generating default key */
  fileName?: string;
  /** Optional cache control header */
  cacheControl?: string;
  /** Custom metadata forwarded to provider */
  metadata?: Record<string, string>;
}

export interface UploadResult {
  key: string;
  url?: string;
  etag?: string;
}

export interface SignedUrlOptions {
  expiresIn?: number;
  downloadName?: string;
}

export interface StorageProvider {
  upload(params: Required<Pick<UploadFileParams, "key" | "data" | "contentType">> & Omit<UploadFileParams, "key">): Promise<UploadResult>;
  delete(key: string): Promise<void>;
  getSignedUrl(key: string, options?: SignedUrlOptions): Promise<string>;
}

export interface StorageStatus {
  provider: "mock" | "r2" | "unknown";
  bucket?: string;
  publicUrl?: string | null;
  isConfigured: boolean;
}
