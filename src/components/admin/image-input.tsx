import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ImageOff, Loader2, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Btn, Input, Label } from "./ui";

// 1 year - max signed URL TTL we'll request
const SIGNED_URL_TTL = 60 * 60 * 24 * 365;

export async function uploadToBucket(bucket: string, file: File): Promise<string> {
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: false,
    contentType: file.type || undefined,
    cacheControl: "31536000",
  });
  if (error) throw new Error(error.message);
  // Try signed URL first (works whether bucket is public or private).
  const { data: signed, error: sErr } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, SIGNED_URL_TTL);
  if (!sErr && signed?.signedUrl) return signed.signedUrl;
  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
  return pub.publicUrl;
}

type Status = "idle" | "loading" | "ok" | "error";

export function ImagePreview({
  url,
  className = "h-20 w-20",
}: {
  url: string;
  className?: string;
}) {
  const [status, setStatus] = useState<Status>(url ? "loading" : "idle");
  useEffect(() => {
    setStatus(url ? "loading" : "idle");
  }, [url]);
  if (!url) return null;
  return (
    <div
      className={`relative grid place-items-center overflow-hidden rounded-lg border border-border bg-secondary ${className}`}
    >
      {status !== "ok" && (
        <div className="absolute inset-0 grid place-items-center text-muted-foreground">
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImageOff className="h-4 w-4" />
          )}
        </div>
      )}
      <img
        src={url}
        alt=""
        loading="lazy"
        referrerPolicy="no-referrer"
        onLoad={() => setStatus("ok")}
        onError={() => setStatus("error")}
        className={`h-full w-full object-contain ${status === "ok" ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}

export function ImageUrlField({
  label = "Image",
  value,
  onChange,
  bucket,
  hint,
}: {
  label?: string;
  value: string;
  onChange: (next: string) => void;
  bucket: string;
  hint?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const upload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadToBucket(bucket, file);
      onChange(url);
      toast.success("Image uploaded");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  };
  return (
    <div>
      <Label>{label}</Label>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
      <div className="mt-2 flex items-start gap-3">
        <ImagePreview url={value} />
        <div className="flex-1 space-y-2">
          <Input
            placeholder="Paste image URL (https://…)"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <label className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-full bg-secondary px-3 text-xs font-semibold hover:bg-secondary/80">
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              {uploading ? "Uploading…" : "Upload from computer"}
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/avif"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) upload(f);
                  e.currentTarget.value = "";
                }}
              />
            </label>
            {value && (
              <Btn variant="ghost" onClick={() => onChange("")}>
                <X className="mr-1 h-3.5 w-3.5" />
                Clear
              </Btn>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
