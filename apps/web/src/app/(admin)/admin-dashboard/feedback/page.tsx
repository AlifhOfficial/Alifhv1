/**
 * Admin Feedback Page
 * Review and manage user feedback submissions
 */
'use client';

import { DashboardDisplayArea } from "@/components/shared/layout/display-area";
import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/forms/input';
import { Textarea } from '@/components/ui/forms/textarea';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  Archive, 
  Trash2, 
  Mail, 
  User,
  ChevronDown,
  ChevronUp,
  Search,
} from 'lucide-react';

interface FeedbackItem {
  feedback: {
    id: string;
    userId: string;
    title: string;
    content: string;
    status: 'new' | 'reviewed' | 'archived';
    isRead: boolean;
    reviewedBy: string | null;
    reviewedAt: string | null;
    adminNote: string | null;
    createdAt: string;
    updatedAt: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  userProfile: {
    firstName: string | null;
    lastName: string | null;
  } | null;
  reviewer: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export default function AdminFeedbackPage() {
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'new' | 'reviewed' | 'archived'>('all');
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch all feedback
  const { data, isLoading } = useQuery<{ feedback: FeedbackItem[] }>({
    queryKey: ['admin', 'feedback'],
    queryFn: async () => {
      const res = await fetch('/api/admin/feedback');
      if (!res.ok) throw new Error('Failed to fetch feedback');
      return res.json();
    },
  });

  const allFeedback = useMemo(() => data?.feedback || [], [data?.feedback]);
  
  // Compute stats from full dataset
  const newCount = useMemo(() => allFeedback.filter(f => f.feedback.status === 'new').length, [allFeedback]);
  const reviewedCount = useMemo(() => allFeedback.filter(f => f.feedback.status === 'reviewed').length, [allFeedback]);
  const archivedCount = useMemo(() => allFeedback.filter(f => f.feedback.status === 'archived').length, [allFeedback]);
  const unreadCount = useMemo(() => allFeedback.filter(f => !f.feedback.isRead).length, [allFeedback]);
  
  // Filter for display
  const filteredFeedback = useMemo(() => {
    let items = selectedStatus === 'all' 
      ? allFeedback 
      : allFeedback.filter(f => f.feedback.status === selectedStatus);
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(f => 
        f.feedback.title.toLowerCase().includes(query) ||
        f.feedback.content.toLowerCase().includes(query) ||
        f.user?.name?.toLowerCase().includes(query) ||
        f.user?.email?.toLowerCase().includes(query)
      );
    }
    
    return items;
  }, [allFeedback, selectedStatus, searchQuery]);

  const handleMarkRead = async (feedbackId: string) => {
    try {
      await fetch('/api/admin/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackId, action: 'markRead' }),
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'feedback'] });
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleReview = async (feedbackId: string, status: 'reviewed' | 'archived') => {
    setProcessing(feedbackId);
    try {
      const res = await fetch('/api/admin/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          feedbackId, 
          action: 'review', 
          status, 
          adminNote: adminNote || undefined 
        }),
      });

      if (!res.ok) throw new Error('Failed to update feedback');

      queryClient.invalidateQueries({ queryKey: ['admin', 'feedback'] });
      setExpandedFeedback(null);
      setAdminNote('');
    } catch (err) {
      console.error('Failed to review feedback:', err);
      alert('Failed to update feedback');
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (feedbackId: string) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;
    
    setProcessing(feedbackId);
    try {
      const res = await fetch(`/api/admin/feedback?id=${feedbackId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete feedback');

      queryClient.invalidateQueries({ queryKey: ['admin', 'feedback'] });
    } catch (err) {
      console.error('Failed to delete feedback:', err);
      alert('Failed to delete feedback');
    } finally {
      setProcessing(null);
    }
  };

  const toggleExpand = (feedbackId: string) => {
    if (expandedFeedback === feedbackId) {
      setExpandedFeedback(null);
      setAdminNote('');
    } else {
      setExpandedFeedback(feedbackId);
      setAdminNote('');
      // Mark as read when expanding
      const item = allFeedback.find(f => f.feedback.id === feedbackId);
      if (item && !item.feedback.isRead) {
        handleMarkRead(feedbackId);
      }
    }
  };

  const getStatusBadge = (status: string, isRead: boolean) => {
    if (!isRead && status === 'new') {
      return <Badge className="bg-primary hover:bg-primary/90"><Clock className="w-3 h-3 mr-1" />New</Badge>;
    }
    switch (status) {
      case 'new':
        return <Badge variant="outline" className="text-primary border-primary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'reviewed':
        return <Badge variant="outline" className="text-success border-success"><CheckCircle className="w-3 h-3 mr-1" />Reviewed</Badge>;
      case 'archived':
        return <Badge variant="outline" className="text-muted-foreground"><Archive className="w-3 h-3 mr-1" />Archived</Badge>;
      default:
        return null;
    }
  };

  const getUserDisplay = (item: FeedbackItem) => {
    if (item.userProfile?.firstName && item.userProfile?.lastName) {
      return `${item.userProfile.firstName} ${item.userProfile.lastName}`;
    }
    return item.user?.name || item.user?.email || 'Unknown User';
  };

  return (
    <DashboardDisplayArea>
      <div className="max-w-6xl mx-auto px-8 py-16 space-y-16">
        
        {/* Header */}
        <section className="space-y-4">
          <h1 className="text-title1 font-semibold tracking-tight">User Feedback</h1>
          <p className="text-muted-foreground">Review and manage feedback from users</p>
        </section>

        {/* Stats */}
        <section className="space-y-6">
          <div className="flex items-baseline justify-between border-b border-border/40 pb-2">
            <h3 className="text-headline tracking-tight">Overview</h3>
          </div>
          
          <div className="grid grid-cols-2 regular:grid-cols-4 gap-4">
            <Card className="cursor-pointer  transition-colors" onClick={() => setSelectedStatus('all')}>
              <CardContent className="p-4">
                <div className="text-title2 font-semibold">{allFeedback.length}</div>
                <div className="text-subhead text-muted-foreground">Total</div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer  transition-colors" onClick={() => setSelectedStatus('new')}>
              <CardContent className="p-4">
                <div className="text-title2 font-semibold text-primary">{newCount}</div>
                <div className="text-subhead text-muted-foreground">New ({unreadCount} unread)</div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer  transition-colors" onClick={() => setSelectedStatus('reviewed')}>
              <CardContent className="p-4">
                <div className="text-title2 font-semibold text-success">{reviewedCount}</div>
                <div className="text-subhead text-muted-foreground">Reviewed</div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer  transition-colors" onClick={() => setSelectedStatus('archived')}>
              <CardContent className="p-4">
                <div className="text-title2 font-semibold text-muted-foreground">{archivedCount}</div>
                <div className="text-subhead text-muted-foreground">Archived</div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Filters and Search */}
        <section className="space-y-4">
          <div className="flex flex-col compact:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search feedback..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'new', 'reviewed', 'archived'] as const).map((status) => (
                <Button
                  key={status}
                  variant={selectedStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedStatus(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Feedback List */}
        <section className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-muted rounded-lg" />
                </div>
              ))}
            </div>
          ) : filteredFeedback.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No feedback found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredFeedback.map((item) => (
                <Card 
                  key={item.feedback.id} 
                  className={`transition-colors ${!item.feedback.isRead ? 'border-primary/40 bg-primary-muted bg-primary-muted' : ''}`}
                >
                  <CardContent className="p-4">
                    <div 
                      className="cursor-pointer"
                      onClick={() => toggleExpand(item.feedback.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium truncate">{item.feedback.title}</h3>
                            {getStatusBadge(item.feedback.status, item.feedback.isRead)}
                          </div>
                          <div className="flex items-center gap-4 text-subhead text-muted-foreground mb-2">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {getUserDisplay(item)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {item.user?.email}
                            </span>
                          </div>
                          {expandedFeedback !== item.feedback.id && (
                            <p className="text-subhead text-muted-foreground line-clamp-2">{item.feedback.content}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-caption1 text-muted-foreground whitespace-nowrap">
                            {new Date(item.feedback.createdAt).toLocaleDateString()}
                          </span>
                          {expandedFeedback === item.feedback.id ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded View */}
                    {expandedFeedback === item.feedback.id && (
                      <div className="mt-4 pt-4 border-t border-border/40 space-y-4">
                        <div>
                          <h4 className="text-subhead mb-2">Full Feedback</h4>
                          <p className="text-subhead text-muted-foreground whitespace-pre-wrap bg-muted/30 p-3 rounded-md">
                            {item.feedback.content}
                          </p>
                        </div>

                        {item.feedback.adminNote && (
                          <div>
                            <h4 className="text-subhead mb-2">Previous Admin Note</h4>
                            <p className="text-subhead text-muted-foreground bg-muted/30 p-3 rounded-md">
                              {item.feedback.adminNote}
                            </p>
                          </div>
                        )}

                        {item.feedback.status !== 'archived' && (
                          <div className="space-y-3">
                            <div>
                              <label className="text-subhead">Admin Note (Optional)</label>
                              <Textarea
                                placeholder="Add a response or note..."
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                rows={3}
                                className="mt-1"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleReview(item.feedback.id, 'reviewed')}
                                disabled={processing === item.feedback.id}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Mark Reviewed
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReview(item.feedback.id, 'archived')}
                                disabled={processing === item.feedback.id}
                              >
                                <Archive className="w-4 h-4 mr-1" />
                                Archive
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDelete(item.feedback.id)}
                                disabled={processing === item.feedback.id}
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        )}

                        {item.feedback.status === 'archived' && (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(item.feedback.id)}
                              disabled={processing === item.feedback.id}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        )}

                        {item.reviewer && (
                          <div className="text-caption1 text-muted-foreground pt-2 border-t border-border/40">
                            Reviewed by {item.reviewer.name || item.reviewer.email} on{' '}
                            {item.feedback.reviewedAt ? new Date(item.feedback.reviewedAt).toLocaleString() : 'N/A'}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardDisplayArea>
  );
}
