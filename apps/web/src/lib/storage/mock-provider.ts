import type { StorageProvider, UploadResult, SignedUrlOptions } from "./types";
import { normalizeKey } from "@/utils/storage";

// Edge-compatible UUID generator (Web Crypto API)
function generateUUID(): string {
  return crypto.randomUUID();
}

const mockStore = new Map<string, Buffer>();

export class MockStorageProvider implements StorageProvider {
  async upload(params: { key: string; data: any; contentType: string; cacheControl?: string; metadata?: Record<string, string> }): Promise<UploadResult> {
    const key = normalizeKey(params.key);
    const buffer = await toBuffer(params.data);
    mockStore.set(key, buffer);

    return {
      key,
      url: `https://mock-storage.alifh.local/${encodeURIComponent(key)}`,
      etag: generateUUID(),
    };
  }

  async delete(key: string): Promise<void> {
    mockStore.delete(normalizeKey(key));
  }

  async getSignedUrl(key: string, _options?: SignedUrlOptions): Promise<string> {
    const normalized = normalizeKey(key);
    const token = generateUUID();
    return `https://mock-storage.alifh.local/${encodeURIComponent(normalized)}?token=${token}`;
  }
}

async function toBuffer(data: any): Promise<Buffer> {
  if (Buffer.isBuffer(data)) return data;
  if (typeof data === "string") return Buffer.from(data);
  if (data instanceof ArrayBuffer) return Buffer.from(data);
  if (ArrayBuffer.isView(data)) return Buffer.from(data.buffer);

  if (typeof data === "object" && typeof data.pipe === "function") {
    const chunks: Buffer[] = [];
    for await (const chunk of data) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  throw new TypeError("Unsupported mock storage data type");
}
