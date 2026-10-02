import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_BYTES = 5 * 1024 * 1024;

export function validateImage(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) return "Format foto harus JPG, PNG, atau WEBP.";
  if (file.size > MAX_BYTES) return "Ukuran foto maksimal 5 MB.";
  return null;
}

/** Resize to max 1600px and convert to WebP to keep the site fast. */
async function compress(file: File, maxSize = 1600): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.82));
  return blob ?? file;
}

export async function uploadImage(file: File, folder: string): Promise<string> {
  const err = validateImage(file);
  if (err) throw new Error(err);
  const blob = await compress(file);
  const path = `${folder}/${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage.from("media").upload(path, blob, {
    contentType: "image/webp",
    upsert: false,
  });
  if (error) throw new Error("Upload foto gagal: " + error.message);
  return path;
}

export async function removeImage(path: string | null | undefined) {
  if (!path || /^https?:\/\//.test(path)) return;
  await supabase.storage.from("media").remove([path]);
}

export function useImageUrl(path: string | null | undefined) {
  return useQuery({
    queryKey: ["signed-url", path],
    enabled: !!path,
    staleTime: 1000 * 60 * 50,
    queryFn: async () => {
      if (!path) return null;
      if (/^https?:\/\//.test(path)) return path;
      const { data } = await supabase.storage.from("media").createSignedUrl(path, 60 * 60);
      return data?.signedUrl ?? null;
    },
  }).data;
}
