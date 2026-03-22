import { unstable_cache } from 'next/cache';
import {
  getPublishedShowroomByPartnerId,
  getPublishedShowroomBySlug,
  incrementShowroomViews,
  searchListings,
  type SearchResponse,
} from '@alifh/database';
import { getCachedSearchFacets } from '@/lib/search-cache';
import { getCdnPublicUrl } from '@/utils';

const SHOWROOM_CACHE_TTL = 600;
const SHOWROOM_LISTINGS_CACHE_TTL = 300;

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
  const cachedFn = unstable_cache(
    async () => {
      let showroom = await getPublishedShowroomBySlug(slug);

      if (!showroom) {
        showroom = await getPublishedShowroomByPartnerId(slug);
      }

      return showroom ? attachPublicUrls(showroom) : null;
    },
    ['public-showroom', slug],
    {
      revalidate: SHOWROOM_CACHE_TTL,
    },
  );

  return cachedFn();
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
  const cacheKey = partnerId || partnerName;

  const cachedFn = unstable_cache(
    async () => {
      const params = {
        partnerId,
        partnerName,
        limit: 24,
      };

      const [searchResult, facets] = await Promise.all([
        searchListings(params, { fast: true }),
        getCachedSearchFacets(params),
      ]);

      return {
        ...searchResult,
        facets,
      };
    },
    ['public-showroom-listings', cacheKey],
    {
      revalidate: SHOWROOM_LISTINGS_CACHE_TTL,
    },
  );

  return cachedFn();
}
