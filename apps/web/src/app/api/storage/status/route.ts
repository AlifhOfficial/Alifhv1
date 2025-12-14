import { NextResponse } from "next/server";
import { getStorageStatus } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET() {
  try {
    const status = getStorageStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error("Failed to load storage status", error);
    return NextResponse.json({ error: "Failed to load storage status" }, { status: 500 });
  }
}
