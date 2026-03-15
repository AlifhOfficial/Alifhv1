'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, X, Check, Copy, Loader2, ImageIcon, Film, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  key: string;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  preview?: string;
}

const FOLDERS = [
  { value: 'marketing', label: 'Marketing' },
];

export function R2UploaderClient() {
  const [folder, setFolder] = useState('marketing');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const preview = file.type.startsWith('image/') 
      ? URL.createObjectURL(file) 
      : undefined;

    // Add to list
    const newFile: UploadedFile = {
      id,
      name: file.name,
      type: file.type,
      size: file.size,
      url: '',
      key: '',
      status: 'uploading',
      preview,
    };
    setFiles(prev => [newFile, ...prev]);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await fetch('/api/storage/static-upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setFiles(prev => prev.map(f => 
        f.id === id 
          ? { ...f, status: 'success', url: data.url, key: data.key }
          : f
      ));
    } catch (error) {
      setFiles(prev => prev.map(f =>
        f.id === id
          ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
          : f
      ));
    }
  }, [folder]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach(uploadFile);
  }, [uploadFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    selectedFiles.forEach(uploadFile);
    if (inputRef.current) inputRef.current.value = '';
  }, [uploadFile]);

  const copyUrl = useCallback((url: string) => {
    navigator.clipboard.writeText(url);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      return prev.filter(f => f.id !== id);
    });
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Folder Selection */}
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-xs">
          <Label htmlFor="folder" className="mb-2 block">Upload Folder</Label>
          <Select value={folder} onValueChange={setFolder}>
            <SelectTrigger id="folder">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FOLDERS.map(f => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground pt-6">
          Files uploaded to: <code className="bg-muted px-1.5 py-0.5 rounded">{folder}/</code>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all",
          isDragging 
            ? "border-primary bg-primary/5 scale-[1.02]" 
            : "border-border hover:border-primary/50 hover:bg-muted/30"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Upload className={cn(
          "mx-auto h-12 w-12 mb-4 transition-colors",
          isDragging ? "text-primary" : "text-muted-foreground"
        )} />
        <p className="text-lg font-medium mb-1">
          {isDragging ? 'Drop files here' : 'Drag & drop files here'}
        </p>
        <p className="text-sm text-muted-foreground">
          or click to browse • Images & videos up to 100MB
        </p>
      </div>

      {/* Uploaded Files */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Uploaded Files</h3>
            {files.some(f => f.status === 'success') && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setFiles(prev => {
                  prev.forEach(f => f.preview && URL.revokeObjectURL(f.preview));
                  return [];
                })}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
          
          <div className="space-y-2">
            {files.map(file => (
              <div 
                key={file.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border",
                  file.status === 'error' ? "border-destructive/50 bg-destructive/5" : "border-border bg-card"
                )}
              >
                {/* Preview */}
                <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                  {file.preview ? (
                    <img src={file.preview} alt="" className="h-full w-full object-cover" />
                  ) : file.type.startsWith('video/') ? (
                    <Film className="h-6 w-6 text-muted-foreground" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatSize(file.size)}
                    {file.status === 'success' && file.key && (
                      <> • <code className="text-xs">{file.key}</code></>
                    )}
                    {file.status === 'error' && file.error && (
                      <span className="text-destructive"> • {file.error}</span>
                    )}
                  </p>
                </div>

                {/* Status / Actions */}
                <div className="flex items-center gap-2">
                  {file.status === 'uploading' && (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  )}
                  {file.status === 'success' && (
                    <>
                      <Check className="h-5 w-5 text-green-500" />
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => copyUrl(file.url)}
                        title="Copy URL"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {file.status === 'error' && (
                    <X className="h-5 w-5 text-destructive" />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(file.id)}
                    title="Remove"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Reference */}
      <div className="rounded-lg bg-muted/30 border p-4 text-sm">
        <h4 className="font-medium mb-2">URL Pattern</h4>
        <code className="block bg-muted px-3 py-2 rounded text-xs">
          {process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://cdn.revvup.ae'}/{folder}/[filename]
        </code>
        <p className="mt-2 text-muted-foreground">
          Files are cached at edge locations worldwide with 1-year cache headers.
        </p>
      </div>
    </div>
  );
}
