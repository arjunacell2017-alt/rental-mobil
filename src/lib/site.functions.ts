import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const getSiteContent = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const [settings, vehicles, images, tours, services, faqs, testimonials] = await Promise.all([
    sb.from("business_settings").select("*").limit(1).maybeSingle(),
    sb.from("vehicles").select("*").eq("is_active", true).order("sort_order").order("created_at"),
    sb.from("vehicle_images").select("id, vehicle_id, image_url, sort_order").order("sort_order"),
    sb.from("tour_packages").select("*").eq("is_active", true).order("sort_order").order("created_at"),
    sb.from("services").select("*").eq("is_active", true).order("sort_order"),
    sb.from("faqs").select("*").eq("is_active", true).order("sort_order"),
    sb.from("testimonials").select("*").eq("is_active", true).order("sort_order").order("created_at"),
  ]);
  const firstError = [settings, vehicles, images, tours, services, faqs, testimonials].find((r) => r.error)?.error;
  if (firstError) {
    console.error("getSiteContent", firstError);
    throw new Error("Konten website gagal dimuat");
  }

  // Resolve storage paths to signed URLs. The bucket is private with no public
  // read policy, so signed URLs are minted with the privileged server client.
  const paths = new Set<string>();
  const collect = (p: string | null | undefined) => {
    if (p && !/^https?:\/\//.test(p)) paths.add(p);
  };
  vehicles.data!.forEach((v) => collect(v.image_url));
  images.data!.forEach((i) => collect(i.image_url));
  tours.data!.forEach((t) => collect(t.image_url));
  testimonials.data!.forEach((t) => collect(t.avatar_url));
  collect(settings.data?.logo_url);
  const urlMap = new Map<string, string>();
  if (paths.size) {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.storage.from("media").createSignedUrls([...paths], 60 * 60 * 24 * 7);
    data?.forEach((d) => d.path && d.signedUrl && urlMap.set(d.path, d.signedUrl));
  }
  const resolve = (p: string | null | undefined) =>
    !p ? null : /^https?:\/\//.test(p) ? p : (urlMap.get(p) ?? null);

  return {
    settings: settings.data ? { ...settings.data, logo_url: resolve(settings.data.logo_url) } : null,
    vehicles: vehicles.data!.map((v) => ({
      ...v,
      image_url: resolve(v.image_url),
      gallery: images.data!
        .filter((i) => i.vehicle_id === v.id)
        .map((i) => resolve(i.image_url))
        .filter((u): u is string => !!u),
    })),
    tours: tours.data!.map((t) => ({ ...t, image_url: resolve(t.image_url) })),
    services: services.data!,
    faqs: faqs.data!,
    testimonials: testimonials.data!.map((t) => ({ ...t, avatar_url: resolve(t.avatar_url) })),
  };
});
