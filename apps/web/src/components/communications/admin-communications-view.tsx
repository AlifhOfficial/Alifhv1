/**
 * Admin Communications View
 * 
 * View and manage incoming communications/contact messages
 * Following Alifh design system - clean, minimal
 */

'use client';

import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, 
  Phone, 
  User,
  Clock,
  CheckCircle2,
  Archive,
  Loader2,
  Search,
  MailOpen,
  Trash2,
  MessageSquare,
  ChevronRight,
  X,
  HelpCircle,
  Briefcase,
  MessageCircle,
  AlertCircle,
  RefreshCcw,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// ============================================================================
// Types
// ============================================================================

type CommunicationType = 'inquiry' | 'support' | 'partnership' | 'feedback' | 'report' | 'other';
type CommunicationStatus = 'new' | 'in_progress' | 'resolved' | 'archived';

interface Communication {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  type: CommunicationType;
  status: CommunicationStatus;
  isRead: boolean;
  adminNote: string | null;
  assignedTo: string | null;
  resolvedAt: string | null;
  resolvedBy: string | null;
  createdAt: string;
  updatedAt: string;
  assignedUser?: { id: string; name: string; email: string } | null;
  resolvedByUser?: { id: string; name: string; email: string } | null;
}

interface CommunicationStats {
  total: number;
  unread: number;
  new: number;
  inProgress: number;
  resolved: number;
}

// ============================================================================
// Fetcher & Hooks
// ============================================================================

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

function useCommunications(filter?: { status?: string; type?: string; search?: string }) {
  const params = new URLSearchParams();
  if (filter?.status) params.set('status', filter.status);
  if (filter?.type) params.set('type', filter.type);
  if (filter?.search) params.set('search', filter.search);
  
  const queryString = params.toString();
  const url = `/api/admin/communications${queryString ? `?${queryString}` : ''}`;
  
  return useQuery<{ communications: Communication[] }>({
    queryKey: ['admin-communications', filter],
    queryFn: () => fetcher(url),
    refetchInterval: 30000, // Refresh every 30s
  });
}

function useCommunicationStats() {
  return useQuery<{ stats: CommunicationStats }>({
    queryKey: ['admin-communications-stats'],
    queryFn: () => fetcher('/api/admin/communications?statsOnly=true'),
    refetchInterval: 30000,
  });
}

// ============================================================================
// Helper Functions
// ============================================================================

function getTypeIcon(type: CommunicationType) {
  switch (type) {
    case 'inquiry': return HelpCircle;
    case 'support': return MessageCircle;
    case 'partnership': return Briefcase;
    case 'feedback': return MessageSquare;
    case 'report': return AlertCircle;
    default: return Mail;
  }
}

function getTypeLabel(type: CommunicationType) {
  switch (type) {
    case 'inquiry': return 'Inquiry';
    case 'support': return 'Support';
    case 'partnership': return 'Partnership';
    case 'feedback': return 'Feedback';
    case 'report': return 'Report';
    default: return 'Other';
  }
}

function getStatusConfig(status: CommunicationStatus) {
  switch (status) {
    case 'new':
      return { icon: AlertCircle, label: 'New', color: 'text-blue-500', bg: 'bg-blue-500/10' };
    case 'in_progress':
      return { icon: Clock, label: 'In Progress', color: 'text-amber-500', bg: 'bg-amber-500/10' };
    case 'resolved':
      return { icon: CheckCircle2, label: 'Resolved', color: 'text-green-500', bg: 'bg-green-500/10' };
    case 'archived':
      return { icon: Archive, label: 'Archived', color: 'text-muted-foreground', bg: 'bg-muted' };
    default:
      return { icon: Mail, label: status, color: 'text-muted-foreground', bg: 'bg-muted' };
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

// ============================================================================
// Stats Component
// ============================================================================

function CommunicationStatsCards() {
  const { data, isPending: isLoading } = useCommunicationStats();

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/40 bg-sidebar p-4">
        <div className="flex items-center justify-center gap-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="text-center animate-pulse">
              <div className="h-6 w-8 bg-muted/50 rounded mx-auto mb-1" />
              <div className="h-3 w-12 bg-muted/30 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = data?.stats;
  if (!stats) return null;

  const cards = [
    { label: 'Total', value: stats.total, color: 'text-foreground' },
    { label: 'Unread', value: stats.unread, color: 'text-red-500' },
    { label: 'New', value: stats.new, color: 'text-blue-500' },
    { label: 'In Progress', value: stats.inProgress, color: 'text-amber-500' },
    { label: 'Resolved', value: stats.resolved, color: 'text-green-500' },
  ];

  return (
    <div className="rounded-xl border border-border/40 bg-sidebar p-5">
      <div className="flex items-center justify-between gap-4 overflow-x-auto">
        {cards.map(({ label, value, color }, idx) => (
          <React.Fragment key={label}>
            <div className="text-center min-w-[60px]">
              <p className={cn("text-xl font-semibold tabular-nums", color)}>{value}</p>
              <p className="text-xs text-muted-foreground/70 font-medium mt-0.5">{label}</p>
            </div>
            {idx < cards.length - 1 && (
              <div className="h-8 w-px bg-border/40 flex-shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Communication Detail Modal
// ============================================================================

interface DetailModalProps {
  communication: Communication;
  onClose: () => void;
  onUpdate: () => void;
}

function CommunicationDetailModal({ communication, onClose, onUpdate }: DetailModalProps) {
  const { toast } = useToast();
  const [adminNote, setAdminNote] = useState(communication.adminNote || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const statusConfig = getStatusConfig(communication.status);
  const StatusIcon = statusConfig.icon;
  const TypeIcon = getTypeIcon(communication.type);

  const handleStatusUpdate = async (newStatus: CommunicationStatus) => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/admin/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          communicationId: communication.id,
          action: 'updateStatus',
          status: newStatus,
          adminNote: adminNote || undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to update');

      toast({
        title: 'Status Updated',
        description: `Changed to ${getStatusConfig(newStatus).label}`,
      });
      onUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveNote = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/admin/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          communicationId: communication.id,
          action: 'addNote',
          adminNote,
        }),
      });

      if (!response.ok) throw new Error('Failed to save note');

      toast({
        title: 'Note Saved',
        description: 'Admin note has been updated',
      });
      onUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save note',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this message? This cannot be undone.')) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/communications?id=${communication.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      toast({
        title: 'Deleted',
        description: 'Communication has been deleted',
      });
      onClose();
      onUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/40 backdrop-blur-2xl">
      <div className="bg-background rounded-2xl border border-border/40 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border/40 p-5 flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium",
                statusConfig.bg, statusConfig.color
              )}>
                <StatusIcon className="w-3 h-3" />
                {statusConfig.label}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-muted/50 text-muted-foreground">
                <TypeIcon className="w-3 h-3" />
                {getTypeLabel(communication.type)}
              </span>
              {!communication.isRead && (
                <span className="w-2 h-2 rounded-full bg-blue-500" title="Unread" />
              )}
            </div>
            <h2 className="text-lg font-semibold tracking-tight">{communication.subject}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6">
          {/* Contact Info */}
          <section>
            <p className="text-[15px] font-bold tracking-tight text-foreground mb-3">Contact</p>
            <div className="rounded-xl border border-border/40 bg-sidebar">
              <div className="py-3 px-5 border-b border-border/20 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground/70">Name</p>
                  <p className="text-sm font-medium">{communication.name}</p>
                </div>
              </div>
              <div className="py-3 px-5 border-b border-border/20 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground/70">Email</p>
                  <a href={`mailto:${communication.email}`} className="text-sm font-medium text-primary hover:underline">
                    {communication.email}
                  </a>
                </div>
              </div>
              {communication.phone && (
                <div className="py-3 px-5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground/70">Phone</p>
                    <a href={`tel:${communication.phone}`} className="text-sm font-medium text-primary hover:underline">
                      {communication.phone}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Message */}
          <section>
            <p className="text-[15px] font-bold tracking-tight text-foreground mb-3">Message</p>
            <div className="rounded-xl border border-border/40 bg-sidebar p-4">
              <p className="text-sm font-medium whitespace-pre-wrap leading-relaxed">
                {communication.message}
              </p>
              <p className="text-xs text-muted-foreground/50 mt-4">
                Received {formatDate(communication.createdAt)}
                {communication.resolvedAt && communication.resolvedByUser && (
                  <> · Resolved by {communication.resolvedByUser.name}</>
                )}
              </p>
            </div>
          </section>

          {/* Admin Note */}
          <section>
            <p className="text-[15px] font-bold tracking-tight text-foreground mb-3">Admin Note</p>
            <div className="rounded-xl border border-border/40 bg-sidebar p-4">
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Add internal notes..."
                rows={3}
                className="w-full bg-muted/20 rounded-lg px-3 py-2.5 text-sm font-medium resize-none focus:outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground/50"
              />
              {adminNote !== (communication.adminNote || '') && (
                <button
                  onClick={handleSaveNote}
                  disabled={isUpdating}
                  className="mt-3 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {isUpdating ? 'Saving...' : 'Save Note'}
                </button>
              )}
            </div>
          </section>

          {/* Status Actions */}
          <section>
            <p className="text-[15px] font-bold tracking-tight text-foreground mb-3">Status</p>
            <div className="rounded-xl border border-border/40 bg-sidebar p-4">
              <div className="flex flex-wrap gap-2">
                {(['new', 'in_progress', 'resolved', 'archived'] as CommunicationStatus[]).map((status) => {
                  const config = getStatusConfig(status);
                  const Icon = config.icon;
                  const isActive = communication.status === status;
                  
                  return (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(status)}
                      disabled={isUpdating || isActive}
                      className={cn(
                        "inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all",
                        isActive
                          ? cn(config.bg, config.color)
                          : "bg-muted/30 text-muted-foreground/70 hover:bg-muted/50 hover:text-foreground disabled:opacity-50"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {config.label}
                      {isActive && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Delete */}
          <section className="pt-2">
            <button
              onClick={handleDelete}
              disabled={isUpdating}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Delete Communication
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Communication List Item
// ============================================================================

interface ListItemProps {
  communication: Communication;
  onClick: () => void;
}

function CommunicationListItem({ communication, onClick }: ListItemProps) {
  const statusConfig = getStatusConfig(communication.status);
  const StatusIcon = statusConfig.icon;
  const TypeIcon = getTypeIcon(communication.type);

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left py-3 px-4 transition-all",
        "border-b border-border/20 last:border-b-0",
        "hover:bg-muted/30",
        !communication.isRead && "bg-primary/5"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
          communication.isRead ? "bg-muted/50" : "bg-primary/10"
        )}>
          <TypeIcon className={cn(
            "w-4 h-4",
            communication.isRead ? "text-muted-foreground" : "text-primary"
          )} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={cn(
              "text-sm font-semibold truncate",
              !communication.isRead && "text-foreground"
            )}>
              {communication.name}
            </span>
            {!communication.isRead && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
            )}
            <span className="text-xs text-muted-foreground/50 ml-auto flex-shrink-0">
              {formatDate(communication.createdAt)}
            </span>
          </div>
          <p className="text-sm font-medium truncate">{communication.subject}</p>
          <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
            {communication.message.slice(0, 80)}...
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium",
              statusConfig.bg, statusConfig.color
            )}>
              <StatusIcon className="w-3 h-3" />
              {statusConfig.label}
            </span>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-muted-foreground/50 flex-shrink-0 mt-1" />
      </div>
    </button>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function AdminCommunicationsView() {
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCommunication, setSelectedCommunication] = useState<Communication | null>(null);
  
  const queryClient = useQueryClient();
  
  const { data, isPending: isLoading, error, refetch } = useCommunications({
    status: filterStatus || undefined,
    type: filterType || undefined,
    search: searchQuery || undefined,
  });

  const handleRefresh = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ['admin-communications-stats'] });
  };

  const communications = data?.communications || [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Communications</h1>
        <p className="text-sm text-muted-foreground/70 mt-0.5">Manage incoming messages</p>
      </div>

      {/* Stats */}
      <CommunicationStatsCards />

      {/* Filters */}
      <section>
        <p className="text-[15px] font-bold tracking-tight text-foreground mb-3">Filters</p>
        <div className="rounded-xl border border-border/40 bg-sidebar">
          {/* Search */}
          <div className="py-3 px-5 border-b border-border/20">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or subject..."
                className="w-full pl-10 pr-4 h-10 bg-muted/20 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground/50"
              />
            </div>
          </div>

          {/* Status & Type */}
          <div className="py-3 px-5 flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground/70 mb-1.5">Status</p>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full h-10 px-3 bg-muted/20 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/30"
              >
                <option value="">All Status</option>
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground/70 mb-1.5">Type</p>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full h-10 px-3 bg-muted/20 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/30"
              >
                <option value="">All Types</option>
                <option value="inquiry">Inquiry</option>
                <option value="support">Support</option>
                <option value="partnership">Partnership</option>
                <option value="feedback">Feedback</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleRefresh}
                className="h-10 w-10 rounded-lg bg-muted/20 hover:bg-muted/40 flex items-center justify-center transition-colors"
                title="Refresh"
              >
                <RefreshCcw className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* List */}
      <section>
        <p className="text-[15px] font-bold tracking-tight text-foreground mb-3">Messages</p>
        <div className="rounded-xl border border-border/40 bg-sidebar overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground/50" />
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-sm text-red-500">Failed to load communications</p>
              <button onClick={handleRefresh} className="mt-2 text-xs text-muted-foreground hover:text-foreground underline">
                Try again
              </button>
            </div>
          ) : communications.length === 0 ? (
            <div className="p-12 text-center">
              <MailOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No messages</p>
              <p className="text-xs text-muted-foreground/50 mt-1">
                {searchQuery || filterStatus || filterType
                  ? 'Try adjusting your filters'
                  : 'Incoming messages will appear here'}
              </p>
            </div>
          ) : (
            communications.map((comm) => (
              <CommunicationListItem
                key={comm.id}
                communication={comm}
                onClick={() => setSelectedCommunication(comm)}
              />
            ))
          )}
        </div>
      </section>

      {/* Detail Modal */}
      {selectedCommunication && (
        <CommunicationDetailModal
          communication={selectedCommunication}
          onClose={() => setSelectedCommunication(null)}
          onUpdate={handleRefresh}
        />
      )}
    </div>
  );
}
