import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@alifh/database";
import * as schema from "@alifh/database";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, callbackURL, newUserCallbackURL, errorCallbackURL } = body ?? {};

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const existingUser = await db.query.user.findFirst({
      where: eq(schema.user.email, email),
    });

    if (!existingUser) {
      console.warn("[magic-link] Attempt for non-existent user", email);
      return NextResponse.json(
        {
          error:
            "No account found with this email address. Magic links are only available for existing users. Please sign up first or use a different email.",
        },
        { status: 400 }
      );
    }

    const result = await auth.api.signInMagicLink({
      body: {
        email,
        callbackURL,
        newUserCallbackURL,
        errorCallbackURL,
      },
      headers: request.headers,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[magic-link] Error", error);
    return NextResponse.json(
      { error: error?.message || "Failed to send magic link" },
      { status: 500 }
    );
  }
}
