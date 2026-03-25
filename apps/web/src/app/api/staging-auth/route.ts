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

    // Only set Secure flag when actually served over HTTPS (not localhost http)
    const isHttps = request.url.startsWith("https://");

    const response = NextResponse.json({ success: true });
    response.cookies.set("site-access-granted", "true", {
      httpOnly: true,
      secure: isHttps,
      sameSite: "strict",
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
