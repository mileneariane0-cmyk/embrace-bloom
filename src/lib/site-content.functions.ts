import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { withDefaults } from "./site-content";

/** Public: published site content (falls back to defaults if the database is unavailable). */
export const getPublishedContent = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const client = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      } },
    });
    const { data } = await client.from("site_content").select("content").eq("id", "published").maybeSingle();
    return withDefaults(data?.content ?? null);
  } catch (e) {
    console.error("site content unavailable", e);
    return withDefaults(null);
  }
});
