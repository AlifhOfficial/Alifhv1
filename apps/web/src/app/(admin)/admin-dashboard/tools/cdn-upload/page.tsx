/**
 * R2 Static Asset Uploader
 * Drag-drop interface for uploading images/videos to CDN
 */

import { Metadata } from 'next';
import { R2UploaderClient } from './uploader-client';
import { REVVUP_META_DESCRIPTION } from '@/lib/brand-messaging';

export const metadata: Metadata = {
  title: 'CDN Asset Uploader | Admin Tools',
  description: REVVUP_META_DESCRIPTION,
};

export default function R2UploaderPage() {
  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-title2 font-bold mb-2">CDN Asset Uploader</h1>
        <p className="text-muted-foreground">
          Drag and drop images or videos to upload to the CDN. Files are cached globally.
        </p>
      </div>
      <R2UploaderClient />
    </div>
  );
}
