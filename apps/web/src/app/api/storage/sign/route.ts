import { NextRequest, NextResponse } from "next/server";
import { getSignedUrl } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { key, expiresIn, downloadName } = await req.json();

    if (!key || typeof key !== "string") {
      return NextResponse.json({ error: "Missing key" }, { status: 400 });
    }

    const url = await getSignedUrl(key, {
      expiresIn: typeof expiresIn === "number" ? expiresIn : undefined,
      downloadName: typeof downloadName === "string" ? downloadName : undefined,
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Signed URL generation failed", error);
    return NextResponse.json({ error: "Failed to generate signed URL" }, { status: 500 });
  }
}
