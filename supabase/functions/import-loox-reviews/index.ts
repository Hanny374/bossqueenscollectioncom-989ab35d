import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LooxReview {
  id?: string | number;
  review_id?: string | number;
  product_id?: string | number;
  product_handle?: string;
  product_title?: string;
  title?: string;
  body?: string;
  text?: string;
  rating?: number;
  author?: string;
  reviewer_name?: string;
  customer_name?: string;
  created_at?: string;
  review_date?: string;
  photos?: Array<string | { url?: string; thumbnail?: string }>;
  images?: Array<string | { url?: string }>;
  verified?: boolean;
  is_verified?: boolean;
}

function pickPhotos(r: LooxReview): string[] {
  const arr = r.photos || r.images || [];
  return arr
    .map((p: any) => (typeof p === "string" ? p : p?.url || p?.thumbnail || ""))
    .filter(Boolean);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("LOOX_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "LOOX_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Fetch all Shopify product handles+titles from product_embeddings
    const { data: products, error: prodErr } = await supabase
      .from("product_embeddings")
      .select("shopify_handle, shopify_id, title");
    if (prodErr) throw prodErr;
    const productMap = new Map<string, { handle: string; title: string }>();
    for (const p of products || []) {
      if (p.shopify_handle) productMap.set(p.shopify_handle, { handle: p.shopify_handle, title: p.title });
      if (p.shopify_id) {
        // strip gid prefix
        const numericId = String(p.shopify_id).split("/").pop()!;
        productMap.set(numericId, { handle: p.shopify_handle, title: p.title });
      }
    }

    let totalFetched = 0;
    let totalInserted = 0;
    let page = 1;
    const maxPages = 50;

    while (page <= maxPages) {
      const url = `https://loox.io/api/v1/reviews?page=${page}&per_page=100&rating=5`;
      const resp = await fetch(url, {
        headers: { "X-Api-Secret": apiKey, Accept: "application/json" },
      });
      if (!resp.ok) {
        const txt = await resp.text();
        return new Response(JSON.stringify({ error: `Loox API ${resp.status}: ${txt}`, page }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const json = await resp.json();
      const items: LooxReview[] = Array.isArray(json) ? json : json.reviews || json.data || [];
      if (!items.length) break;
      totalFetched += items.length;

      const rows = items
        .filter((r) => (r.rating ?? 0) >= 5)
        .map((r) => {
          const key = r.product_handle || String(r.product_id ?? "");
          const match = productMap.get(key) || (r.product_handle ? productMap.get(r.product_handle) : undefined);
          if (!match) return null;
          const body = r.body || r.text || "";
          if (!body.trim()) return null;
          return {
            source: "loox",
            source_id: String(r.id ?? r.review_id ?? `${match.handle}-${r.author}-${r.created_at}`),
            product_handle: match.handle,
            product_title: match.title,
            rating: r.rating ?? 5,
            title: r.title || null,
            body,
            reviewer_name: r.author || r.reviewer_name || r.customer_name || "Verified Buyer",
            photos: pickPhotos(r),
            review_date: r.review_date || r.created_at || null,
            is_verified_purchase: r.verified ?? r.is_verified ?? true,
            status: "approved",
          };
        })
        .filter(Boolean);

      if (rows.length) {
        const { error: upErr, count } = await supabase
          .from("reviews")
          .upsert(rows as any, { onConflict: "source_id", count: "exact", ignoreDuplicates: false });
        if (upErr) {
          return new Response(JSON.stringify({ error: upErr.message, rows: rows.length }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        totalInserted += count ?? rows.length;
      }

      if (items.length < 100) break;
      page++;
    }

    return new Response(
      JSON.stringify({ success: true, fetched: totalFetched, imported: totalInserted, pages: page }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});