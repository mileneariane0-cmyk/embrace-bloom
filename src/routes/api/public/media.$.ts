import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

// Serves files from the site media library (public site images, videos, logos).
export const Route = createFileRoute("/api/public/media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = (params as { _splat?: string })._splat ?? "";
        if (!/^[\w\-./]{1,300}$/.test(path) || path.includes("..")) return new Response("Not found", { status: 404 });
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
        const client = createClient(process.env["SUPABASE_URL"]!, key, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: { fetch: (input, init) => {
            const h = new Headers(init?.headers);
            if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
            h.set("apikey", key);
            return fetch(input, { ...init, headers: h });
          } },
        });
        const { data, error } = await client.storage.from("site-media").download(path);
        if (error || !data) return new Response("Not found", { status: 404 });
        return new Response(data, { headers: { "content-type": data.type || "application/octet-stream", "cache-control": "public, max-age=3600" } });
      },
    },
  },
});
