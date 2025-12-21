/**
 * Tags Section Component
 * Optimized with better UX and cleaner state management
 */

"use client";

import { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface TagsSectionProps {
  tags: string[];
  availableTags: string[];
  isEditing: boolean;
  onTagsChange: (tags: string[]) => void;
}

export function TagsSection({
  tags,
  availableTags,
  isEditing,
  onTagsChange,
}: TagsSectionProps) {
  const [customTag, setCustomTag] = useState('');

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      onTagsChange(tags.filter(t => t !== tag));
    } else {
      onTagsChange([...tags, tag]);
    }
  };

  const addCustomTag = () => {
    const trimmed = customTag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onTagsChange([...tags, trimmed]);
      setCustomTag('');
    }
  };

  const removeTag = (tag: string) => {
    onTagsChange(tags.filter(t => t !== tag));
  };

  if (!isEditing) {
    return (
      <div className="flex flex-wrap gap-2">
        {tags.length > 0 ? (
          tags.map((tag) => (
            <div
              key={tag}
              className="px-3 py-1.5 bg-muted/50 text-muted-foreground text-xs font-medium rounded-lg"
            >
              {tag}
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No tags added</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Available Tags */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          Quick Select
        </label>
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                tags.includes(tag)
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Tag Input */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          Add Custom Tag
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustomTag();
              }
            }}
            placeholder="Type and press Enter..."
            className="flex-1 h-10 px-3 bg-background border border-border/40 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
          />
          <button
            onClick={addCustomTag}
            disabled={!customTag.trim()}
            className="h-10 w-10 flex items-center justify-center bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Selected Tags */}
      {tags.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Selected Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <div
                key={tag}
                className="px-3 py-1.5 bg-primary/10 text-foreground text-xs font-medium rounded-lg flex items-center gap-2 group"
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={`Remove ${tag}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
