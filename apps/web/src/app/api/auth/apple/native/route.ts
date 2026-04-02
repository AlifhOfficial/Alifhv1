/**
 * Apple Native Sign In API Route
 * 
 * Handles Apple Sign In from iOS native apps using expo-apple-authentication.
 * Receives the identity token from the app, verifies it with Apple's public keys,
 * and creates/updates the user session.
 */

import { NextRequest, NextResponse } from "next/server";
import { createRemoteJWKSet, jwtVerify, JWTPayload } from "jose";
import { db, eq } from "@alifh/database";
import * as schema from "@alifh/database";

// Apple's public keys for JWT verification
const APPLE_KEYS_URL = "https://appleid.apple.com/auth/keys";
const appleJWKS = createRemoteJWKSet(new URL(APPLE_KEYS_URL));

// Expected issuer and audience for Apple tokens
const APPLE_ISSUER = "https://appleid.apple.com";
// Can be bundle ID (for native) or services ID (for web)
const VALID_AUDIENCES = [
  process.env.APPLE_CLIENT_ID || "ae.revvup.mobile",
  "ae.revvup.mobile", // Always allow the bundle ID
];

interface AppleTokenPayload extends JWTPayload {
  sub: string; // Apple user ID
  email?: string;
  email_verified?: string | boolean;
  is_private_email?: string | boolean;
  auth_time?: number;
  nonce_supported?: boolean;
}

interface AppleSignInRequest {
  identityToken: string;
  authorizationCode?: string;
  fullName?: {
    givenName?: string;
    familyName?: string;
  } | null;
  email?: string | null;
  user: string; // Apple user ID
}

export async function POST(request: NextRequest) {
  try {
    const body: AppleSignInRequest = await request.json();
    
    if (!body.identityToken) {
      return NextResponse.json(
        { success: false, error: "Missing identity token" },
        { status: 400 }
      );
    }
    
    console.warn("[Apple Auth] Verifying identity token");
    
    // Verify the JWT with Apple's public keys
    let payload: AppleTokenPayload;
    try {
      const { payload: verifiedPayload } = await jwtVerify(
        body.identityToken,
        appleJWKS,
        {
          issuer: APPLE_ISSUER,
          audience: VALID_AUDIENCES,
        }
      );
      payload = verifiedPayload as AppleTokenPayload;
    } catch (verifyError: any) {
      console.error("[Apple Auth] Token verification failed:", verifyError.message);
      return NextResponse.json(
        { success: false, error: "Invalid Apple token" },
        { status: 401 }
      );
    }
    
    console.warn("[Apple Auth] Token verified for user:", payload.sub);
    
    // Extract user info from token
    // Note: Apple only sends email/name on FIRST sign in
    const appleUserId = payload.sub;
    const email = payload.email || body.email;
    const isPrivateEmail = payload.is_private_email === "true" || payload.is_private_email === true;
    
    // Build display name from fullName (only available on first sign in)
    let displayName = "";
    if (body.fullName) {
      const parts = [body.fullName.givenName, body.fullName.familyName].filter(Boolean);
      displayName = parts.join(" ");
    }
    
    // Better fallback name than ugly email prefix
    // If it's a private relay email, don't use it as the name
    const fallbackName = isPrivateEmail || email?.includes("privaterelay.appleid.com") 
      ? "Apple User" 
      : (email ? email.split("@")[0] : "Apple User");
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required for sign in" },
        { status: 400 }
      );
    }
    
    // Check if user already exists with this Apple ID (via account table)
    const existingAccount = await db
      .select()
      .from(schema.account)
      .where(eq(schema.account.accountId, appleUserId))
      .limit(1);
    
    let userId: string;
    let user: typeof schema.user.$inferSelect | null = null;
    
    if (existingAccount.length > 0) {
      // User exists - get their info
      userId = existingAccount[0].userId;
      const users = await db
        .select()
        .from(schema.user)
        .where(eq(schema.user.id, userId))
        .limit(1);
      
      if (users.length === 0) {
        return NextResponse.json(
          { success: false, error: "User account not found" },
          { status: 404 }
        );
      }
      
      user = users[0];
      console.warn("[Apple Auth] Existing user found:", userId);
    } else {
      // Check if a user with this email already exists to link accounts
      const existingUsers = await db
        .select()
        .from(schema.user)
        .where(eq(schema.user.email, email.toLowerCase()))
        .limit(1);
      
      if (existingUsers.length > 0) {
        // Link Apple account to existing user
        user = existingUsers[0];
        userId = user.id;
        
        await db.insert(schema.account).values({
          id: crypto.randomUUID(),
          userId: userId,
          accountId: appleUserId,
          providerId: "apple",
          accessToken: null,
          refreshToken: null,
          accessTokenExpiresAt: null,
          refreshTokenExpiresAt: null,
          scope: null,
          idToken: body.identityToken,
          password: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        
        console.warn("[Apple Auth] Linked Apple account to existing user:", userId);
      } else {
        // Create new user
        userId = crypto.randomUUID();
        
        await db.insert(schema.user).values({
          id: userId,
          email: email.toLowerCase(),
          emailVerified: true, // Apple emails are verified
          name: displayName || fallbackName,
          image: null,
          role: "user",
          banned: false,
          banReason: null,
          banExpires: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        
        // Create account record
        await db.insert(schema.account).values({
          id: crypto.randomUUID(),
          userId: userId,
          accountId: appleUserId,
          providerId: "apple",
          accessToken: null,
          refreshToken: null,
          accessTokenExpiresAt: null,
          refreshTokenExpiresAt: null,
          scope: null,
          idToken: body.identityToken,
          password: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        
        // Get the created user
        const newUsers = await db
          .select()
          .from(schema.user)
          .where(eq(schema.user.id, userId))
          .limit(1);
        
        user = newUsers[0];
        
        console.warn("[Apple Auth] Created new user:", userId);
      }
    }
    
    // Create a session using Better Auth's internal API
    // We'll generate a bearer token for the mobile app
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    await db.insert(schema.session).values({
      id: crypto.randomUUID(),
      userId: userId,
      token: sessionToken,
      expiresAt: expiresAt,
      ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || null,
      userAgent: request.headers.get("user-agent") || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    console.warn("[Apple Auth] Session created for user:", userId);
    
    // Return session info to mobile app
    return NextResponse.json({
      success: true,
      token: sessionToken,
      expiresAt: expiresAt.toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        emailVerified: user.emailVerified,
      },
    });
    
  } catch (error: any) {
    console.error("[Apple Auth] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Apple sign in failed" },
      { status: 500 }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
