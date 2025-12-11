/**
 * Better Auth API Route - [...auth]
 * 
 * Handles all auth operations: sign-in, sign-up, OAuth, magic links, etc.
 */

import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  return auth.handler(request);
}

export async function POST(request: Request) {
  return auth.handler(request);
}