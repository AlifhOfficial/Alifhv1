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
import { getCdnPublicUrl } from '@/utils';

export const runtime = 'nodejs';

/**
 * Attach public URLs to all image fields for preview display
 */
function attachPublicUrls(showroom: any) {
  const cacheBuster = new Date(showroom.updatedAt).getTime();
  const toCdn = (key: string | null | undefined) => getCdnPublicUrl(key, cacheBuster);
  const toCdnArray = (keys: string[] | null | undefined) => (keys || []).map((key) => toCdn(key)).filter((key): key is string => Boolean(key));
  
  return {
    ...showroom,
    heroVideoThumbnail: toCdn(showroom.heroVideoThumbnail),
    heroImage: toCdn(showroom.heroImage),
    founderImage: toCdn(showroom.founderImage),
    showroomImages: toCdnArray(showroom.showroomImages),
    showroomExteriorImages: toCdnArray(showroom.showroomExteriorImages),
    clientLogos: toCdnArray(showroom.clientLogos),
    seoImage: toCdn(showroom.seoImage),
    // Hero
    heroVideoThumbnailUrl: toCdn(showroom.heroVideoThumbnail),
    heroImageUrl: toCdn(showroom.heroImage),
    // Founder
    founderImageUrl: toCdn(showroom.founderImage),
    // Gallery
    showroomImagesUrls: toCdnArray(showroom.showroomImages),
    // Exterior
    showroomExteriorImagesUrls: toCdnArray(showroom.showroomExteriorImages),
    // Client logos
    clientLogosUrls: toCdnArray(showroom.clientLogos),
    // SEO
    seoImageUrl: toCdn(showroom.seoImage),
    // Partner branding
    partner: {
      ...showroom.partner,
      logo: toCdn(showroom.partner.logo),
      heroImage: toCdn(showroom.partner.heroImage),
      logoUrl: toCdn(showroom.partner.logo),
      heroImageUrl: toCdn(showroom.partner.heroImage),
    },
    // Team members
    teamMembers: (showroom.teamMembers || []).map((member: any) => ({
      ...member,
      image: toCdn(member.image),
      imageUrl: toCdn(member.image),
    })),
    // Achievements
    achievements: (showroom.achievements || []).map((achievement: any) => ({
      ...achievement,
      image: toCdn(achievement.image),
      imageUrl: toCdn(achievement.image),
    })),
    // Testimonials
    featuredTestimonials: (showroom.featuredTestimonials || []).map((testimonial: any) => {
      const cdnImage = toCdn(testimonial.customerImage);
      return {
        ...testimonial,
        customerImage: cdnImage || testimonial.customerImageUrl || null,
        customerImageUrl: testimonial.customerImageUrl || cdnImage || null,
      };
    }),
    // Press features
    pressFeatures: (showroom.pressFeatures || []).map((feature: any) => ({
      ...feature,
      logo: toCdn(feature.logo),
      logoUrl: toCdn(feature.logo),
    })),
  };
}

export async function GET(_req: NextRequest) {
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
