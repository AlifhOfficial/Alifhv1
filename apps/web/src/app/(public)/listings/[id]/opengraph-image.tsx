import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { getListingDetailed } from '@alifh/database';
import { getCdnPublicUrl } from '@/utils/storage';

export const runtime = 'nodejs';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

interface Props {
  params: Promise<{ id: string }>;
}

async function loadGeomFont() {
  const fontPath = path.join(process.cwd(), 'public', 'assets', 'fonts', 'Geom-Black.ttf');
  return readFile(fontPath);
}

function formatPrice(value: number, currency?: string | null) {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: currency || 'AED',
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function ListingOpenGraphImage({ params }: Props) {
  const { id } = await params;
  const geomBlack = await loadGeomFont();
  const listing = await getListingDetailed(id);

  if (!listing || listing.moderationStatus !== 'approved' || listing.lifecycleStatus !== 'active') {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '72px 78px',
            background: '#000000',
            color: '#FAFAFA',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', fontSize: 24, letterSpacing: 2, textTransform: 'uppercase', color: '#6B7280' }}>
              UAE Car Marketplace
            </div>
            <div style={{ display: 'flex', fontFamily: 'Geom', fontSize: 128, lineHeight: 0.95, letterSpacing: -6 }}>
              Revvup
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 760 }}>
            <div style={{ display: 'flex', fontSize: 58, lineHeight: 1.02, fontWeight: 700, letterSpacing: -2 }}>
              Buy and sell cars. Free. Forever.
            </div>
            <div style={{ display: 'flex', fontSize: 28, color: '#A1A1AA' }}>
              UAE&apos;s car marketplace for buyers and dealers.
            </div>
          </div>
        </div>
      ),
      {
        ...size,
        fonts: [
          {
            name: 'Geom',
            data: geomBlack,
            style: 'normal',
            weight: 900,
          },
        ],
      }
    );
  }

  const carTitle = `${listing.year} ${listing.make} ${listing.model}${listing.trim ? ` ${listing.trim}` : ''}`;
  const price = formatPrice(listing.price, listing.currency);
  const locationLabel = listing.emirate ? listing.emirate.replace(/_/g, ' ') : 'UAE';
  const detailBits = [
    listing.mileage ? `${listing.mileage.toLocaleString()} km` : null,
    listing.specs ? `${listing.specs} Specs` : null,
    locationLabel,
  ].filter(Boolean);
  const listingImage = getCdnPublicUrl(listing.thumbnail || listing.images?.[0]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#000000',
          color: '#FAFAFA',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {listingImage ? (
          <img
            src={listingImage}
            alt={carTitle}
            width={1200}
            height={630}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : null}

        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            background: 'linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.82) 42%, rgba(0,0,0,0.48) 100%)',
          }}
        />

        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '64px 72px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 760 }}>
            <div style={{ display: 'flex', fontFamily: 'Geom', fontSize: 86, lineHeight: 0.96, letterSpacing: -4 }}>
              Revvup
            </div>
            <div style={{ display: 'flex', fontSize: 24, letterSpacing: 1.5, textTransform: 'uppercase', color: '#60A5FA' }}>
              More than a marketplace.
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 760 }}>
            <div style={{ display: 'flex', fontSize: 64, lineHeight: 0.98, fontWeight: 700, letterSpacing: -2.5 }}>
              {carTitle}
            </div>
            <div style={{ display: 'flex', fontSize: 42, fontWeight: 700, color: '#FAFAFA' }}>
              {price}
            </div>
            {detailBits.length > 0 ? (
              <div style={{ display: 'flex', fontSize: 28, color: '#D4D4D8' }}>
                {detailBits.join(' • ')}
              </div>
            ) : null}
            <div style={{ display: 'flex', fontSize: 26, color: '#A1A1AA' }}>
              Buy and sell cars on Revvup. Free. Forever.
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Geom',
          data: geomBlack,
          style: 'normal',
          weight: 900,
        },
      ],
    }
  );
}
