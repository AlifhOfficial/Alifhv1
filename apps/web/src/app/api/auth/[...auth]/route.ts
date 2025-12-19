/**
 * Better Auth API Route - [...auth]
 * 
 * Handles all auth operations: sign-in, sign-up, OAuth, magic links, etc.
 */

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  process.env.NEXTAUTH_URL || "http://localhost:3000",
  process.env.NEXT_PUBLIC_NETWORK_URL || "",
  "http://192.168.1.14:3000",
  "http://192.168.1.14:8081",
  "http://192.168.1.109:3000",
  "http://192.168.1.109:8081",
].filter(Boolean);

function addCorsHeaders(response: Response, origin: string | null): Response {
  // Check if origin is allowed
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    const headers = new Headers(response.headers);
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie");
    headers.set("Access-Control-Allow-Credentials", "true");
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }
  return response;
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400",
      },
    });
  }
  
  return new NextResponse(null, { status: 204 });
}

export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  const response = await auth.handler(request);
  return addCorsHeaders(response, origin);
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const response = await auth.handler(request);
  return addCorsHeaders(response, origin);
}