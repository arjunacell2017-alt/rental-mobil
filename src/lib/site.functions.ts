import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Server-side env resolution. Runtime vars (Netlify Functions / Workers) win;
// the VITE_* values are public (URL + publishable key) and inlined at build time,
// so they are a safe fallback. The service role key is NEVER read from VITE_*.
function readPublicConfig() {
  const url = process.env["SUPABASE_URL"] || import.meta.env["VITE_SUPABASE_URL"];
  const key =
    process.env["SUPABASE_PUBLISHABLE_KEY"] || import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
  const missing = [
    ...(!url ? ["SUPABASE_URL (atau VITE_SUPABASE_URL saat build)"] : []),
    ...(!key ? ["SUPABASE_PUBLISHABLE_KEY (atau VITE_SUPABASE_PUBLISHABLE_KEY saat build)"] : []),
  ];
  if (missing.length) {
    const err = new Error(`Konfigurasi server belum lengkap: ${missing.join(", ")}`);
    console.error("[site-content]", err);
    throw err;
  }
  return { url: url as string, key: key as string };
}

function publicClient() {
  const { url, key } = readPublicConfig();
  return createClient<Database>(url, key, {
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
    sb.from("vehicles").select("id, name, slug, image_url, price_per_day, capacity, transmission, year, with_driver, self_drive, description, is_active, sort_order, vehicle_status, created_at, updated_at").eq("is_active", true).order("sort_order").order("created_at"),
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

  // Storage bucket is private; signed URLs need the service role key, which only
  // exists server-side. If it is missing (e.g. external host), text data still
  // loads and images fall back — with an explicit log instead of a page crash.
  const paths = new Set<string>();
  const collect = (p: string | null | undefined) => {
    if (p && !/^https?:\/\//.test(p)) paths.add(p);
  };
  vehicles.data!.forEach((v) => collect(v.image_url));
  images.data!.forEach((i) => collect(i.image_url));
  tours.data!.forEach((t) => collect(t.image_url));
  testimonials.data!.forEach((t) => collect(t.avatar_url));
  collect(settings.data?.logo_url);
  collect(settings.data?.hero_image_url);
  const urlMap = new Map<string, string>();
  if (paths.size) {
    // Site photo folders are readable via a narrow storage policy, so the public
    // client can sign them on any host (Netlify included). Admin client is only
    // used when available as a secondary path.
    try {
      let { data, error } = await sb.storage.from("media").createSignedUrls([...paths], 60 * 60 * 24 * 7);
      if ((error || !data?.some((d) => d.signedUrl)) && process.env["SUPABASE_SERVICE_ROLE_KEY"]) {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        ({ data, error } = await supabaseAdmin.storage.from("media").createSignedUrls([...paths], 60 * 60 * 24 * 7));
      }
      if (error) console.error("[site-content] signed URL gagal", error);
      data?.forEach((d) => d.path && d.signedUrl && urlMap.set(d.path, d.signedUrl));
    } catch (e) {
      console.error("[site-content] signed URL gagal", e);
    }
  }
  const resolve = (p: string | null | undefined) =>
    !p ? null : /^https?:\/\//.test(p) ? p : (urlMap.get(p) ?? null);

  return {
    settings: settings.data ? { ...settings.data, logo_url: resolve(settings.data.logo_url), hero_image_url: resolve(settings.data.hero_image_url) } : null,
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
