"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/providers/auth-provider";
import { MessageSquare, CheckCircle2, Clock, Archive, Send } from "lucide-react";
import Link from "next/link";
import { cn } from "@/utils";

type Feedback = {
  id: string;
  title: string;
  content: string;
  status: "new" | "reviewed" | "archived";
  isRead: boolean;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
};

// Default message when team hasn't responded yet
const DEFAULT_RESPONSE = "We have received your feedback and taken note. Thank you for writing to us.";

export default function FeedbackPage() {
  const { session: user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchFeedback = async () => {
    if (!user) return;
    
    try {
      const response = await fetch("/api/feedback");
      if (response.ok) {
        const data = await response.json();
        setFeedbackList(data.feedback || []);
      }
    } catch (error) {
      console.error("Failed to fetch feedback:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFeedback();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitMessage({ type: "success", text: "Feedback submitted successfully!" });
        setTitle("");
        setContent("");
        fetchFeedback();
      } else {
        setSubmitMessage({ type: "error", text: data.error || "Failed to submit feedback" });
      }
    } catch (error) {
      setSubmitMessage({ type: "error", text: "An error occurred while submitting feedback" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new":
        return <Clock className="w-3.5 h-3.5 text-amber-500" />;
      case "reviewed":
        return <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />;
      case "archived":
        return <Archive className="w-3.5 h-3.5 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "new":
        return "Pending";
      case "reviewed":
        return "Reviewed";
      case "archived":
        return "Archived";
      default:
        return status;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-14 sm:pt-16">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="text-center space-y-8 py-16">
            <div className="w-12 h-12 rounded-full bg-muted/50 mx-auto flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-muted-foreground/60" />
            </div>
            <div className="space-y-3">
              <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground/90">Share Your Feedback</h1>
              <p className="text-sm text-muted-foreground/60 leading-relaxed max-w-md mx-auto">
                Please sign in to submit feedback and view your submission history
              </p>
            </div>
            <Link href="/sign-in">
              <button className="px-6 py-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold tracking-tight transition-colors">
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-14 sm:pt-16">
      <div className="max-w-7xl mx-auto px-6 py-16 space-y-16">
        
        {/* Header */}
        <section className="space-y-3">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground/90">Feedback</h1>
          <p className="text-sm sm:text-[15px] text-muted-foreground/70 leading-relaxed">
            Share your thoughts, suggestions, or report issues to help us improve
          </p>
        </section>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Left Column - Submit Form */}
          <section className="space-y-8">
            <div className="space-y-1.5">
              <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground/80">Submit Feedback</h2>
              <div className="h-px bg-border/30" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground/60">
                  Title <span className="text-red-500/70">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief summary of your feedback"
                  required
                  maxLength={100}
                  className="w-full h-12 bg-transparent border-b border-border/30 focus:border-foreground/40 outline-none transition-colors px-0 text-sm sm:text-[15px] text-foreground/80 placeholder:text-muted-foreground/30"
                />
                <p className="text-[11px] text-muted-foreground/40 tabular-nums">{title.length}/100</p>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground/60">
                  Details <span className="text-red-500/70">*</span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Please provide detailed feedback..."
                  required
                  maxLength={2000}
                  rows={8}
                  className="w-full bg-transparent border border-border/30 focus:border-foreground/40 rounded-xl outline-none transition-colors p-4 text-sm sm:text-[15px] text-foreground/80 resize-none placeholder:text-muted-foreground/30 leading-relaxed"
                />
                <p className="text-[11px] text-muted-foreground/40 tabular-nums">{content.length}/2000</p>
              </div>

              {submitMessage && (
                <div
                  className={cn(
                    "p-4 rounded-xl text-sm sm:text-[15px] font-medium border border-border/40 bg-muted/30",
                    submitMessage.type === "success" && "text-green-500",
                    submitMessage.type === "error" && "text-red-500"
                  )}
                >
                  {submitMessage.text}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !title.trim() || !content.trim()}
                className="px-6 py-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold tracking-tight transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </button>
            </form>
          </section>

          {/* Right Column - History */}
          <section className="space-y-8">
            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between">
                <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground/80">Your Feedback</h2>
                <span className="text-xs font-medium tabular-nums text-muted-foreground/60">{feedbackList.length}</span>
              </div>
              <div className="h-px bg-border/30" />
            </div>

            {feedbackList.length === 0 ? (
              <div className="text-center py-16 rounded-xl border border-border/30 bg-muted/20">
                <p className="text-sm text-muted-foreground/60">No feedback submitted yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {feedbackList.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="rounded-xl border border-border/30 p-5 space-y-4 hover:border-border/40 transition-colors"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <h3 className="text-sm sm:text-base font-semibold tracking-tight text-foreground/85">{feedback.title}</h3>
                        <p className="text-[11px] text-muted-foreground/50">
                          {new Date(feedback.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border/30 bg-muted/50 text-[11px] font-medium tracking-tight text-muted-foreground/70 flex-shrink-0">
                        {getStatusIcon(feedback.status)}
                        {getStatusLabel(feedback.status)}
                      </div>
                    </div>

                    {/* Content */}
                    <p className="text-sm text-muted-foreground/70 leading-relaxed whitespace-pre-wrap">
                      {feedback.content}
                    </p>

                    {/* Response Section - Always Show */}
                    <div className="pt-4 border-t border-border/30 space-y-2">
                      <p className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground/50">
                        Team Response
                      </p>
                      <p className="text-sm text-foreground/70 leading-relaxed">
                        {feedback.adminNote || DEFAULT_RESPONSE}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}
