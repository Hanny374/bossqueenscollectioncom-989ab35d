import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function generateEmbedding(text: string): Promise<number[]> {
  const session = new Supabase.ai.Session("gte-small");
  const output = await session.run(text, { mean_pool: true, normalize: true });
  return Array.from(output);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.split("/").pop();

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // GET /ai-shopping-api — returns OpenAPI schema
    if (req.method === "GET" && (!path || path === "ai-shopping-api")) {
      const schema = {
        openapi: "3.1.0",
        info: {
          title: "Boss Queens Collection AI Shopping API",
          description: "Search and browse premium hair products from Boss Queens Collection. Use this API to find wigs, bundles, frontals, and hair accessories by natural language queries or browse the full catalog.",
          version: "1.0.0",
        },
        servers: [{ url: `${SUPABASE_URL}/functions/v1/ai-shopping-api` }],
        paths: {
          "/products": {
            get: {
              operationId: "listProducts",
              summary: "List all available products",
              parameters: [
                { name: "limit", in: "query", schema: { type: "integer", default: 20 }, description: "Max products to return" },
                { name: "type", in: "query", schema: { type: "string" }, description: "Filter by product type (e.g. Wig, Bundles, Frontal)" },
              ],
              responses: { "200": { description: "List of products" } },
            },
          },
          "/search": {
            post: {
              operationId: "searchProducts",
              summary: "Semantic search for products using natural language",
              requestBody: {
                required: true,
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        query: { type: "string", description: "Natural language search query" },
                        limit: { type: "integer", default: 5 },
                      },
                      required: ["query"],
                    },
                  },
                },
              },
              responses: { "200": { description: "Semantically matched products" } },
            },
          },
        },
      };

      return new Response(JSON.stringify(schema, null, 2), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /products — list catalog
    if (req.method === "GET" && path === "products") {
      const limit = parseInt(url.searchParams.get("limit") || "20");
      const type = url.searchParams.get("type");

      let query = supabase
        .from("product_embeddings")
        .select("shopify_handle, title, description, product_type, tags, price, compare_at_price, available_for_sale, variants, options, image_url")
        .eq("available_for_sale", true)
        .limit(Math.min(limit, 50));

      if (type) {
        query = query.ilike("product_type", `%${type}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return new Response(
        JSON.stringify({
          store: "Boss Queens Collection",
          website: "https://bossqueenscollection.com",
          currency: "USD",
          products: (data || []).map((p: any) => ({
            handle: p.shopify_handle,
            url: `https://bossqueenscollection.com/product/${p.shopify_handle}`,
            title: p.title,
            description: p.description,
            type: p.product_type,
            tags: p.tags,
            price: p.price,
            compareAtPrice: p.compare_at_price,
            inStock: p.available_for_sale,
            image: p.image_url,
            variants: p.variants,
            options: p.options,
          })),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST /search — semantic search
    if (req.method === "POST" && path === "search") {
      const { query: q, limit = 5 } = await req.json();
      if (!q) {
        return new Response(JSON.stringify({ error: "query is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const embedding = await generateEmbedding(q.trim());
      const { data, error } = await supabase.rpc("search_products", {
        query_embedding: embedding,
        match_threshold: 0.25,
        match_count: Math.min(limit, 20),
      });

      if (error) throw error;

      // Fetch image URLs for search results
      const handles = (data || []).map((p: any) => p.shopify_handle);
      const { data: imageData } = handles.length > 0
        ? await supabase.from("product_embeddings").select("shopify_handle, image_url").in("shopify_handle", handles)
        : { data: [] };
      const imageMap = new Map((imageData || []).map((r: any) => [r.shopify_handle, r.image_url]));

      return new Response(
        JSON.stringify({
          store: "Boss Queens Collection",
          query: q,
          results: (data || []).map((p: any) => ({
            handle: p.shopify_handle,
            url: `https://bossqueenscollection.com/product/${p.shopify_handle}`,
            title: p.title,
            description: p.description,
            type: p.product_type,
            price: p.price,
            compareAtPrice: p.compare_at_price,
            inStock: p.available_for_sale,
            image: imageMap.get(p.shopify_handle) || null,
            similarity: Math.round(p.similarity * 100),
          })),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Not found. Use GET / for API schema, GET /products for catalog, POST /search for semantic search." }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("AI Shopping API error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
