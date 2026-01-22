/**
 * Testimonials Section Component
 * Customer testimonials management
 */

'use client';

import React from 'react';
import { Plus, MessageSquareQuote } from 'lucide-react';
import type { PartnerShowroom } from '@/hooks/partner/car-dealer/use-partner-showroom';
import type { ShowroomTestimonial } from '@alifh/database';
import { EditableField, TestimonialCard } from '../components';

interface TestimonialsSectionProps {
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

export function TestimonialsSection({
  form,
  getEditableFieldProps,
  updateShowroom,
}: TestimonialsSectionProps) {
  // Testimonial helpers
  const addTestimonial = async () => {
    const newTestimonial: ShowroomTestimonial = {
      id: crypto.randomUUID(),
      customerName: 'Customer Name',
      customerTitle: null,
      customerImage: null,
      content: 'Their testimonial...',
      rating: 5,
      vehiclePurchased: null,
      videoUrl: null,
      order: (form.featuredTestimonials?.length || 0),
    };
    const updated = [...(form.featuredTestimonials || []), newTestimonial];
    await updateShowroom({ featuredTestimonials: updated });
  };

  const updateTestimonial = async (id: string, updates: Partial<ShowroomTestimonial>) => {
    const updated = (form.featuredTestimonials || []).map(t => t.id === id ? { ...t, ...updates } : t);
    await updateShowroom({ featuredTestimonials: updated });
  };

  const removeTestimonial = async (id: string) => {
    const updated = (form.featuredTestimonials || []).filter(t => t.id !== id);
    await updateShowroom({ featuredTestimonials: updated });
  };

  return (
    <div className="space-y-6">
      {/* Featured Testimonials */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-bold tracking-tight text-foreground">Featured Testimonials</h3>
          <button
            onClick={addTestimonial}
            disabled={(form.featuredTestimonials?.length || 0) >= 5}
            className="inline-flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-600 font-semibold disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
        <div className="space-y-3">
          {(form.featuredTestimonials || []).map((testimonial) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              onUpdate={(updates) => updateTestimonial(testimonial.id, updates)}
              onRemove={() => removeTestimonial(testimonial.id)}
            />
          ))}
          {(form.featuredTestimonials?.length || 0) === 0 && (
            <div className="rounded-xl border border-dashed border-border/40 p-8 text-center">
              <MessageSquareQuote className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No testimonials yet</p>
            </div>
          )}
        </div>
      </section>

      {/* Section Title */}
      <section>
        <h3 className="text-[15px] font-bold tracking-tight text-foreground mb-3">Display</h3>
        <div className="rounded-xl border border-border/40 bg-sidebar p-5">
          <EditableField
            {...getEditableFieldProps('testimonialsSectionTitle')}
            label="Section Heading"
            value={form.testimonialsSectionTitle || 'What Our Clients Say'}
            placeholder="What Our Clients Say"
          />
        </div>
      </section>
    </div>
  );
}
