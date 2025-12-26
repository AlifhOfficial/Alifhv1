/**
 * Messaging Module - Enhanced Message Input Component
 * Advanced input with microphone, emoji, attachments, and typing indicators
 */

"use client";

import { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Smile, 
  Paperclip, 
  Image as ImageIcon,
  X,
  Loader2,
  Play,
  Pause,
  Square
} from 'lucide-react';
import { VoiceRecorder } from '../VoiceRecorder';
import { cn } from '@/lib/utils';

interface EnhancedMessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: { text?: string; audioBlob?: Blob; image?: File }) => void;
  onTyping?: (isTyping: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showVoiceRecorder?: boolean;
  showAttachments?: boolean;
  showEmoji?: boolean;
}

export function EnhancedMessageInput({
  value,
  onChange,
  onSend,
  onTyping,
  placeholder = "Type a message...",
  disabled = false,
  className,
  showVoiceRecorder = true,
  showAttachments = true,
  showEmoji = true
}: EnhancedMessageInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedImage, setAttachedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Handle typing indicators
  useEffect(() => {
    if (!onTyping) return;

    const handleTyping = () => {
      onTyping(true);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 1000);
    };

    if (value.length > 0) {
      handleTyping();
    } else {
      onTyping(false);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [value, onTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (attachedImage) {
      onSend({ image: attachedImage });
      clearAttachedImage();
    } else if (value.trim()) {
      onSend({ text: value.trim() });
      onChange('');
    }
    
    inputRef.current?.focus();
  };

  const handleVoiceRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    
    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const handleVoiceRecordingComplete = (audioBlob: Blob) => {
    setIsRecording(false);
    setRecordingTime(0);
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
    
    onSend({ audioBlob });
  };

  const handleCancelRecording = () => {
    setIsRecording(false);
    setRecordingTime(0);
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setAttachedImage(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearAttachedImage = () => {
    setAttachedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Common emoji shortcuts
  const commonEmojis = ['😊', '😂', '❤️', '👍', '👎', '😢', '😮', '😡'];

  if (isRecording) {
    return (
      <div className={cn("flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg", className)}>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-red-700">
            Recording: {formatRecordingTime(recordingTime)}
          </span>
        </div>
        
        <button
          onClick={handleCancelRecording}
          className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
          title="Cancel recording"
        >
          <X className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => {
            // This would normally stop the actual recording
            handleVoiceRecordingComplete(new Blob([], { type: 'audio/webm' }));
          }}
          className="p-2 bg-red-500 text-white hover:bg-red-600 rounded-full transition-colors"
          title="Stop and send"
        >
          <Square className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Image Preview */}
      {imagePreview && (
        <div className="relative inline-block">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-20 h-20 object-cover rounded-lg border border-border"
          />
          <button
            onClick={clearAttachedImage}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border">
          {commonEmojis.map((emoji, index) => (
            <button
              key={index}
              onClick={() => {
                onChange(value + emoji);
                setShowEmojiPicker(false);
                inputRef.current?.focus();
              }}
              className="p-1 hover:bg-background rounded transition-colors text-lg"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Main Input */}
      <form onSubmit={handleSendMessage} className="flex items-end gap-2">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 pr-20 text-sm border border-border rounded-full bg-muted/30 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-alifh-blue focus:border-transparent resize-none"
            disabled={disabled}
          />
          
          {/* Emoji Button */}
          {showEmoji && (
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-12 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded transition-colors"
              title="Add emoji"
            >
              <Smile className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
        
        {/* Attachment Button */}
        {showAttachments && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-muted rounded transition-colors"
            title="Attach image"
          >
            <ImageIcon className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
        
        {/* Voice/Send Button */}
        {value.trim() || attachedImage ? (
          <button
            type="submit"
            disabled={disabled}
            className="p-2 bg-alifh-blue text-white rounded-full hover:bg-alifh-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        ) : showVoiceRecorder ? (
          <button
            type="button"
            onClick={handleVoiceRecording}
            className="p-2 text-muted-foreground hover:text-alifh-blue hover:bg-muted rounded-full transition-colors"
            title="Record voice message"
          >
            <Mic className="w-4 h-4" />
          </button>
        ) : null}
        
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </form>
    </div>
  );
}