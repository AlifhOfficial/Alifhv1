/**
 * Partner Profile Preview Button
 * Triggers the partner profile preview modal
 */

'use client';

import { useState } from 'react';
import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PartnerProfilePreviewModal } from './partner-profile-preview-modal';

interface PartnerProfilePreviewButtonProps {
  partnerId: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export function PartnerProfilePreviewButton({
  partnerId,
  variant = 'outline',
  size = 'md',
  className,
  children,
}: PartnerProfilePreviewButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-9 px-4 text-sm',
    lg: 'h-10 px-5 text-sm',
  };

  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:opacity-90',
    outline: 'border border-border hover:bg-muted/50',
    ghost: 'hover:bg-muted/50',
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsModalOpen(true);
        }}
        type="button"
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        title="Preview Profile"
      >
        <Eye className="h-4 w-4" />
        {children || 'Preview'}
      </button>

      <PartnerProfilePreviewModal
        partnerId={partnerId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
