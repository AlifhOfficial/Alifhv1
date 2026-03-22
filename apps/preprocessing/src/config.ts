/**
 * Environment configuration for the preprocessing service.
 * All values come from Fly secrets / .env.local for local dev.
 */

function require(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required env var: ${name}`);
  return val;
}

export const PORT = parseInt(process.env.PREPROCESSING_PORT ?? '3002');

// Shared secret — must match PREPROCESSING_SECRET in Vercel env
export const SECRET = require('PREPROCESSING_SECRET');

// Cloudflare R2 credentials
export const R2_ACCESS_KEY_ID = require('R2_ACCESS_KEY_ID');
export const R2_SECRET_ACCESS_KEY = require('R2_SECRET_ACCESS_KEY');
export const R2_BUCKET_NAME = require('R2_BUCKET_NAME');
export const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID ?? '';
export const R2_ENDPOINT =
  process.env.R2_ENDPOINT ??
  `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

// CDN base URL — e.g. https://cdn.revvup.ae
export const CDN_URL = require('CDN_URL').replace(/\/$/, '');

// Max raw input size per file: 20MB
export const MAX_FILE_BYTES = 20 * 1024 * 1024;

// Max files per request
export const MAX_FILES = 20;
