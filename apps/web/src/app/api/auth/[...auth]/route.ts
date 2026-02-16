/**
 * Better Auth API Route - [...auth]
 * 
 * Handles all auth operations: sign-in, sign-up, OAuth, magic links, etc.
 * Supports dynamic baseURL to allow both localhost and network IP access.
 * Also supports mobile apps that don't send Origin headers.
 */

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Allowed origins for CORS and dynamic baseURL
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  process.env.NEXT_PUBLIC_NETWORK_URL || "",
  "http://192.168.1.14:3000",
  "http://192.168.1.33:3000",
  "http://localhost:3001",
  "http://192.168.1.14:8081",
  "http://192.168.1.33:8081",
  "http://192.168.1.103:3000",
  "http://192.168.1.109:3000",
  "http://192.168.1.109:8081",
  "https://claims-son-sixth-classification.trycloudflare.com",
].filter(Boolean);

// Check if a request should be allowed (either from allowed origin or mobile app without origin)
function isRequestAllowed(origin: string | null): boolean {
  // Allow requests without origin (mobile apps, server-to-server)
  if (!origin) return true;
  // Allow known origins
  return ALLOWED_ORIGINS.includes(origin);
}

/**
 * Get the base URL from the request to support both localhost and network IPs
 * This prevents OAuth state_mismatch errors when accessing from different origins
 */
function getBaseURLFromRequest(request: Request): string {
  const url = new URL(request.url);
  // Use the host from the request (includes port)
  const baseURL = `${url.protocol}//${url.host}`;
  
  // Only allow known origins for security
  if (ALLOWED_ORIGINS.includes(baseURL)) {
    return baseURL;
  }
  
  // Fall back to configured URL
  return process.env.BETTER_AUTH_URL || "http://localhost:3000";
}

function addCorsHeaders(response: Response, origin: string | null): Response {
  // For mobile apps (no origin) or allowed origins, add CORS headers
  if (isRequestAllowed(origin)) {
    const headers = new Headers(response.headers);
    // Use the origin if provided, otherwise use wildcard for mobile apps
    headers.set("Access-Control-Allow-Origin", origin || "*");
    headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie, Origin");
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
  
  if (isRequestAllowed(origin)) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin || "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie, Origin",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400",
      },
    });
  }
  
  return new NextResponse(null, { status: 204 });
}

export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  // Override baseURL header so Better Auth uses the correct origin for OAuth callbacks
  const baseURL = getBaseURLFromRequest(request);
  const modifiedRequest = new Request(request.url, {
    method: request.method,
    headers: new Headers([...request.headers.entries(), ["x-forwarded-host", new URL(baseURL).host]]),
    body: request.body,
    // @ts-ignore - duplex is needed for streaming bodies
    duplex: "half",
  });
  const response = await auth.handler(modifiedRequest);
  return addCorsHeaders(response, origin);
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  // Override baseURL header so Better Auth uses the correct origin for OAuth callbacks
  const baseURL = getBaseURLFromRequest(request);
  
  // Check if request has a body - handle empty bodies for endpoints like sign-out
  const contentLength = request.headers.get("content-length");
  const hasBody = contentLength && parseInt(contentLength) > 0;
  
  const modifiedRequest = new Request(request.url, {
    method: request.method,
    headers: new Headers([...request.headers.entries(), ["x-forwarded-host", new URL(baseURL).host]]),
    body: hasBody ? request.body : null,
    // @ts-ignore - duplex is needed for streaming bodies
    ...(hasBody ? { duplex: "half" } : {}),
  });
  const response = await auth.handler(modifiedRequest);
  return addCorsHeaders(response, origin);
}