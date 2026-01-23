/**
 * Contact Form Component
 * 
 * Clean, minimal design following Alifh design system
 * Tap-to-interact pattern, subtle backgrounds
 */

'use client';

import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

// ============================================================================
// Types
// ============================================================================

type CommunicationType = 'inquiry' | 'support' | 'partnership' | 'feedback' | 'report' | 'other';

interface ContactFormProps {
  /** Default type for the form */
  defaultType?: CommunicationType;
  /** Callback after successful submission */
  onSuccess?: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const COMMUNICATION_TYPES: { value: CommunicationType; label: string }[] = [
  { value: 'inquiry', label: 'Inquiry' },
  { value: 'support', label: 'Support' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'report', label: 'Report' },
  { value: 'other', label: 'Other' },
];

// ============================================================================
// Main Component
// ============================================================================

export function ContactForm({
  defaultType = 'inquiry',
  onSuccess,
}: ContactFormProps) {
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<CommunicationType>(defaultType);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setSubject('');
    setMessage('');
    setType(defaultType);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!name.trim() || name.trim().length < 2) {
      toast({ title: 'Please enter your name', variant: 'destructive' });
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast({ title: 'Please enter a valid email', variant: 'destructive' });
      return;
    }

    if (!subject.trim() || subject.trim().length < 3) {
      toast({ title: 'Please enter a subject', variant: 'destructive' });
      return;
    }

    if (!message.trim() || message.trim().length < 10) {
      toast({ title: 'Please enter your message', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          subject: subject.trim(),
          message: message.trim(),
          type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send');
      }

      setIsSubmitted(true);
      resetForm();
      onSuccess?.();
      toast({ title: 'Message sent!' });

      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (isSubmitted) {
    return (
      <div className="rounded-xl border border-border/40 bg-sidebar p-8">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground tracking-tight">Message Sent</p>
            <p className="text-sm text-muted-foreground mt-1">
              We'll get back to you soon
            </p>
          </div>
          <button
            onClick={() => setIsSubmitted(false)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Send another →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Type Selector */}
      <section>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Topic</p>
        <div className="rounded-xl border border-border/40 bg-sidebar p-4">
          <div className="flex flex-wrap gap-2">
            {COMMUNICATION_TYPES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setType(value)}
                className={cn(
                  "px-3.5 py-2 rounded-lg text-sm font-medium transition-all",
                  type === value
                    ? "bg-muted/50 text-foreground"
                    : "text-muted-foreground/70 hover:bg-muted/30 hover:text-foreground"
                )}
              >
                {label}
                {type === value && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 inline ml-1.5" />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Form Fields */}
      <section>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Details</p>
        
        <form onSubmit={handleSubmit}>
          <div className="rounded-xl border border-border/40 bg-sidebar">
            {/* Name */}
            <div className="py-3 px-5 border-b border-border/20">
              <p className="text-sm font-medium text-muted-foreground mb-1.5">Name</p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                maxLength={100}
                className="w-full h-10 bg-muted/20 rounded-lg px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                required
              />
            </div>

            {/* Email */}
            <div className="py-3 px-5 border-b border-border/20">
              <p className="text-sm font-medium text-muted-foreground mb-1.5">Email</p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-10 bg-muted/20 rounded-lg px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                required
              />
            </div>

            {/* Phone (Optional) */}
            <div className="py-3 px-5 border-b border-border/20">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <span className="text-xs text-muted-foreground/70">Optional</span>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+971 50 123 4567"
                className="w-full h-10 bg-muted/20 rounded-lg px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground/50"
              />
            </div>

            {/* Subject */}
            <div className="py-3 px-5 border-b border-border/20">
              <p className="text-sm font-medium text-muted-foreground mb-1.5">Subject</p>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="What's this about?"
                maxLength={150}
                className="w-full h-10 bg-muted/20 rounded-lg px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                required
              />
            </div>

            {/* Message */}
            <div className="py-3 px-5">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-sm font-medium text-muted-foreground">Message</p>
                <span className="text-xs text-muted-foreground/70 tabular-nums">{message.length}/5000</span>
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us more..."
                rows={5}
                maxLength={5000}
                className="w-full bg-muted/20 rounded-lg px-3 py-2.5 text-sm font-medium resize-none focus:outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "w-full mt-4 h-12 rounded-xl text-sm font-medium transition-all",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90 active:scale-[0.99]",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            ) : (
              'Send Message'
            )}
          </button>
        </form>
      </section>
    </div>
  );
}
