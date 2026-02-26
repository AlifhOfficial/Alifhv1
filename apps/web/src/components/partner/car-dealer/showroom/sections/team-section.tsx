/**
 * Team Section Component
 * Team members management
 */

'use client';

import React from 'react';
import { Plus, Users } from 'lucide-react';
import { compressAndUploadShowroomImage } from '@/lib/storage';
import type { PartnerShowroom } from '@/hooks/partner/car-dealer/use-partner-showroom';
import type { ShowroomTeamMember } from '@alifh/database';
import { EditableField, TeamMemberCard } from '../components';

interface TeamSectionProps {
  form: Partial<PartnerShowroom>;
  imageUploading: string | null;
  partnerId: string;
  getEditableFieldProps: (field: keyof PartnerShowroom) => {
    isEditing: boolean;
    isUpdating: boolean;
    onStartEdit: () => void;
    onChange: (val: string | number | null) => void;
    onSave: () => void;
    onCancel: () => void;
  };
  updateShowroom: (data: Partial<PartnerShowroom>) => Promise<void>;
  setImageUploading: React.Dispatch<React.SetStateAction<string | null>>;
  toast: (options: { title: string; variant?: 'default' | 'destructive' }) => void;
}

export function TeamSection({
  form,
  imageUploading,
  partnerId,
  getEditableFieldProps,
  updateShowroom,
  setImageUploading,
  toast,
}: TeamSectionProps) {
  // Team member helpers
  const addTeamMember = async () => {
    const newMember: ShowroomTeamMember = {
      id: crypto.randomUUID(),
      name: 'New Team Member',
      role: 'Position',
      image: null,
      bio: null,
      whatsapp: null,
      order: (form.teamMembers?.length || 0),
    };
    const updated = [...(form.teamMembers || []), newMember];
    await updateShowroom({ teamMembers: updated });
  };

  const updateTeamMember = async (id: string, updates: Partial<ShowroomTeamMember>) => {
    const updated = (form.teamMembers || []).map(m => m.id === id ? { ...m, ...updates } : m);
    await updateShowroom({ teamMembers: updated });
  };

  const removeTeamMember = async (id: string) => {
    const updated = (form.teamMembers || []).filter(m => m.id !== id);
    await updateShowroom({ teamMembers: updated });
  };

  return (
    <div className="space-y-6">
      {/* Team Members */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-bold tracking-tight text-foreground">Team Members</h3>
          <button
            onClick={addTeamMember}
            disabled={(form.teamMembers?.length || 0) >= 6}
            className="inline-flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-600 font-semibold disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            Add member
          </button>
        </div>
        <div className="space-y-3">
          {(form.teamMembers || []).map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              onUpdate={(updates) => updateTeamMember(member.id, updates)}
              onRemove={() => removeTeamMember(member.id)}
              onImageUpload={async (file) => {
                // Check file size (15MB max)
                if (file.size > 15 * 1024 * 1024) {
                  toast({ title: 'Image too large. Max 15MB', variant: 'destructive' });
                  return;
                }
                
                setImageUploading(`team-${member.id}`);
                try {
                  const result = await compressAndUploadShowroomImage(file, partnerId, 'team-member');
                  await updateTeamMember(member.id, { image: result.key });
                } catch {
                  toast({ title: 'Upload failed', variant: 'destructive' });
                } finally {
                  setImageUploading(null);
                }
              }}
              isUploading={imageUploading === `team-${member.id}`}
            />
          ))}
          {(form.teamMembers?.length || 0) === 0 && (
            <div className="rounded-xl border border-dashed border-border/40 p-8 text-center">
              <Users className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No team members yet</p>
              <button
                onClick={addTeamMember}
                className="text-xs text-blue-500 hover:text-blue-600 font-semibold mt-2"
              >
                Add your first team member
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Section Title */}
      <section>
        <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">Display</h3>
        <div className="rounded-xl border border-border/40 bg-sidebar p-5">
          <EditableField
            {...getEditableFieldProps('teamSectionTitle')}
            label="Section Heading"
            value={form.teamSectionTitle || 'Meet the Team'}
            placeholder="Meet the Team"
          />
        </div>
      </section>
    </div>
  );
}
