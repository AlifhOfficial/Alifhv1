import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Zero-work ping endpoint to measure pure Railway + Next.js overhead */
export async function GET() {
  const start = Date.now();
  const response = NextResponse.json({ ok: true, ts: start });
  response.headers.set('Server-Timing', `total;dur=${Date.now() - start}`);
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
