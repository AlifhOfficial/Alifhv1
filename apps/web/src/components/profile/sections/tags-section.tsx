/**
 * Tags Section Component
 */

'use client';

import { useToast } from '@/hooks/use-toast';

interface TagsSectionProps {
  selectedTags: string[];
  availableTags: string[];
  isEditing: boolean;
  onTagToggle: (tag: string) => void;
}

export function TagsSection({ selectedTags, availableTags, isEditing, onTagToggle }: TagsSectionProps) {
  const { toast } = useToast();

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagToggle(tag);
    } else if (selectedTags.length < 3) {
      onTagToggle(tag);
    } else {
      toast({
        title: 'Maximum tags reached',
        description: 'You can only select up to 3 tags',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-muted-foreground">
          Profile Tags {isEditing && <span className="text-muted-foreground/60">(Select up to 3)</span>}
        </label>
        <p className="text-xs text-muted-foreground mt-1">
          Choose tags that describe you
        </p>
      </div>
      
      {isEditing ? (
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagClick(tag)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedTags.includes(tag)
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {selectedTags.length > 0 ? (
            selectedTags.map((tag) => (
              <div key={tag} className="px-3 py-1.5 bg-muted text-muted-foreground text-xs font-medium">
                {tag}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground italic">No tags selected</p>
          )}
        </div>
      )}
    </div>
  );
}
