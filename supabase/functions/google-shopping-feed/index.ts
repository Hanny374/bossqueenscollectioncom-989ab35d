import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SHOPIFY_STORE_DOMAIN = "boss-queens-collection-8295.myshopify.com";
const SHOPIFY_API_VERSION = "2025-07";
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const STORE_URL = "https://bossqueenscollection.com";

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
                id
                title
                price { amount currencyCode }
                compareAtPrice { amount currencyCode }
                availableForSale
              }
            }
          }
        }
      }
    }
  }
`;

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const token = Deno.env.get("SHOPIFY_STOREFRONT_ACCESS_TOKEN");
    if (!token) {
      return new Response("SHOPIFY_STOREFRONT_ACCESS_TOKEN not configured", { status: 500 });
    }

    const resp = await fetch(SHOPIFY_STOREFRONT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
      },
      body: JSON.stringify({ query: PRODUCTS_QUERY, variables: { first: 50 } }),
    });

    if (!resp.ok) {
      return new Response(`Shopify API error: ${resp.status}`, { status: 502 });
    }

    const data = await resp.json();
    const edges = data?.data?.products?.edges || [];

    let items = "";
    for (const edge of edges) {
      const p = edge.node;
      if (!p.availableForSale) continue;

      const image = p.images?.edges?.[0]?.node?.url || "";
      const price = parseFloat(p.priceRange.minVariantPrice.amount).toFixed(2);
      const currency = p.priceRange.minVariantPrice.currencyCode || "USD";
      const compareAt = p.compareAtPriceRange?.maxVariantPrice?.amount;
      const salePrice = compareAt && parseFloat(compareAt) > parseFloat(price)
        ? `<g:sale_price>${price} ${currency}</g:sale_price>\n`
        : "";
      const regularPrice = salePrice
        ? `${parseFloat(compareAt).toFixed(2)} ${currency}`
        : `${price} ${currency}`;

      // Map product type to Google category
      let googleCategory = "Health & Beauty > Hair Care > Wigs";
      if (p.productType?.toLowerCase().includes("bundle")) {
        googleCategory = "Health & Beauty > Hair Care > Hair Extensions";
      } else if (p.productType?.toLowerCase().includes("frontal") || p.productType?.toLowerCase().includes("closure")) {
        googleCategory = "Health & Beauty > Hair Care > Hair Pieces";
      } else if (p.productType?.toLowerCase().includes("accessor")) {
        googleCategory = "Health & Beauty > Hair Care > Hair Styling Tools";
      }

      items += `
    <item>
      <g:id>${escapeXml(p.id)}</g:id>
      <g:title>${escapeXml(p.title)}</g:title>
      <g:description>${escapeXml(p.description?.substring(0, 5000) || p.title)}</g:description>
      <g:link>${STORE_URL}/product/${escapeXml(p.handle)}</g:link>
      <g:image_link>${escapeXml(image)}</g:image_link>
      <g:availability>in_stock</g:availability>
      <g:price>${regularPrice}</g:price>
      ${salePrice}<g:brand>Boss Queens Collection</g:brand>
      <g:condition>new</g:condition>
      <g:product_type>${escapeXml(p.productType || "Hair")}</g:product_type>
      <g:google_product_category>${escapeXml(googleCategory)}</g:google_product_category>
      <g:shipping>
        <g:country>US</g:country>
        <g:service>Standard</g:service>
        <g:price>0 USD</g:price>
      </g:shipping>
      <g:custom_label_0>free-shipping-over-100</g:custom_label_0>
    </item>`;
    }

    const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Boss Queens Collection</title>
    <link>${STORE_URL}</link>
    <description>Premium 100% human hair wigs, bundles, frontals and accessories. Free worldwide shipping over $100.</description>
    ${items}
  </channel>
</rss>`;

    return new Response(feed, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (e) {
    console.error("Feed error:", e);
    return new Response(`Error: ${e instanceof Error ? e.message : "Unknown"}`, { status: 500 });
  }
});
