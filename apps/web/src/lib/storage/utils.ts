import { createId } from "@paralleldrive/cuid2";
import type { StorageData, UploadFileParams } from "./types";

export function normalizeKey(key: string): string {
  return key.replace(/\\+/g, "/").replace(/^\/+|\/+$/g, "");
}

export function buildKey(params: Pick<UploadFileParams, "directory" | "fileName" | "key">): string {
  if (params.key) return normalizeKey(params.key);
  const id = createId();
  const safeName = params.fileName?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") ?? "file";
  const segments = [params.directory, `${safeName}-${id}`].filter(Boolean) as string[];
  return normalizeKey(segments.join("/"));
}

export async function toUint8Array(data: StorageData): Promise<Uint8Array> {
  if (Buffer.isBuffer(data)) return data;
  if (data instanceof Uint8Array) return data;
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  if (typeof data === "string") return Buffer.from(data, "utf-8");

  if (typeof data === "object" && data !== null && typeof (data as any).pipe === "function") {
    const chunks: Buffer[] = [];
    for await (const chunk of data as any) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  throw new TypeError("Unsupported storage data type");
}
