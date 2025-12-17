/**
 * Bio Section Component
 */

'use client';

interface BioSectionProps {
  bio: string;
  isEditing: boolean;
  onBioChange: (value: string) => void;
}

export function BioSection({ bio, isEditing, onBioChange }: BioSectionProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs text-muted-foreground">
        Bio
      </label>
      {isEditing ? (
        <textarea
          value={bio}
          onChange={(e) => onBioChange(e.target.value)}
          placeholder="Tell others about yourself"
          rows={3}
          className="w-full px-3 py-2 bg-background border border-border/40 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors resize-none"
        />
      ) : (
        <p className="px-3 py-2 text-sm text-foreground leading-relaxed">
          {bio || '—'}
        </p>
      )}
    </div>
  );
}
