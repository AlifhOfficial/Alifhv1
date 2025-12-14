import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const directory = formData.get("directory");
    const fileName = formData.get("fileName") ?? (typeof file === "object" && "name" in file ? (file as File).name : undefined);
    const contentType = (typeof file === "object" && "type" in file && file.type) || formData.get("contentType") || "application/octet-stream";
    const cacheControl = formData.get("cacheControl") ?? undefined;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Invalid file payload" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();

    const result = await uploadFile({
      data: arrayBuffer,
      contentType: typeof contentType === "string" ? contentType : "application/octet-stream",
      directory: typeof directory === "string" ? directory : undefined,
      fileName: typeof fileName === "string" ? fileName : undefined,
      cacheControl: typeof cacheControl === "string" ? cacheControl : undefined,
    });

    return NextResponse.json({
      key: result.key,
      url: result.url,
      etag: result.etag,
    });
  } catch (error) {
    console.error("Storage upload failed", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
