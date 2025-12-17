/**
 * Section Wrapper Component
 * Reusable wrapper for profile sections with edit functionality
 */

import { Edit3 } from 'lucide-react';
import { type ReactNode } from 'react';

interface SectionWrapperProps {
  title: string;
  description: string;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  children: ReactNode;
  showEdit?: boolean;
}

export function SectionWrapper({
  title,
  description,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  isSaving,
  children,
  showEdit = true,
}: SectionWrapperProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        {showEdit && !isEditing && (
          <button
            onClick={onEdit}
            className="h-8 px-3 text-xs font-medium text-foreground border border-border rounded-lg hover:bg-muted/50 flex items-center gap-2"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </button>
        )}
      </div>
      <div className="space-y-6">{children}</div>
      {isEditing && (
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="h-8 px-3 text-xs font-medium border border-border rounded-lg hover:bg-muted/50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="h-8 px-3 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      )}
    </div>
  );
}
