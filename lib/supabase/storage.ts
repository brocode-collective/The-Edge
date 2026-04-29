"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type UploadTarget = "shop-assets" | "menu-images";

export async function uploadPublicImage({
  bucket,
  file,
  path,
}: {
  bucket: UploadTarget;
  file: File;
  path: string;
}) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const safePath = path.replace(/^\/+/, "");
  const { error } = await supabase.storage
    .from(bucket)
    .upload(safePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(safePath);
  return data.publicUrl;
}
