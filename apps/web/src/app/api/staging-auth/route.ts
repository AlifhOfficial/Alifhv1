/**
 * Staging Auth API
 * 
 * Verifies site password and sets access cookie.
 * Cookie lasts 7 days or until browser session ends.
 */

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const sitePassword = process.env.SITE_PASSWORD;

    if (!sitePassword) {
      // No password configured - shouldn't happen but allow access
      return NextResponse.json({ success: true });
    }

    if (password !== sitePassword) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    // Set access cookie - 7 days expiry
    // Note: Not setting explicit domain so cookie only applies to exact host
    // This prevents ws.revvup.ae from using revvup.ae's cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set("site-access-granted", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" && 
              (process.env.BETTER_AUTH_URL?.startsWith("https://") ?? true),
      sameSite: "strict", // Changed from lax to strict for security
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
