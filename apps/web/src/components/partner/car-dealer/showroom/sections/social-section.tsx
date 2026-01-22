/**
 * Social & Press Section Component
 * Social media handles and press features
 */

'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import { cn } from '@/utils';
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
  updateShowroom: (data: Partial<PartnerShowroom>) => Promise<void>;
}

export function SocialSection({
  form,
  getEditableFieldProps,
  updateShowroom,
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
            placeholder="@yourbrand"
          />
          
          {/* Instagram Feed Toggle */}
          {form.instagramHandle && (
            <div className="py-3 border-b border-border/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground/70">Show Instagram Feed</p>
                  <p className="text-xs text-muted-foreground/50 mt-0.5">Display latest posts on showroom</p>
                </div>
                <button
                  onClick={() => updateShowroom({ instagramFeedEnabled: !form.instagramFeedEnabled })}
                  className={cn(
                    "relative w-11 h-6 rounded-full transition-colors",
                    form.instagramFeedEnabled ? 'bg-primary' : 'bg-muted'
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform",
                      form.instagramFeedEnabled && 'translate-x-5'
                    )}
                  />
                </button>
              </div>
            </div>
          )}
          
          <EditableField
            {...getEditableFieldProps('youtubeChannelUrl')}
            label="YouTube Channel"
            value={form.youtubeChannelUrl || null}
            placeholder="https://youtube.com/@channel"
            type="url"
          />
          <EditableField
            {...getEditableFieldProps('tiktokHandle')}
            label="TikTok"
            value={form.tiktokHandle || null}
            placeholder="@yourbrand"
          />
          <EditableField
            {...getEditableFieldProps('linkedinUrl')}
            label="LinkedIn"
            value={form.linkedinUrl || null}
            placeholder="https://linkedin.com/company/..."
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
