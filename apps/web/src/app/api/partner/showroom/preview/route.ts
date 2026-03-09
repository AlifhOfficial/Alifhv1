/**
 * API: Partner Showroom Preview
 * GET /api/partner/showroom/preview
 * 
 * Purpose: Allow partner owners/admins to preview their showroom before publishing
 * Authentication: Required (must be Black tier partner staff with owner/admin role)
 * 
 * Returns showroom data in public format (same as public API) but works for unpublished showrooms
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import { getShowroomPreviewByPartnerId } from '@alifh/database';
import { getPublicUrl } from '@/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Attach public URLs to all image fields for preview display
 */
function attachPublicUrls(showroom: any) {
  const cacheBuster = new Date(showroom.updatedAt).getTime();
  
  return {
    ...showroom,
    // Hero
    heroVideoThumbnailUrl: getPublicUrl(showroom.heroVideoThumbnail, cacheBuster),
    heroImageUrl: getPublicUrl(showroom.heroImage, cacheBuster),
    // Founder
    founderImageUrl: getPublicUrl(showroom.founderImage, cacheBuster),
    // Gallery
    showroomImagesUrls: (showroom.showroomImages || []).map((key: string) => getPublicUrl(key, cacheBuster)),
    // Exterior
    showroomExteriorImagesUrls: (showroom.showroomExteriorImages || []).map((key: string) => getPublicUrl(key, cacheBuster)),
    // Client logos
    clientLogosUrls: (showroom.clientLogos || []).map((key: string) => getPublicUrl(key, cacheBuster)),
    // SEO
    seoImageUrl: getPublicUrl(showroom.seoImage, cacheBuster),
    // Partner branding
    partner: {
      ...showroom.partner,
      logoUrl: getPublicUrl(showroom.partner.logo, cacheBuster),
      heroImageUrl: getPublicUrl(showroom.partner.heroImage, cacheBuster),
    },
    // Team members
    teamMembers: (showroom.teamMembers || []).map((member: any) => ({
      ...member,
      imageUrl: getPublicUrl(member.image, cacheBuster),
    })),
    // Achievements
    achievements: (showroom.achievements || []).map((achievement: any) => ({
      ...achievement,
      imageUrl: getPublicUrl(achievement.image, cacheBuster),
    })),
    // Testimonials
    featuredTestimonials: (showroom.featuredTestimonials || []).map((testimonial: any) => ({
      ...testimonial,
      customerImageUrl: getPublicUrl(testimonial.customerImage, cacheBuster),
    })),
    // Press features
    pressFeatures: (showroom.pressFeatures || []).map((feature: any) => ({
      ...feature,
      logoUrl: getPublicUrl(feature.logo, cacheBuster),
    })),
  };
}

export async function GET(req: NextRequest) {
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
    
    // Get showroom preview (works for unpublished showrooms)
    const showroom = await getShowroomPreviewByPartnerId(membership.partnerId);
    
    if (!showroom) {
      return NextResponse.json({ error: 'Showroom not found' }, { status: 404 });
    }
    
    // Attach public URLs
    const showroomWithUrls = attachPublicUrls(showroom);
    
    return NextResponse.json({ 
      showroom: showroomWithUrls,
      isPreview: true,
    });
    
  } catch (error) {
    console.error('[api/partner/showroom/preview] GET failed:', error);
    return NextResponse.json({ error: 'Failed to fetch showroom preview' }, { status: 500 });
  }
}
