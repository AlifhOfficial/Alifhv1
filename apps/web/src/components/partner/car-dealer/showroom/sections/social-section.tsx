/**
 * Social & Press Section Component
 * Social media handles and press features
 */

'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import type { PartnerShowroom } from '@/hooks/partner/car-dealer/use-partner-showroom';
import { EditableField } from '../components';

interface SocialSectionProps {
  form: Partial<PartnerShowroom>;
  getEditableFieldProps: (field: keyof PartnerShowroom) => {
    isEditing: boolean;
    isUpdating: boolean;
    onStartEdit: () => void;
    onChange: (val: string | number | null) => void;
    onSave: () => void;
    onCancel: () => void;
  };
}

export function SocialSection({
  form,
  getEditableFieldProps,
}: SocialSectionProps) {
  return (
    <div className="space-y-6">
      {/* Social Media */}
      <section>
        <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">Social Media</h3>
        <div className="rounded-xl border border-border/40 bg-sidebar p-5">
          <EditableField
            {...getEditableFieldProps('instagramHandle')}
            label="Instagram"
            value={form.instagramHandle || null}
            placeholder="https://instagram.com/yourbrand"
            type="url"
          />
          <EditableField
            {...getEditableFieldProps('youtubeChannelUrl')}
            label="YouTube"
            value={form.youtubeChannelUrl || null}
            placeholder="https://youtube.com/@channel"
            type="url"
          />
          <EditableField
            {...getEditableFieldProps('tiktokHandle')}
            label="TikTok"
            value={form.tiktokHandle || null}
            placeholder="https://tiktok.com/@yourbrand"
            type="url"
          />
          <EditableField
            {...getEditableFieldProps('linkedinUrl')}
            label="LinkedIn"
            value={form.linkedinUrl || null}
            placeholder="https://linkedin.com/company/yourbrand"
            type="url"
          />
        </div>
      </section>

      {/* Press Features */}
      <section>
        <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">Press Features</h3>
        <p className="text-xs text-muted-foreground mb-3">Add media mentions and press coverage</p>
        <div className="rounded-xl border border-dashed border-border/40 p-8 text-center">
          <Globe className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Press feature editor coming soon</p>
        </div>
      </section>
    </div>
  );
}
