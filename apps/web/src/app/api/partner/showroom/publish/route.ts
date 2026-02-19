/**
 * API: Partner Showroom Publish
 * POST /api/partner/showroom/publish
 * 
 * Purpose: Publish or unpublish a showroom
 * 
 * Authentication: Required (must be Black tier partner owner/admin)
 * 
 * Request Body:
 * - action: 'publish' | 'unpublish'
 * 
 * Validation:
 * - Slug must be set before publishing
 * - At least hero image or video required for publishing
 */

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth/session-context';
import {
  getShowroomByPartnerId,
  publishShowroom,
  unpublishShowroom,
} from '@alifh/database';

export const runtime = 'nodejs';


const PublishSchema = z.object({
  action: z.enum(['publish', 'unpublish']),
});

export async function POST(req: NextRequest) {
  try {
    // Require authentication
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Must be a partner staff member
    if (!user.partnerMemberships?.length) {
      return NextResponse.json({ error: 'Not a partner member' }, { status: 403 });
    }
    
    const membership = user.partnerMemberships[0];
    
    // Must be Black tier
    if (membership.partnerTier !== 'black') {
      return NextResponse.json({ 
        error: 'Showroom is exclusive to Black tier partners' 
      }, { status: 403 });
    }
    
    // Must be owner or admin
    if (!['owner', 'admin'].includes(membership.staffRole)) {
      return NextResponse.json({ 
        error: 'Insufficient permissions. Owner or admin role required.' 
      }, { status: 403 });
    }
    
    
    // Parse body
    const body = await req.json();
    const parseResult = PublishSchema.safeParse(body);
    
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Invalid action. Must be "publish" or "unpublish"',
      }, { status: 400 });
    }
    
    const { action } = parseResult.data;
    
    // Get current showroom
    const showroom = await getShowroomByPartnerId(membership.partnerId);
    
    if (!showroom) {
      return NextResponse.json({ 
        error: 'Showroom not found. Create one first.' 
      }, { status: 404 });
    }
    
    if (action === 'publish') {
      // Validate required fields for publishing
      if (!showroom.slug) {
        return NextResponse.json({
          error: 'Slug is required before publishing',
          field: 'slug',
        }, { status: 400 });
      }
      
      // Check for hero media: image, uploaded video file, or embed URL
      if (!showroom.heroImage && !showroom.heroVideoFile && !showroom.heroVideoUrl) {
        return NextResponse.json({
          error: 'Hero image or video is required before publishing',
          field: 'heroImage',
        }, { status: 400 });
      }
      
      if (!showroom.heroTagline) {
        return NextResponse.json({
          error: 'Hero tagline is required before publishing',
          field: 'heroTagline',
        }, { status: 400 });
      }
      
      const published = await publishShowroom(showroom.id);
      
      // Invalidate caches
      revalidatePath('/black');
      revalidatePath(`/showroom/${membership.partnerId}`);
      if (published.slug) {
        revalidatePath(`/showroom/${published.slug}`);
      }
      
      return NextResponse.json({
        success: true,
        isPublished: true,
        publishedAt: published.publishedAt,
        slug: published.slug,
        message: 'Showroom is now live!',
      });
    } else {
      const unpublished = await unpublishShowroom(showroom.id);
      
      // Invalidate caches
      revalidatePath('/black');
      revalidatePath(`/showroom/${membership.partnerId}`);
      if (showroom.slug) {
        revalidatePath(`/showroom/${showroom.slug}`);
      }
      
      return NextResponse.json({
        success: true,
        isPublished: false,
        message: 'Showroom has been unpublished',
      });
    }
    
  } catch (error) {
    console.error('[api/partner/showroom/publish] POST failed:', error);
    return NextResponse.json({ error: 'Failed to update publish status' }, { status: 500 });
  }
}
