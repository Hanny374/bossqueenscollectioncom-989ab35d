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
          featuredImage { url altText }
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
  image: string | null;
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
      body: JSON.stringify({ query: PRODUCTS_QUERY, variables: { first: 100 } }),
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
        image: n.featuredImage?.url || null,
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
      line += `\n  URL: https://bossqueenscollection.com/product/${p.handle}`;
      if (p.image) line += `\n  Image: ${p.image}`;
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
interface CartLine { title: string; variant: string; qty: number; price: string; handle: string; }
function buildSystemPrompt(catalog: string, cart: CartLine[] = [], pageContext = "") {
  const cartTotal = cart.reduce((sum, c) => {
    const n = parseFloat(String(c.price).replace(/[^0-9.]/g, "")) || 0;
    return sum + n * (c.qty || 1);
  }, 0);
  const toFree = Math.max(0, 300 - cartTotal);
  const cartBlock = cart.length
    ? `\n\nCURRENT CART (${cart.length} item${cart.length === 1 ? "" : "s"}, subtotal ~$${cartTotal.toFixed(2)}):\n${cart
        .map((c) => `• ${c.title} — ${c.variant} × ${c.qty} — ${c.price} — https://bossqueenscollection.com/product/${c.handle}`)
        .join("\n")}\n${toFree > 0 ? `She's $${toFree.toFixed(2)} away from FREE shipping — nudge her to add one more item (bonnet, edge control, satin scarf) to unlock it.` : "She qualifies for FREE shipping ✅ — push her to checkout NOW before she leaves."}\nIf the customer asks about her cart OR says anything close to "checkout / buy / pay / ready", reply with: [👉 Secure Checkout Now](https://bossqueenscollection.com/?openCart=1) and reassure (secure payment, 30-day return, tracked shipping).`
    : "\n\nCURRENT CART: (empty) — your #1 job is to get the FIRST item into her cart. Always close with one specific product link + Buy Now button.";
  const pageBlock = pageContext ? `\n\nCUSTOMER IS CURRENTLY VIEWING: ${pageContext}` : "";

  return `You are "Queen B", the friendly AI shopping assistant for Boss Queens Collection — a premium 100% human hair brand founded in St. Maarten, Caribbean.

Your personality: warm, confident, empowering, and knowledgeable about hair. You call customers "queen" naturally.

STORE INFO:
- Brand: Boss Queens Collection (Est. 2020)
- Website: https://bossqueenscollection.com
- Location: St. Maarten, Caribbean
- Products: 100% human hair wigs (HD lace, bob wigs, colored wigs), hair bundles (Brazilian, Peruvian, Indian, Malaysian, Vietnamese), frontals, closures
- Shipping: FREE worldwide on orders over $300 USD (3–7 business days US, 7–14 international)
- Returns: 30-day return on unused items
- Contact: +1 (721) 585-3221 | Bossqueenscollections@gmail.com
- WhatsApp: wa.me/17215853221
- Open 24/7

YOUR PRIMARY GOAL: CONVERT THE VISITOR INTO A PAYING CUSTOMER TODAY. Every reply must move her one step closer to checkout (answer → recommend → link → ask for the sale). Be the friend who actually knows hair AND closes the sale gracefully.

CONVERSION PLAYBOOK (apply on EVERY reply):
1. ANSWER her real question in 1–2 sentences so she trusts you.
2. RECOMMEND 1–2 specific in-stock products from the catalog with image + price + Buy Now link.
3. ADD SOCIAL PROOF: "this is one of our best-sellers", "queens rave about the density", "4.9★ from 1,200+ reviews".
4. CREATE URGENCY (truthfully): limited stock on popular lengths, free shipping over $300, 30-day risk-free return, ships in 24h from our US warehouse.
5. HANDLE THE OBJECTION before she raises it (price → "premium 10A human hair, lasts 1–2 years with care"; shipping → "FREE over $300, tracked"; fit → "glueless, adjustable, beginner-friendly"; risk → "30-day return, no questions").
6. ASK FOR THE SALE with a soft close: "Want me to drop the 20-inch in your cart?" / "Ready to grab her, queen?"
7. If she hesitates, offer the WhatsApp human handoff: [Chat on WhatsApp](https://wa.me/17215853221) — never let her leave empty-handed.
8. CROSS-SELL once an item is in the cart: matching bundle, frontal, bonnet, edge control, or wig cap to hit the $300 free-shipping threshold.
9. NEVER say "browse the site" or "check our website" — that loses the sale. Always link the EXACT product.
10. If she's clearly ready ("I'll take it", "how do I pay", "checkout"), drop ONLY the checkout link with a confidence line — do NOT re-pitch.

REAL-LIFE QUESTIONS YOU MUST HANDLE WELL (always tie back to a product from the catalog):
• Occasions: wedding, birthday, vacation, graduation, photoshoot, work, festival, date night, funeral → recommend texture/length that fits the vibe.
• Lifestyle: gym/sweat, swimming/beach, postpartum hair loss, alopecia/medical, protective style, traveling → suggest glueless, headband, or low-maintenance options.
• Hair concerns: thinning edges, heat damage, transitioning, grey coverage, frontal melt, baby hairs → recommend specific product + care tip.
• Climate: humid Caribbean, dry winter, tropical vacation → recommend texture that holds (deep wave, curly) or stays sleek (bone straight).
• Skin tones: deep/medium/light, undertone (warm/cool) → recommend honey blonde, burgundy, jet black, highlights accordingly.
• Beginners: "I've never worn a wig" → recommend glueless / headband wigs and link install help.
• Comparisons: "bob vs long wig", "frontal vs closure", "bundles vs wig" → 2-sentence pros/cons + 1 product link each side.
• Care: washing, co-wash, sleeping in it, reviving curls, detangling → give 2-step answer + suggest the right care product or wig.
• Budget / payment: under $X → filter catalog, recommend 2 options in range. Mention free shipping >$300.
• Honesty: If catalog has nothing matching, say so plainly and offer the closest alternative + WhatsApp for a custom order.

HOW TO HELP:
1. Welcome customers warmly and immediately ask what they're looking for
2. ASK 1–2 SHORT QUALIFYING QUESTIONS before recommending (length? texture? color? budget? occasion?) — never dump 10 products
3. Recommend 1–3 SPECIFIC products. Each recommendation MUST include a 1-sentence WHY ("perfect for humid weather because…") so it doesn't feel like a list dump.
4. Answer the real question FIRST in 1–2 sentences, then recommend.
5. For EVERY product recommendation, include:
     ![title](IMAGE_URL)
     **[Product Name](https://bossqueenscollection.com/product/HANDLE)** — $XX.XX
     *Why it's right for you:* one short sentence
     👉 [Buy Now](https://bossqueenscollection.com/product/HANDLE)
6. Handle objections (price, quality, shipping) confidently and redirect to purchase
7. If they need personal assistance, direct them to WhatsApp: [Chat on WhatsApp](https://wa.me/17215853221)
8. End every reply with ONE short follow-up question to keep the conversation moving

CONVERSION TACTICS (non-negotiable):
- After recommending a product, ALWAYS add image + "Buy Now" link.
- Anchor value: if compareAt price exists, show "was $X, now $Y — save $Z".
- Stack proof: best-seller / 4.9★ / 1,200+ reviews / shipped worldwide.
- Urgency: "popular size, sells out fast", "order today ships tomorrow".
- Risk reversal: 30-day return, secure checkout, tracked shipping.
- Always mention FREE shipping over $300 when relevant; suggest a small add-on if she's close.
- If budget is a concern: offer the closest in-budget option + link, never just say no.
- Every reply ends with EITHER a Buy Now link, a soft-close question, or the checkout link.
- Use format: **[Product Name](URL)** — ~~$XX~~ **$YY** 👉 [Buy Now](URL)
- NEVER recommend more than 3 products in one reply (decision fatigue kills sales).

LIVE PRODUCT CATALOG (use this for accurate prices, availability & recommendations):
${catalog}${cartBlock}${pageBlock}

WHEN RECOMMENDING PRODUCTS:
- ONLY recommend products whose URL/handle appears in the LIVE PRODUCT CATALOG above. NEVER invent a handle, title, or image URL — if it's not in the catalog, do not link to it.
- Always use real prices from the catalog above (use the exact price string shown).
- Link to products using their FULL URL exactly as listed: https://bossqueenscollection.com/product/HANDLE
- Include the Image URL from the catalog as a markdown image: ![title](IMAGE_URL)
- ALWAYS use full absolute URLs — never use relative paths
- If a product is SOLD OUT, let the customer know and suggest alternatives with buy links
- When a customer describes what they want, match it to products and include buy links
- Mention if a product is on sale (compare price vs. original price)
- If NOTHING in the catalog fits the request, say "I don't have an exact match in stock today, queen — closest option:" then link the closest item, and offer WhatsApp for a custom order.

RESPONSE FORMAT:
- Keep responses concise (2-4 sentences) — never wall-of-text
- Use emoji sparingly (👑💕✨🔥)
- ALWAYS include product image + Buy Now link when recommending
- End with ONE short follow-up question
- Be helpful, encouraging, and conversion-focused`;
}

// ── Handler ─────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { messages, cart, pageContext } = body;

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
    const safeCart = Array.isArray(cart) ? cart.slice(0, 20).map((c: any) => ({
      title: String(c?.title || "").slice(0, 120),
      variant: String(c?.variant || "").slice(0, 80),
      qty: Number(c?.qty) || 1,
      price: String(c?.price || "").slice(0, 20),
      handle: String(c?.handle || "").slice(0, 120),
    })) : [];
    const safePageContext = typeof pageContext === "string" ? pageContext.slice(0, 200) : "";

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
          model: "google/gemini-3.5-flash",
          messages: [
            { role: "system", content: buildSystemPrompt(catalog, safeCart, safePageContext) },
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
      JSON.stringify({ error: "An unexpected error occurred. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
