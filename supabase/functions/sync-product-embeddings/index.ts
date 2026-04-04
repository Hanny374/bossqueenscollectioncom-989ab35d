import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Shopify config
const SHOPIFY_STORE_DOMAIN = Deno.env.get("VITE_SHOPIFY_STORE_DOMAIN") || "boss-queens-collection-8295.myshopify.com";
const SHOPIFY_API_VERSION = "2025-07";
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

const PRODUCTS_QUERY = `
  query GetProducts($first: Int!) {
    products(first: $first, sortKey: BEST_SELLING) {
      edges {
        node {
          id
          title
          description
          handle
          productType
          tags
          availableForSale
          priceRange {
            minVariantPrice { amount currencyCode }
          }
          compareAtPriceRange {
            maxVariantPrice { amount currencyCode }
          }
          images(first: 1) {
            edges {
              node { url altText }
            }
          }
          variants(first: 20) {
            edges {
              node {
                title
                price { amount currencyCode }
                compareAtPrice { amount currencyCode }
                availableForSale
                selectedOptions { name value }
              }
            }
          }
          options { name values }
        }
      }
    }
  }
`;

function buildEmbeddingText(product: any): string {
  const parts: string[] = [];
  parts.push(`Product: ${product.title}`);
  if (product.productType) parts.push(`Category: ${product.productType}`);
  if (product.description) parts.push(`Description: ${product.description}`);
  if (product.tags?.length) parts.push(`Tags: ${product.tags.join(", ")}`);
  const price = product.priceRange?.minVariantPrice?.amount;
  if (price) parts.push(`Price: $${parseFloat(price).toFixed(2)}`);
  const options = product.options || [];
  for (const opt of options) {
    parts.push(`${opt.name}: ${opt.values.join(", ")}`);
  }
  return parts.join(". ");
}

async function generateEmbedding(text: string): Promise<number[]> {
  const session = new Supabase.ai.Session("gte-small");
  const output = await session.run(text, {
    mean_pool: true,
    normalize: true,
  });
  return Array.from(output);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse optional batch params
    const body = await req.json().catch(() => ({}));
    const batchSize = body.batch_size || 5;
    const batchOffset = body.batch_offset || 0;

    const SHOPIFY_TOKEN = Deno.env.get("SHOPIFY_STOREFRONT_ACCESS_TOKEN") || "0e942a6ba1a520b2bd97819256fe60c5";
    if (!SHOPIFY_TOKEN) throw new Error("SHOPIFY_STOREFRONT_ACCESS_TOKEN not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch all products from Shopify
    console.log("Fetching products from Shopify...");
    const shopifyResp = await fetch(SHOPIFY_STOREFRONT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_TOKEN,
      },
      body: JSON.stringify({ query: PRODUCTS_QUERY, variables: { first: 50 } }),
    });

    if (!shopifyResp.ok) throw new Error(`Shopify API error: ${shopifyResp.status}`);

    const shopifyData = await shopifyResp.json();
    if (shopifyData.errors) throw new Error(`Shopify GQL errors: ${JSON.stringify(shopifyData.errors)}`);

    const allEdges = shopifyData?.data?.products?.edges || [];
    const batch = allEdges.slice(batchOffset, batchOffset + batchSize);
    console.log(`Processing batch: offset=${batchOffset}, size=${batch.length}, total=${allEdges.length}`);

    let processed = 0;
    let errors = 0;

    for (const edge of batch) {
      const product = edge.node;
      try {
        const embeddingText = buildEmbeddingText(product);
        console.log(`Generating embedding for: ${product.title}`);
        
        const embedding = await generateEmbedding(embeddingText);

        const price = product.priceRange?.minVariantPrice?.amount;
        const compareAt = product.compareAtPriceRange?.maxVariantPrice?.amount;

        const imageUrl = product.images?.edges?.[0]?.node?.url || null;

        const row = {
          shopify_handle: product.handle,
          shopify_id: product.id,
          title: product.title,
          description: product.description || null,
          product_type: product.productType || null,
          tags: product.tags || [],
          price: price ? parseFloat(price) : null,
          compare_at_price: compareAt && parseFloat(compareAt) > 0 ? parseFloat(compareAt) : null,
          available_for_sale: product.availableForSale,
          variants: (product.variants?.edges || []).map((v: any) => v.node),
          options: product.options || [],
          image_url: imageUrl,
          embedding_text: embeddingText,
          embedding: embedding,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from("product_embeddings")
          .upsert(row, { onConflict: "shopify_handle" });

        if (error) {
          console.error(`DB error for ${product.handle}:`, error);
          errors++;
        } else {
          processed++;
        }
      } catch (err) {
        console.error(`Error processing ${product.handle}:`, err);
        errors++;
      }
    }

    const hasMore = batchOffset + batchSize < allEdges.length;
    const nextOffset = hasMore ? batchOffset + batchSize : null;

    return new Response(
      JSON.stringify({
        success: true,
        total: allEdges.length,
        batch_offset: batchOffset,
        batch_processed: processed,
        batch_errors: errors,
        has_more: hasMore,
        next_offset: nextOffset,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("sync-embeddings error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
