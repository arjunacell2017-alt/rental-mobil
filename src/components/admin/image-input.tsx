import { useEffect, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { useImageUrl, validateImage } from "@/lib/admin-media";

/** Picks a file with preview. Value = existing storage path; pending file returned via onFile. */
export function ImageInput({
  value,
  file,
  onFile,
  onClear,
  fallback,
}: {
  value: string | null;
  file: File | null;
  onFile: (f: File | null) => void;
  onClear: () => void;
  fallback?: string;
}) {
  const existing = useImageUrl(value);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const shown = preview ?? existing ?? (value ? null : fallback) ?? null;

  return (
    <div className="flex items-center gap-4">
      <div className="relative size-24 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
        {shown ? (
          <img src={shown} alt="Pratinjau" className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <ImagePlus className="size-6" />
          </div>
        )}
        {(file || value) && (
          <button
            type="button"
            onClick={() => (file ? onFile(null) : onClear())}
            className="absolute top-1 right-1 rounded-full bg-background/90 p-1 text-foreground shadow"
            aria-label="Hapus foto"
          >
            <X className="size-3" />
          </button>
        )}
      </div>
      <label className="cursor-pointer rounded-xl border border-border px-4 py-2 text-sm font-medium text-primary hover:bg-secondary">
        {value || file ? "Ganti foto" : "Pilih foto"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (!f) return;
            const err = validateImage(f);
            if (err) return void toast.error(err);
            onFile(f);
          }}
        />
      </label>
      <p className="hidden text-xs text-muted-foreground sm:block">JPG, PNG, WEBP · maks 5 MB</p>
    </div>
  );
}
