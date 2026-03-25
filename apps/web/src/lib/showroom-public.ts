import {
  incrementShowroomViews,
  type SearchResponse,
} from '@alifh/database';
import { getCdnPublicUrl } from '@/utils';
import {
  getCachedShowroomBySlug,
  getCachedShowroomByPartnerId,
  getCachedShowroomListings,
  getCachedShowroomFacets,
  getCachedPublishedShowrooms as _getCachedPublishedShowrooms,
} from '@/lib/showroom-cache';

function attachPublicUrls(showroom: any) {
  const cacheBuster = new Date(showroom.updatedAt).getTime();
  const toCdn = (key: string | null | undefined) => getCdnPublicUrl(key, cacheBuster);
  const toCdnArray = (keys: string[] | null | undefined) =>
    (keys || []).map((key) => toCdn(key)).filter((key): key is string => Boolean(key));

  return {
    ...showroom,
    heroVideoThumbnail: toCdn(showroom.heroVideoThumbnail),
    heroImage: toCdn(showroom.heroImage),
    founderImage: toCdn(showroom.founderImage),
    showroomImages: toCdnArray(showroom.showroomImages),
    showroomExteriorImages: toCdnArray(showroom.showroomExteriorImages),
    clientLogos: toCdnArray(showroom.clientLogos),
    seoImage: toCdn(showroom.seoImage),
    heroVideoThumbnailUrl: toCdn(showroom.heroVideoThumbnail),
    heroImageUrl: toCdn(showroom.heroImage),
    founderImageUrl: toCdn(showroom.founderImage),
    showroomImagesUrls: toCdnArray(showroom.showroomImages),
    showroomExteriorImagesUrls: toCdnArray(showroom.showroomExteriorImages),
    clientLogosUrls: toCdnArray(showroom.clientLogos),
    seoImageUrl: toCdn(showroom.seoImage),
    partner: {
      ...showroom.partner,
      logo: toCdn(showroom.partner.logo),
      heroImage: toCdn(showroom.partner.heroImage),
      logoUrl: toCdn(showroom.partner.logo),
      heroImageUrl: toCdn(showroom.partner.heroImage),
    },
    teamMembers: (showroom.teamMembers || []).map((member: any) => ({
      ...member,
      image: toCdn(member.image),
      imageUrl: toCdn(member.image),
    })),
    achievements: (showroom.achievements || []).map((achievement: any) => ({
      ...achievement,
      image: toCdn(achievement.image),
      imageUrl: toCdn(achievement.image),
    })),
    featuredTestimonials: (showroom.featuredTestimonials || []).map((testimonial: any) => ({
      ...testimonial,
      customerImage: toCdn(testimonial.customerImage),
      customerImageUrl: toCdn(testimonial.customerImage),
    })),
    pressFeatures: (showroom.pressFeatures || []).map((feature: any) => ({
      ...feature,
      logo: toCdn(feature.logo),
      logoUrl: toCdn(feature.logo),
    })),
  };
}

export async function getCachedPublicShowroom(slug: string) {
  let showroom = await getCachedShowroomBySlug(slug);

  if (!showroom) {
    showroom = await getCachedShowroomByPartnerId(slug);
  }

  return showroom ? attachPublicUrls(showroom) : null;
}

export function incrementPublicShowroomViews(showroomId: string) {
  void incrementShowroomViews(showroomId).catch(() => {
    // Analytics are non-critical for page rendering.
  });
}

export async function getCachedPublicShowroomListings(
  partnerId: string,
  partnerName: string,
): Promise<SearchResponse | null> {
  const params = {
    partnerId,
    partnerName,
    limit: 24,
  };

  const [searchResult, facets] = await Promise.all([
    getCachedShowroomListings(params),
    getCachedShowroomFacets(params),
  ]);

  return {
    ...searchResult,
    facets,
  };
}

// Re-export for public API
export async function getCachedPublishedShowrooms(page: number, limit: number) {
  return _getCachedPublishedShowrooms(page, limit);
}
