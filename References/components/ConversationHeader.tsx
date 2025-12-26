/**
 * Messaging UI - Conversation Header Component
 */

"use client";

import { useEffect } from "react";
import { User, Zap, Moon, Cloud, Activity, Flame, X, Sun, Circle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useSharedUserStatus } from "@/hooks/use-shared-user-status";
import type { ConversationResponseDTO } from "../../application/dtos";

interface ConversationHeaderProps {
  conversation: ConversationResponseDTO;
  currentUserId: string;
  onClose?: () => void;
}

export function ConversationHeader({
  conversation,
  currentUserId,
  onClose,
}: ConversationHeaderProps) {
  // Get other participant first
  const otherParticipant = conversation.participants.find(
    (p) => p.id !== currentUserId
  );

  // Use shared user status
  const { userStatus, updateUserStatus } = useSharedUserStatus();

  // Initialize user status with lastActiveAt from conversation data ONLY if not already in shared status
  useEffect(() => {
    if (otherParticipant) {
      // Check if we already have status for this user from socket events
      const existingStatus = userStatus[otherParticipant.id];
      
      if (existingStatus) {
        return; // Don't override existing socket status
      }

      if (otherParticipant.lastActiveAt) {
        updateUserStatus(otherParticipant.id, {
          isOnline: false, // Will be updated by socket if currently active
          lastSeen: otherParticipant.lastActiveAt
        });
      } else {
        updateUserStatus(otherParticipant.id, {
          isOnline: false,
          lastSeen: ""
        });
      }
    }
  }, [otherParticipant, updateUserStatus, userStatus]);

  if (!otherParticipant) return null;

  // Get current user status
  const currentStatus = userStatus[otherParticipant.id];
  const isOnline = currentStatus?.isOnline || false;
  const lastSeen = currentStatus?.lastSeen;

  const formatLastSeen = (lastSeenDate: string, isCurrentlyOnline: boolean) => {
    const date = new Date(lastSeenDate);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    // Only show "Active now" if truly recently active (within 5 minutes) AND marked as online
    if (isCurrentlyOnline && diffInMinutes <= 5) {
      return "Active now";
    }
    
    // If marked as online but last activity is old, show the actual time instead
    if (isCurrentlyOnline && diffInMinutes > 5) {
      // Don't return "Active now" - fall through to show actual time
    }
    
    // Show accurate last seen time
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-background/50 backdrop-blur-sm flex-shrink-0">
      {/* Left Section - Avatar and Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Avatar */}
        {otherParticipant.avatar ? (
          <img
            src={otherParticipant.avatar}
            alt={otherParticipant.name}
            className="w-11 h-11 object-cover shadow-sm border border-border rounded-full"
          />
        ) : (
          <div className="w-11 h-11 bg-muted flex items-center justify-center shadow-sm border border-border rounded-full">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
        )}

        {/* User Info */}
        <div className="flex-1 min-w-0">
          {/* Name and Role */}
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-foreground truncate">
              {otherParticipant.name}
            </h3>
            {otherParticipant.role && otherParticipant.role.toLowerCase() !== 'user' && (
              <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted/50 rounded-full">
                {otherParticipant.role.toLowerCase()}
              </span>
            )}
          </div>

          {/* Activity Status */}
          <div className="flex items-center gap-2">
            {isOnline ? (
              <>
                <div className="relative">
                  <Moon className="w-3 h-3 text-rose-500 fill-rose-500" />
                  <span className="absolute -top-0.5 -right-0.5 text-[7px] text-rose-400 font-serif italic animate-pulse">✦</span>
                </div>
                <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">Active now</span>
              </>
            ) : lastSeen ? (
              <>
                <div className="relative">
                  <Moon className="w-3 h-3 text-purple-500 fill-purple-500" />
                  <span className="absolute -top-0.5 -right-0.5 text-[7px] text-purple-400 font-serif italic">z</span>
                </div>
                <span className="text-xs text-muted-foreground font-medium">
                  Last seen {formatLastSeen(lastSeen, isOnline)}
                </span>
              </>
            ) : (
              <>
                <Cloud className="w-3 h-3 text-slate-500 fill-slate-400" />
                <span className="text-xs text-muted-foreground font-medium">Away</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Section - Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="p-2 hover:bg-muted/50 rounded-md transition-colors text-muted-foreground hover:text-foreground"
          title="Close chat"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
