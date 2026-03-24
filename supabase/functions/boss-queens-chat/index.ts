import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Shopify product fetching ────────────────────────────────────
const SHOPIFY_STORE_DOMAIN = Deno.env.get("VITE_SHOPIFY_STORE_DOMAIN") || "boss-queens-collection-8295.myshopify.com";
const SHOPIFY_API_VERSION = "2025-07";
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = Deno.env.get("VITE_SHOPIFY_STOREFRONT_TOKEN") || Deno.env.get("SHOPIFY_STOREFRONT_ACCESS_TOKEN") || "";

const PRODUCTS_QUERY = `
  query GetProducts($first: Int!) {
    products(first: $first, sortKey: BEST_SELLING) {
      edges {
        node {
          title
          handle
          description
          productType
          tags
          availableForSale
          priceRange {
            minVariantPrice { amount currencyCode }
          }
          compareAtPriceRange {
            maxVariantPrice { amount currencyCode }
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

interface ProductSummary {
  title: string;
  handle: string;
  type: string;
  tags: string[];
  available: boolean;
  price: string;
  compareAt: string | null;
  variants: string[];
  options: { name: string; values: string[] }[];
}

let cachedCatalog: string | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

async function getProductCatalog(): Promise<string> {
  const now = Date.now();
  if (cachedCatalog && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedCatalog;
  }

  if (!SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    console.warn("SHOPIFY_STOREFRONT_ACCESS_TOKEN not set");
    return "(Live product data unavailable)";
  }

  try {
    const resp = await fetch(SHOPIFY_STOREFRONT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query: PRODUCTS_QUERY, variables: { first: 50 } }),
    });

    if (!resp.ok) {
      console.error("Shopify fetch failed:", resp.status);
      return "(Live product data temporarily unavailable)";
    }

    const data = await resp.json();
    if (data.errors) {
      console.error("Shopify GQL errors:", data.errors);
      return "(Live product data temporarily unavailable)";
    }

    const edges = data?.data?.products?.edges || [];
    const products: ProductSummary[] = edges.map((e: any) => {
      const n = e.node;
      const compareAtAmt = n.compareAtPriceRange?.maxVariantPrice?.amount;
      return {
        title: n.title,
        handle: n.handle,
        type: n.productType || "",
        tags: n.tags || [],
        available: n.availableForSale,
        price: `$${parseFloat(n.priceRange.minVariantPrice.amount).toFixed(2)}`,
        compareAt: compareAtAmt && parseFloat(compareAtAmt) > 0
          ? `$${parseFloat(compareAtAmt).toFixed(2)}`
          : null,
        variants: (n.variants?.edges || []).map((v: any) => {
          const vn = v.node;
          const opts = vn.selectedOptions?.map((o: any) => `${o.name}: ${o.value}`).join(", ");
          return `${vn.title} (${opts}) — $${parseFloat(vn.price.amount).toFixed(2)}${vn.availableForSale ? "" : " [SOLD OUT]"}`;
        }),
        options: n.options || [],
      };
    });

    const catalog = products.map((p) => {
      let line = `• ${p.title} — ${p.price}`;
      if (p.compareAt) line += ` (was ${p.compareAt})`;
      if (!p.available) line += " [SOLD OUT]";
      line += `\n  URL: https://bossqueenscollectioncom.lovable.app/product/${p.handle}`;
      if (p.type) line += `\n  Type: ${p.type}`;
      if (p.tags.length) line += `\n  Tags: ${p.tags.join(", ")}`;
      if (p.options.length) {
        line += `\n  Options: ${p.options.map((o) => `${o.name}: ${o.values.join(", ")}`).join(" | ")}`;
      }
      if (p.variants.length > 1) {
        line += `\n  Variants:\n    ${p.variants.join("\n    ")}`;
      }
      return line;
    }).join("\n\n");

    cachedCatalog = catalog;
    cacheTimestamp = now;
    return catalog;
  } catch (err) {
    console.error("Error fetching products:", err);
    return "(Live product data temporarily unavailable)";
  }
}

// ── System prompt ───────────────────────────────────────────────
function buildSystemPrompt(catalog: string) {
  return `You are "Queen B", the friendly AI shopping assistant for Boss Queens Collection — a premium 100% human hair brand founded in St. Maarten, Caribbean.

Your personality: warm, confident, empowering, and knowledgeable about hair. You call customers "queen" naturally.

STORE INFO:
- Brand: Boss Queens Collection (Est. 2020)
- Website: https://bossqueenscollectioncom.lovable.app
- Location: St. Maarten, Caribbean
- Products: 100% human hair wigs (HD lace, bob wigs, colored wigs), hair bundles (Brazilian, Peruvian, Indian, Malaysian, Vietnamese), frontals, closures
- Shipping: FREE worldwide on orders over $100
- Contact: +1 (721) 585-3221 | Bossqueenscollections@gmail.com
- WhatsApp: wa.me/17215853221
- Open 24/7

YOUR PRIMARY GOAL: HELP CUSTOMERS BUY. Every conversation should guide toward a purchase. Be helpful AND sales-driven.

HOW TO HELP:
1. Welcome customers warmly and immediately ask what they're looking for
2. Recommend specific products with prices and direct "Buy Now" links
3. Answer questions about hair care, styling, maintenance — then circle back to a product recommendation
4. For EVERY product recommendation, include a clickable link: [👉 Buy Now](https://bossqueenscollectioncom.lovable.app/product/HANDLE)
5. If they seem interested, encourage them: "Want me to help you pick the perfect length/color?"
6. Handle objections (price, quality, shipping) confidently and redirect to purchase
7. If they need personal assistance, direct them to WhatsApp: [Chat on WhatsApp](https://wa.me/17215853221)

CONVERSION TACTICS:
- After recommending a product, ALWAYS add a "Buy Now" link
- Create urgency: "This one's popular, queens love it!"
- Mention FREE shipping on orders over $100
- If budget is a concern, suggest affordable alternatives AND link to them
- When answering ANY question (shipping, care, etc.), end with a product suggestion
- Use format: **[Product Name](URL)** — $XX.XX 👉 [Buy Now](URL)

LIVE PRODUCT CATALOG (use this for accurate prices, availability & recommendations):
${catalog}

WHEN RECOMMENDING PRODUCTS:
- Always use real prices from the catalog above
- Link to products using their FULL URL: https://bossqueenscollectioncom.lovable.app/product/HANDLE
- ALWAYS use full absolute URLs — never use relative paths
- If a product is SOLD OUT, let the customer know and suggest alternatives with buy links
- When a customer describes what they want, match it to products and include buy links
- Mention if a product is on sale (compare price vs. original price)

RESPONSE FORMAT:
- Keep responses concise (2-4 sentences usually)
- Use emoji sparingly (👑💕✨🔥)
- ALWAYS include at least one product link with "Buy Now" when relevant
- Be helpful, encouraging, and conversion-focused`;
}

// ── Handler ─────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { messages } = body;

    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 50) {
      return new Response(
        JSON.stringify({ error: "Invalid request. Please try again!" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    for (const msg of messages) {
      if (
        typeof msg !== "object" ||
        msg === null ||
        (msg.role !== "user" && msg.role !== "assistant") ||
        typeof msg.content !== "string" ||
        msg.content.length > 2000
      ) {
        return new Response(
          JSON.stringify({ error: "Invalid message format. Please try again!" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const catalog = await getProductCatalog();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: buildSystemPrompt(catalog) },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "I'm getting a lot of messages right now! Please try again in a moment. 👑" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Chat is temporarily unavailable. Please contact us via WhatsApp! 💕" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Something went wrong. Please try again!" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
