/**
 * Messaging UI - Message Bubble Component
 * Individual message display with polished UX
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { User, Image as ImageIcon, Mic, File, Play, Pause } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { MessageResponseDTO } from "../../application/dtos";

interface VoiceMessagePlayerProps {
  audioUrl: string;
  isOwn: boolean;
  compact?: boolean;
}

function VoiceMessagePlayer({ audioUrl, isOwn, compact = false }: VoiceMessagePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * duration;
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-2 py-1.5 mb-1 min-w-0 w-full overflow-hidden">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
          isOwn 
            ? 'bg-white/20 hover:bg-white/30 text-white' 
            : 'bg-foreground/10 hover:bg-foreground/20 text-foreground'
        }`}
      >
        {isPlaying ? (
          <Pause className="w-3.5 h-3.5" />
        ) : (
          <Play className="w-3.5 h-3.5 ml-0.5" />
        )}
      </button>

      {/* Waveform/Progress */}
      <div className="flex-1 flex items-center gap-2 min-w-0 overflow-hidden">
        <div 
          className={`flex-1 h-1 rounded-full cursor-pointer transition-all ${
            isOwn ? 'bg-white/20' : 'bg-foreground/20'
          }`}
          onClick={handleSeek}
        >
          <div 
            className={`h-full rounded-full transition-all ${
              isOwn ? 'bg-white/60' : 'bg-foreground/60'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Duration */}
        <span className={`text-xs font-mono ${
          isOwn ? 'text-white/70' : 'text-foreground/70'
        }`}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: MessageResponseDTO;
  isOwn: boolean;
  showAvatar?: boolean;
  showSeenStatus?: boolean;
  otherUserAvatar?: string;
  compact?: boolean;
  className?: string;
}

export function MessageBubble({ 
  message, 
  isOwn, 
  showAvatar = true,
  showSeenStatus = false,
  otherUserAvatar,
  compact = false,
  className = ""
}: MessageBubbleProps) {
  const renderMedia = () => {
    if (!message.mediaUrl) return null;

    switch (message.mediaType) {
      case "IMAGE":
        return (
          <div className="relative rounded-xl overflow-hidden max-w-full mb-2">
            <img
              src={message.mediaUrl}
              alt="Shared image"
              className={cn(
                "w-full h-auto",
                compact ? "max-w-[200px] lg:max-w-[240px]" : "max-w-[240px] lg:max-w-[280px]"
              )}
              loading="lazy"
            />
          </div>
        );

      case "AUDIO":
        return <VoiceMessagePlayer audioUrl={message.mediaUrl} isOwn={isOwn} compact={compact} />;

      case "FILE":
        return (
          <a
            href={message.mediaUrl}
            download
            className="flex items-center gap-2 mb-1 text-current/80 hover:text-current transition-colors underline decoration-dotted underline-offset-2 overflow-hidden"
          >
            <File className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm truncate">Download attachment</span>
          </a>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`flex ${compact ? 'gap-1.5 mb-1.5' : 'gap-3 mb-2'} ${isOwn ? "flex-row-reverse" : "flex-row"} w-full overflow-hidden ${className}`}>
      {/* Message Content */}
      <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} ${compact ? 'max-w-[90%]' : 'max-w-[75%]'} min-w-0 overflow-hidden`}>
        {/* Sender Name (if not own and showing avatar) */}
        {!isOwn && showAvatar && (
          <span className={`text-xs text-muted-foreground mb-1 ${compact ? 'px-2' : 'px-3'}`}>
            {message.senderName}
          </span>
        )}

        {/* Message Container with Horizontal Scroll for Timestamp */}
        <div className="relative group w-full overflow-hidden">
          {/* Message Bubble */}
          <div
            className={`rounded-2xl ${compact ? 'px-3 py-2' : 'px-4 py-3'} relative transition-all duration-200 w-full overflow-hidden ${
              isOwn
                ? "bg-alifh-blue text-white shadow-sm"
                : "bg-muted text-foreground shadow-sm"
            }`}
          >
            {renderMedia()}
            
            {message.text && (
              <p className="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere leading-relaxed">
                {message.text}
              </p>
            )}
          </div>

          {/* Timestamp - Hidden by default, shows on hover/scroll */}
          <div 
            className={`
              absolute top-1/2 -translate-y-1/2 text-xs text-muted-foreground 
              opacity-0 group-hover:opacity-100 transition-opacity duration-200
              pointer-events-none whitespace-nowrap z-10
              ${isOwn ? "-left-2 -translate-x-full" : "-right-2 translate-x-full"}
            `}
          >
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
          </div>
        </div>

        {/* Instagram-like Seen Status - Only for last message when read */}
        {isOwn && showSeenStatus && message.readAt && otherUserAvatar && (
          <div className="flex items-center mt-1 ml-2">
            <img
              src={otherUserAvatar}
              alt="Seen"
              className="w-4 h-4 rounded-full object-cover border border-background shadow-sm"
            />
          </div>
        )}

      </div>
    </div>
  );
}
