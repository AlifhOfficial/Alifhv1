import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';
export const alt = 'Revvup UAE car marketplace — buy and sell cars free';

async function loadGeomFont() {
  const fontPath = path.join(process.cwd(), 'public', 'assets', 'fonts', 'Geom-Black.ttf');
  return readFile(fontPath);
}

export default async function TwitterImage() {
  const geomBlack = await loadGeomFont();

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
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          <div
            style={{
              fontSize: 24,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: '#6B7280',
            }}
          >
            UAE Car Marketplace
          </div>
          <div
            style={{
              fontFamily: 'Geom',
              fontSize: 128,
              lineHeight: 0.95,
              letterSpacing: -6,
            }}
          >
            Revvup
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: 32,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              maxWidth: 720,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                fontSize: 56,
                lineHeight: 1.02,
                fontWeight: 700,
                letterSpacing: -2,
              }}
            >
              <div style={{ display: 'flex' }}>Buy and sell cars.</div>
              <div style={{ display: 'flex' }}>Free. Forever.</div>
            </div>
            <div
              style={{
                fontSize: 28,
                color: '#A1A1AA',
              }}
            >
              More than a marketplace. Join the Revolution.
            </div>
          </div>

          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 9999,
              border: '1px solid rgba(255,255,255,0.14)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FAFAFA',
              fontFamily: 'Geom',
              fontSize: 78,
              letterSpacing: -4,
            }}
          >
            R
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
