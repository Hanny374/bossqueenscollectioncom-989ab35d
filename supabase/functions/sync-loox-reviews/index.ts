import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const LOOX_API_KEY = Deno.env.get("LOOX_API_KEY")!;
const SHOP_DOMAIN = Deno.env.get("VITE_SHOPIFY_STORE_DOMAIN") || "boss-queens-collection-8295.myshopify.com";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_KEY);

interface LooxReview {
  id?: string | number;
  rating?: number;
  title?: string;
  text?: string;
  body?: string;
  author?: string;
  reviewer?: string;
  reviewer_name?: string;
  product_id?: string | number;
  product_handle?: string;
  product_title?: string;
  handle?: string;
  image_url?: string;
  image_urls?: string[];
  photos?: string[];
  created_at?: string;
  verified?: boolean;
  is_verified?: boolean;
}

async function fetchLooxPage(page: number): Promise<LooxReview[]> {
  // Loox public reviews API (key auth via query param)
  const url = new URL("https://loox.io/api/v1/reviews");
  url.searchParams.set("key", LOOX_API_KEY);
  url.searchParams.set("shop", SHOP_DOMAIN);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", "100");

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${LOOX_API_KEY}`,
      "X-Loox-Api-Key": LOOX_API_KEY,
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Loox API ${res.status}: ${text.slice(0, 500)}`);
  }
  const json = await res.json();
  if (Array.isArray(json)) return json;
  if (Array.isArray(json.reviews)) return json.reviews;
  if (Array.isArray(json.data)) return json.data;
  return [];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (!LOOX_API_KEY) throw new Error("LOOX_API_KEY not set");

    let imported = 0;
    let skipped = 0;
    let pages = 0;
    const errors: string[] = [];

    for (let page = 1; page <= 50; page++) {
      const batch = await fetchLooxPage(page);
      pages++;
      if (!batch || batch.length === 0) break;

      for (const r of batch) {
        const sourceId = String(r.id ?? "");
        if (!sourceId) { skipped++; continue; }

        const rating = Math.max(1, Math.min(5, Math.round(Number(r.rating) || 5)));
        const body = (r.text || r.body || "").trim();
        if (!body) { skipped++; continue; }

        const handle = r.product_handle || r.handle || "";
        const productTitle = r.product_title || "Product";
        const photos = r.image_urls || r.photos || (r.image_url ? [r.image_url] : []);

        const row = {
          source: "loox",
          source_id: sourceId,
          user_id: null as string | null,
          product_handle: handle || `unknown-${r.product_id ?? ""}`,
          product_title: productTitle,
          rating,
          title: r.title || null,
          body,
          photos,
          is_verified_purchase: Boolean(r.verified ?? r.is_verified ?? true),
          status: "approved",
          reviewer_name: r.author || r.reviewer || r.reviewer_name || "Verified Buyer",
          review_date: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        };

        const { error } = await admin
          .from("reviews")
          .upsert(row, { onConflict: "source,source_id" });

        if (error) {
          errors.push(`${sourceId}: ${error.message}`);
        } else {
          imported++;
        }
      }

      if (batch.length < 100) break;
    }

    return new Response(
      JSON.stringify({ ok: true, imported, skipped, pages, errors: errors.slice(0, 10) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});