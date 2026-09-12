"use client";

import { useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";

interface ImageUploadProps {
  bucket: string;
  path: string;
  value?: string | null;
  onUpload: (url: string) => void;
  onRemove?: () => void;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
}

export function ImageUpload({
  bucket,
  path,
  value,
  onUpload,
  onRemove,
  accept = "image/jpeg,image/png,image/webp,image/avif",
  maxSizeMB = 5,
  className,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(async (file: File) => {
    setError("");
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File too large. Max ${maxSizeMB}MB`);
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `${path}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
      if (data?.publicUrl) {
        onUpload(data.publicUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }, [bucket, path, maxSizeMB, onUpload]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) upload(file);
  };

  if (value) {
    return (
      <div className={`relative group ${className || ""}`}>
        <img src={value} alt="Uploaded" className="w-full h-40 object-cover rounded-lg" />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" /> Replace
          </Button>
          {onRemove && (
            <Button variant="destructive" size="sm" onClick={onRemove}>
              <X className="mr-2 h-4 w-4" /> Remove
            </Button>
          )}
        </div>
        <input ref={inputRef} type="file" accept={accept} onChange={handleFileChange} className="hidden" />
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Uploading...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
            <div className="text-sm">
              <span className="text-primary font-medium">Click to upload</span> or drag and drop
            </div>
            <span className="text-xs text-muted-foreground">JPEG, PNG, WebP, AVIF (max {maxSizeMB}MB)</span>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-[#DC2626] mt-1">{error}</p>}
      <input ref={inputRef} type="file" accept={accept} onChange={handleFileChange} className="hidden" />
    </div>
  );
}
