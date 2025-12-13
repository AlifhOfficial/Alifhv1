import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@alifh/database";
import * as schema from "@alifh/database";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, redirectTo } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user exists before allowing password reset
    const existingUsers = await db
      .select()
      .from(schema.user)
      .where(eq(schema.user.email, email))
      .limit(1)
      .execute();
    
    if (!existingUsers || existingUsers.length === 0) {
      console.log("🚫 Password reset request for non-existent user:", email);
      return NextResponse.json(
        { 
          error: "No account found with this email address. Please check your email or sign up for a new account." 
        },
        { status: 400 }
      );
    }

    // User exists, proceed with Better Auth's password reset
    console.log("📧 Proceeding with password reset for existing user:", email);
    
    const result = await auth.api.requestPasswordReset({
      body: { email, redirectTo },
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}