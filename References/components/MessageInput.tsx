/**
 * Messaging UI - Message Input Component
 * Text input + attachments + voice recording with hold-to-record
 */

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Send, Paperclip, Mic, X, Loader2, FileText, FileImage } from "lucide-react";
import { useExternalUpload } from "@/lib/custom-upload";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  conversationId: string;
  userId: string;
  userName: string;
  onMessageSent?: () => void;
  startTyping?: (conversationId: string, userId: string, userName: string) => void;
  stopTyping?: (conversationId: string, userId: string) => void;
  className?: string;
  compact?: boolean; // For floating windows
}

export function MessageInput({
  conversationId,
  userId,
  userName,
  onMessageSent,
  startTyping,
  stopTyping,
  className,
  compact = false,
}: MessageInputProps) {
  const [text, setText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingProgress, setRecordingProgress] = useState(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunks = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const micButtonRef = useRef<HTMLButtonElement>(null);
  const recordingStartTimeRef = useRef<number | null>(null);

  const { uploadFiles: externalUploadFiles, generatePreview } = useExternalUpload();

  const MAX_FILES = 5;
  const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB (UploadThing limit)
  const MAX_RECORDING_TIME = 180; // 3 minutes

  const handleTextChange = (value: string) => {
    setText(value);

    // Handle typing indicators
    if (value && !typingTimeoutRef.current && startTyping) {
      startTyping(conversationId, userId, userName);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (stopTyping) {
        stopTyping(conversationId, userId);
      }
      typingTimeoutRef.current = null;
    }, 1500);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate files
    const validFiles = files.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        alert(`File "${file.name}" is too large. Maximum size is 4MB.`);
        return false;
      }
      return true;
    });

    // Check total file count
    if (selectedFiles.length + validFiles.length > MAX_FILES) {
      alert(`Maximum ${MAX_FILES} files allowed at once.`);
      return;
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
    
    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => {
      const fileToRemove = prev[index];
      // Clean up object URL if it's an image to prevent memory leaks
      if (fileToRemove && fileToRemove.type.startsWith('image/')) {
        URL.revokeObjectURL(URL.createObjectURL(fileToRemove));
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <FileImage className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const handleSend = async () => {
    if ((!text.trim() && selectedFiles.length === 0) || isSending) return;

    setIsSending(true);
    if (stopTyping) {
      stopTyping(conversationId, userId);
    }

    try {
      let mediaUrls: string[] = [];
      let mediaType: "IMAGE" | "AUDIO" | "FILE" | undefined;

      // Upload files if selected
      if (selectedFiles.length > 0) {
        setIsUploading(true);
        console.log("📤 Uploading files:", selectedFiles);
        try {
          const uploadResult = await externalUploadFiles(selectedFiles, 'attachment');
          console.log("✅ Upload result:", uploadResult);
          if (uploadResult && uploadResult.length > 0) {
            mediaUrls = uploadResult.map((r: any) => r.url);
            // Determine media type based on first file
            if (selectedFiles[0].type.startsWith('image/')) {
              mediaType = "IMAGE";
            } else {
              mediaType = "FILE";
            }
            console.log("📎 Media URLs:", mediaUrls, "Type:", mediaType);
          }
        } catch (uploadError) {
          console.error("❌ Upload failed:", uploadError);
          alert(`Failed to upload files: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
          return; // Don't try to send message if upload fails
        }
        setIsUploading(false);
      }

      // Send message (for now, send first file URL for compatibility)
      const messageData = {
        conversationId,
        // Don't send senderId - API uses session.user.id
        text: text.trim() || undefined,
        mediaUrl: mediaUrls[0] || undefined,
        mediaType,
      };
      console.log("📤 Sending message:", messageData);

      const response = await fetch("/api/v1/messaging/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        console.log("✅ Message sent successfully");
        setText("");
        // Clean up object URLs before clearing files
        selectedFiles.forEach(file => {
          if (file.type.startsWith('image/')) {
            URL.revokeObjectURL(URL.createObjectURL(file));
          }
        });
        setSelectedFiles([]);
        onMessageSent?.();
      } else {
        console.error("❌ Failed to send message:", await response.text());
        alert("Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("❌ Message send error:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Voice recording functions
  const startVoiceRecording = async () => {
    try {
      console.log("🎙️ Requesting microphone access...");
      
      // Request audio with optimized settings for smaller file size
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1, // Mono audio
          sampleRate: 16000, // Lower sample rate for smaller files
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      
      // Configure MediaRecorder with compression options
      const options: MediaRecorderOptions = {
        mimeType: 'audio/webm;codecs=opus', // Opus codec is more efficient
        audioBitsPerSecond: 32000 // Lower bitrate for smaller files
      };
      
      // Fallback if codec not supported
      if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
        console.log("⚠️ Opus codec not supported, using default");
        delete options.mimeType;
        options.audioBitsPerSecond = 32000; // Still try lower bitrate
      }
      
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      recordingChunks.current = [];
      
      console.log("🎙️ MediaRecorder configured:", {
        mimeType: mediaRecorder.mimeType,
        state: mediaRecorder.state
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordingChunks.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log("🛑 Recording stopped, processing audio...");
        const audioBlob = new Blob(recordingChunks.current, { 
          type: mediaRecorder.mimeType || "audio/webm" 
        });
        // Calculate actual recording duration
        const actualDuration = recordingStartTimeRef.current 
          ? Math.floor((Date.now() - recordingStartTimeRef.current) / 1000)
          : recordingTime;
        console.log("⏱️ Actual recording duration:", actualDuration + "s");
        await handleVoiceRecordingComplete(audioBlob, actualDuration);
        stream.getTracks().forEach((track) => track.stop());
        recordingStartTimeRef.current = null;
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setRecordingProgress(0);
      recordingStartTimeRef.current = Date.now();
      
      console.log("✅ Recording started successfully");

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          setRecordingProgress((newTime / MAX_RECORDING_TIME) * 100);
          
          // Auto-stop at max time
          if (newTime >= MAX_RECORDING_TIME) {
            stopVoiceRecording();
          }
          return newTime;
        });
      }, 1000);
    } catch (error) {
      console.error("Failed to start recording:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const cancelVoiceRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);
      setRecordingProgress(0);
      recordingStartTimeRef.current = null;
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const handleVoiceRecordingComplete = async (audioBlob: Blob, duration: number = recordingTime) => {
    if (duration < 1) {
      console.log("⚠️ Recording too short, ignoring", { duration });
      return; // Ignore very short recordings
    }

    setIsSending(true);
    console.log("🎙️ Processing voice note:", {
      duration: duration + "s",
      blobSize: (audioBlob.size / 1024).toFixed(1) + "KB",
      blobType: audioBlob.type
    });

    // Check size early to prevent data URL issues
    const maxSize = 500 * 1024; // 500KB limit for voice notes
    if (audioBlob.size > maxSize) {
      console.error(`❌ Voice note too large: ${(audioBlob.size / 1024).toFixed(1)}KB (max: ${maxSize / 1024}KB)`);
      alert(`Recording too long! Please keep voice notes under ${maxSize / 1024}KB (about 30-45 seconds).`);
      setIsSending(false);
      return;
    }

    try {
      // Create audio file with proper type
      const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, {
        type: audioBlob.type || "audio/webm",
      });
      
      console.log("📤 Voice note file ready:", {
        name: audioFile.name,
        sizeKB: (audioFile.size / 1024).toFixed(1) + "KB",
        type: audioFile.type
      });

      console.log("🚀 Starting voice note upload...");
      const uploadResult = await externalUploadFiles([audioFile], 'voice');
      console.log("✅ Voice note upload result:", uploadResult);

      if (uploadResult && uploadResult.length > 0 && uploadResult[0]?.url) {
        const dataUrlSize = uploadResult[0].url.length;
        console.log("🎵 Voice note data URL size:", (dataUrlSize / 1024).toFixed(1) + "KB");
        
        const response = await fetch("/api/v1/messaging/messages/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId,
            // Don't send senderId - API uses session.user.id  
            mediaUrl: uploadResult[0].url,
            mediaType: "AUDIO",
          }),
        });

        if (response.ok) {
          console.log("✅ Voice note message sent successfully");
          setRecordingTime(0);
          setRecordingProgress(0);
          onMessageSent?.();
        } else {
          const errorText = await response.text();
          console.error("❌ Failed to send voice note message:", errorText);
          alert("Failed to send voice note message. Please try again.");
        }
      } else {
        console.error("❌ Voice note upload failed - no URL returned");
        alert("Failed to upload voice note. Please try again.");
      }
    } catch (error) {
      console.error("❌ Voice note error:", error);
      alert(`Failed to send voice note: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSending(false);
      setRecordingTime(0);
      setRecordingProgress(0);
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle mouse events for voice recording
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startVoiceRecording();
  };

  const handleMouseUp = () => {
    if (isRecording) {
      stopVoiceRecording();
    }
  };

  const handleMouseLeave = () => {
    if (isRecording) {
      cancelVoiceRecording();
    }
  };

  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    startVoiceRecording();
  };

  const handleTouchEnd = () => {
    if (isRecording) {
      stopVoiceRecording();
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Clean up any object URLs
      selectedFiles.forEach(file => {
        if (file.type.startsWith('image/')) {
          URL.revokeObjectURL(URL.createObjectURL(file));
        }
      });
    };
  }, [selectedFiles]);

  // Voice recording overlay
  if (isRecording) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="bg-background border border-border rounded-xl p-8 text-center shadow-2xl">
          <div className="relative mb-6">
            {/* Circular progress */}
            <div className="relative w-24 h-24 mx-auto">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted-foreground/20"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - recordingProgress / 100)}`}
                  className="text-alifh-blue transition-all duration-300"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Mic className="w-8 h-8 text-alifh-blue animate-pulse" />
              </div>
            </div>
          </div>
          
          <div className="space-y-2 mb-6">
            <p className="text-lg font-medium">Recording Voice Note</p>
            <p className="text-2xl font-mono text-alifh-blue font-semibold">{formatRecordingTime(recordingTime)}</p>
            <p className="text-sm text-muted-foreground">
              Release to send • Click cancel to discard
            </p>
          </div>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={cancelVoiceRecording}
              className="px-6 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={stopVoiceRecording}
              className="px-6 py-2 bg-alifh-blue text-white rounded-lg hover:bg-alifh-blue-dark transition-colors"
            >
              Send Note
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "border-t border-border bg-background/95 backdrop-blur-sm",
      compact ? "px-3 py-2" : "px-4 py-3",
      className
    )}>
      {/* File Previews */}
      {selectedFiles.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative bg-muted rounded-lg overflow-hidden">
                {file.type.startsWith('image/') ? (
                  // Image preview - using data URL for better performance
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="h-16 lg:h-20 w-auto max-w-24 lg:max-w-28 object-cover"
                    />
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                      {file.name}
                    </div>
                  </div>
                ) : (
                  // File preview
                  <div className="p-2 lg:p-3 pr-6 lg:pr-8 flex items-center gap-2 max-w-48 lg:max-w-xs">
                    {getFileIcon(file)}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 p-1 hover:bg-background rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {selectedFiles.length}/{MAX_FILES} files • Max 4MB each
          </p>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-center bg-muted/50 border border-border rounded-lg p-1.5 lg:p-2 min-w-0 overflow-hidden w-full">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {/* Attachment Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isSending || selectedFiles.length >= MAX_FILES}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-200 disabled:opacity-50 mr-1"
          title="Attach files"
        >
          <Paperclip className="w-4 h-4" />
        </button>
        
        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground resize-none max-h-24 lg:max-h-32 text-sm py-1.5 lg:py-2 px-1.5 lg:px-2 min-w-0 overflow-hidden"
          style={{
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
            minHeight: "18px",
            height: "auto",
          }}
        />

        {/* Voice Note Button - Hold to Record */}
        <button
          ref={micButtonRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          disabled={isSending}
          className="p-2 text-muted-foreground hover:text-alifh-blue hover:bg-alifh-blue/10 transition-all duration-200 disabled:opacity-50 mr-2 select-none"
          title="Hold to record voice note"
        >
          <Mic className="w-4 h-4" />
        </button>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={(!text.trim() && selectedFiles.length === 0) || isSending || isUploading}
          className="p-2 bg-alifh-blue text-white hover:bg-alifh-blue-dark transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ml-1"
        >
          {isSending || isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
