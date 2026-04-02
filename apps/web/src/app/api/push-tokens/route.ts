/**
 * Push Token Registration API
 * POST: Register a device push token
 * DELETE: Unregister a device push token
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import { registerPushToken, unregisterPushToken } from '@alifh/database';

export const runtime = 'nodejs';

// ============================================================================
// POST /api/push-tokens
// Register a push token for the authenticated user
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { token, platform, deviceId, deviceName } = body;

    // Validate required fields
    if (!token) {
      return NextResponse.json(
        { error: 'Push token is required' },
        { status: 400 }
      );
    }

    if (!platform || !['ios', 'android', 'web'].includes(platform)) {
      return NextResponse.json(
        { error: 'Valid platform (ios, android, web) is required' },
        { status: 400 }
      );
    }

    // Validate Expo push token format
    if (!token.startsWith('ExponentPushToken[') && !token.startsWith('ExpoPushToken[')) {
      return NextResponse.json(
        { error: 'Invalid Expo push token format' },
        { status: 400 }
      );
    }

    // Register the token
    const result = await registerPushToken({
      userId: user.id,
      token,
      platform,
      deviceId,
      deviceName,
    });

    console.warn(`[Push API] Registered token for user ${user.id}: ${result.created ? 'created' : 'updated'}`);

    return NextResponse.json({
      success: true,
      id: result.id,
      created: result.created,
    });
  } catch (error) {
    console.error('[Push API] Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register push token' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/push-tokens
// Unregister a push token (device logout)
// ============================================================================

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Push token is required' },
        { status: 400 }
      );
    }

    // Unregister the token (doesn't require auth - token is enough)
    const removed = await unregisterPushToken(token);

    console.warn(`[Push API] Unregistered token: ${removed ? 'success' : 'not found'}`);

    return NextResponse.json({
      success: true,
      removed,
    });
  } catch (error) {
    console.error('[Push API] Unregister error:', error);
    return NextResponse.json(
      { error: 'Failed to unregister push token' },
      { status: 500 }
    );
  }
}
