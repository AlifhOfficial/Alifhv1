/**
 * Sharp image processor.
 *
 * Listing images:  thumb (480px) + full (1200px) WebP in parallel.
 * All other types: single WebP output with per-type settings.
 *
 * WebP: fast encode, great browser support, good compression.
 *
 * Settings:
 *   Listing thumb: 480px  / q72
 *   Listing full:  1200px / q78
 *   Avatar/Logo:   200px  / q72
 *   Partner hero:  1600px / q75
 *   Showroom:      various / q75-82
 */

import sharp from 'sharp';

const LIMIT_PIXELS = 40_000_000; // 40MP hard cap

interface SharpOpts {
  maxWidth: number;
  maxHeight: number;
  fit: 'inside' | 'cover';
  quality: number;
  sharpenSigma: number;
  saturationBoost: number;
}

const THUMB: SharpOpts = {
  maxWidth: 480, maxHeight: 480, fit: 'inside',
  quality: 72, sharpenSigma: 0.8, saturationBoost: 1.03,
};

const FULL: SharpOpts = {
  maxWidth: 1200, maxHeight: 1200, fit: 'inside',
  quality: 78, sharpenSigma: 0.6, saturationBoost: 1.02,
};

// Per-type settings for single-output uploads
const SINGLE_SETTINGS: Record<string, SharpOpts> = {
  avatar:                              { maxWidth: 200,  maxHeight: 200,  fit: 'cover',  quality: 70, sharpenSigma: 0.6, saturationBoost: 1.03 },
  'partner:logo':                      { maxWidth: 200,  maxHeight: 200,  fit: 'inside', quality: 70, sharpenSigma: 0.6, saturationBoost: 1.00 },
  'partner:hero':                      { maxWidth: 1600, maxHeight: 500,  fit: 'cover',  quality: 70, sharpenSigma: 0.4, saturationBoost: 1.01 },
  'showroom:hero-image':               { maxWidth: 1440, maxHeight: 810,  fit: 'cover',  quality: 70, sharpenSigma: 0.4, saturationBoost: 1.02 },
  'showroom:brand-story-image':        { maxWidth: 1200, maxHeight: 675,  fit: 'cover',  quality: 68, sharpenSigma: 0.4, saturationBoost: 1.02 },
  'showroom:founder-image':            { maxWidth: 640,  maxHeight: 800,  fit: 'inside', quality: 70, sharpenSigma: 0.5, saturationBoost: 1.02 },
  'showroom:gallery':                  { maxWidth: 1200, maxHeight: 900,  fit: 'inside', quality: 68, sharpenSigma: 0.4, saturationBoost: 1.02 },
  'showroom:gallery-section-image':    { maxWidth: 1200, maxHeight: 675,  fit: 'cover',  quality: 68, sharpenSigma: 0.4, saturationBoost: 1.02 },
  'showroom:team-member':              { maxWidth: 480,  maxHeight: 480,  fit: 'cover',  quality: 70, sharpenSigma: 0.6, saturationBoost: 1.03 },
  'showroom:team-section-image':       { maxWidth: 1200, maxHeight: 675,  fit: 'cover',  quality: 68, sharpenSigma: 0.4, saturationBoost: 1.02 },
  'showroom:achievement-image':        { maxWidth: 320,  maxHeight: 320,  fit: 'inside', quality: 70, sharpenSigma: 0.5, saturationBoost: 1.02 },
  'showroom:achievements-section-image': { maxWidth: 1200, maxHeight: 675, fit: 'cover', quality: 68, sharpenSigma: 0.4, saturationBoost: 1.02 },
  'showroom:testimonial-image':        { maxWidth: 160,  maxHeight: 160,  fit: 'cover',  quality: 70, sharpenSigma: 0.6, saturationBoost: 1.03 },
  'showroom:testimonials-section-image': { maxWidth: 1200, maxHeight: 675, fit: 'cover', quality: 68, sharpenSigma: 0.4, saturationBoost: 1.02 },
  'showroom:service-image':            { maxWidth: 640,  maxHeight: 480,  fit: 'cover',  quality: 68, sharpenSigma: 0.5, saturationBoost: 1.02 },
  'showroom:services-section-image':   { maxWidth: 1200, maxHeight: 675,  fit: 'cover',  quality: 68, sharpenSigma: 0.4, saturationBoost: 1.02 },
  'showroom:seo-image':                { maxWidth: 1200, maxHeight: 630,  fit: 'cover',  quality: 70, sharpenSigma: 0.4, saturationBoost: 1.00 },
};

function build(input: Buffer, opts: SharpOpts) {
  return sharp(input, {
    failOnError: false,
    sequentialRead: true,
    limitInputPixels: LIMIT_PIXELS,
  })
    .rotate()
    .resize(opts.maxWidth, opts.maxHeight, {
      fit: opts.fit,
      withoutEnlargement: true,
      fastShrinkOnLoad: true,
      kernel: 'lanczos3',
    })
    .sharpen({ sigma: opts.sharpenSigma, m1: 0, m2: 3, x1: 2, y2: 10, y3: 5 })
    .modulate({ saturation: opts.saturationBoost })
    .webp({ quality: opts.quality, effort: 4 });
}

export interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  size: number;
}

export interface ProcessedPair {
  thumb: ProcessedImage;
  full: ProcessedImage;
}

/** Listing: thumb + full in parallel */
export async function processListingImage(input: Buffer): Promise<ProcessedPair> {
  const [thumbResult, fullResult] = await Promise.all([
    build(input, THUMB).toBuffer({ resolveWithObject: true }),
    build(input, FULL).toBuffer({ resolveWithObject: true }),
  ]);

  return {
    thumb: { buffer: thumbResult.data, width: thumbResult.info.width, height: thumbResult.info.height, size: thumbResult.info.size },
    full:  { buffer: fullResult.data,  width: fullResult.info.width,  height: fullResult.info.height,  size: fullResult.info.size  },
  };
}

/**
 * Single-output for avatar, partner, showroom images.
 * @param settingsKey e.g. 'avatar', 'partner:logo', 'showroom:hero-image'
 */
export async function processSingleImage(input: Buffer, settingsKey: string): Promise<ProcessedImage> {
  const opts = SINGLE_SETTINGS[settingsKey];
  if (!opts) throw new Error(`Unknown settings key: ${settingsKey}`);

  const { data, info } = await build(input, opts).toBuffer({ resolveWithObject: true });
  return { buffer: data, width: info.width, height: info.height, size: info.size };
}
