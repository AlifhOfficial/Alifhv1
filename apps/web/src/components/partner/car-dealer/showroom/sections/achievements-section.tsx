/**
 * Achievements Section Component
 * Key metrics and awards/certifications
 */

'use client';

import React from 'react';
import { Plus, Award } from 'lucide-react';
import { compressAndUploadShowroomImage } from '@/lib/storage';
import type { PartnerShowroom } from '@/hooks/partner/car-dealer/use-partner-showroom';
import type { ShowroomAchievement } from '@alifh/database';
import { EditableField, AchievementCard, ImageUpload, VideoEmbedPreview } from '../components';

interface AchievementsSectionProps {
  form: Partial<PartnerShowroom>;
  showroom: PartnerShowroom;
  partnerId: string;
  imageUploading: string | null;
  getEditableFieldProps: (field: keyof PartnerShowroom) => {
    isEditing: boolean;
    isUpdating: boolean;
    onStartEdit: () => void;
    onChange: (val: string | number | null) => void;
    onSave: () => void;
    onCancel: () => void;
  };
  uploadImage: (file: File, type: string, field: keyof PartnerShowroom) => Promise<void>;
  removeImage: (field: keyof PartnerShowroom) => Promise<void>;
  updateShowroom: (data: Partial<PartnerShowroom>) => Promise<void>;
  setImageUploading: React.Dispatch<React.SetStateAction<string | null>>;
  toast: (options: { title: string; variant?: 'default' | 'destructive' }) => void;
}

export function AchievementsSection({
  form,
  showroom,
  partnerId,
  imageUploading,
  getEditableFieldProps,
  uploadImage,
  removeImage,
  updateShowroom,
  setImageUploading,
  toast,
}: AchievementsSectionProps) {
  const addAchievement = async () => {
    const newAchievement: ShowroomAchievement = {
      id: crypto.randomUUID(),
      title: 'New Achievement',
      issuer: null,
      year: null,
      image: null,
      order: (form.achievements?.length || 0),
    };
    const updated = [...(form.achievements || []), newAchievement];
    await updateShowroom({ achievements: updated });
  };

  const updateAchievement = async (id: string, updates: Partial<ShowroomAchievement>) => {
    const updated = (form.achievements || []).map(a => a.id === id ? { ...a, ...updates } : a);
    await updateShowroom({ achievements: updated });
  };

  const removeAchievement = async (id: string) => {
    const updated = (form.achievements || []).filter(a => a.id !== id);
    await updateShowroom({ achievements: updated });
  };

  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">Section Media</h3>
        <div className="rounded-xl border border-border/40 bg-sidebar p-5 space-y-4">
          <ImageUpload
            value={form.achievementsSectionImage || null}
            displayUrl={showroom.achievementsSectionImageUrl}
            onUpload={(file) => uploadImage(file, 'achievements-section-image', 'achievementsSectionImage')}
            onRemove={() => removeImage('achievementsSectionImage')}
            aspectRatio="aspect-[16/9]"
            label="Achievements section image"
            isUploading={imageUploading === 'achievementsSectionImage'}
          />
          <EditableField
            {...getEditableFieldProps('achievementsSectionVideoUrl')}
            label="YouTube / Vimeo URL"
            value={form.achievementsSectionVideoUrl || null}
            placeholder="https://youtube.com/... or https://vimeo.com/..."
            type="url"
          />
          {form.achievementsSectionVideoUrl && (
            <VideoEmbedPreview url={form.achievementsSectionVideoUrl} aspectRatio="aspect-video" />
          )}
        </div>
      </section>

      {/* Key Metrics */}
      <section>
        <h3 className="text-subhead font-bold tracking-tight text-foreground mb-3">Key Metrics</h3>
        <div className="rounded-xl border border-border/40 bg-sidebar p-5">
          <EditableField
            {...getEditableFieldProps('totalCarsSold')}
            label="Total Cars Sold"
            value={form.totalCarsSold || null}
            placeholder="5000"
            type="number"
          />
          <EditableField
            {...getEditableFieldProps('yearsInBusiness')}
            label="Years in Business"
            value={form.yearsInBusiness || null}
            placeholder="15"
            type="number"
          />
        </div>
      </section>

      {/* Awards & Certifications */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-subhead font-bold tracking-tight text-foreground">Awards & Certifications</h3>
          <button
            onClick={addAchievement}
            className="inline-flex items-center gap-1.5 text-caption1 text-blue-500 hover:text-blue-600 font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
        <div className="space-y-3">
          {(form.achievements || []).map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              onUpdate={(updates) => updateAchievement(achievement.id, updates)}
              onRemove={() => removeAchievement(achievement.id)}
              onImageUpload={async (file) => {
                if (file.size > 15 * 1024 * 1024) {
                  toast({ title: 'Image too large. Max 15MB', variant: 'destructive' });
                  return;
                }
                setImageUploading(`achievement-${achievement.id}`);
                try {
                  const result = await compressAndUploadShowroomImage(file, partnerId, 'achievement-image');
                  await updateAchievement(achievement.id, { image: result.key });
                } catch {
                  toast({ title: 'Upload failed', variant: 'destructive' });
                } finally {
                  setImageUploading(null);
                }
              }}
              isUploading={imageUploading === `achievement-${achievement.id}`}
            />
          ))}
          {(form.achievements?.length || 0) === 0 && (
            <div className="rounded-xl border border-dashed border-border/40 p-8 text-center">
              <Award className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-subhead text-muted-foreground">No achievements yet</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

