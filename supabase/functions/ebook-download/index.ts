import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SHOPIFY_STORE_DOMAIN =
  Deno.env.get("VITE_SHOPIFY_STORE_DOMAIN") ||
  "boss-queens-collection-8295.myshopify.com";
const SHOPIFY_API_VERSION = "2025-07";
const ADMIN_URL = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;
const ADMIN_TOKEN =
  Deno.env.get("SHOPIFY_ADMIN_ACCESS_TOKEN") ||
  Deno.env.get("SHOPIFY_ACCESS_TOKEN") ||
  "";

const EBOOK_FILE_PATH = "boss-queens-playbook.pdf";
const EBOOK_BUCKET = "ebooks";
const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour

// Heuristics to detect the ebook line item
const EBOOK_KEYWORDS = ["ebook", "playbook", "digital", "million-dollar"];

function isEbookLineItem(title: string, productType: string, tags: string[]): boolean {
  const hay = `${title || ""} ${productType || ""} ${(tags || []).join(" ")}`.toLowerCase();
  return EBOOK_KEYWORDS.some((k) => hay.includes(k));
}

async function adminGql<T = any>(query: string, variables: any = {}): Promise<T> {
  const r = await fetch(ADMIN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": ADMIN_TOKEN },
    body: JSON.stringify({ query, variables }),
  });
  const json = await r.json();
  if (!r.ok || json.errors) {
    throw new Error(`Shopify Admin error ${r.status}: ${JSON.stringify(json.errors || json)}`);
  }
  return json.data as T;
}

async function findOrder(orderNumber: string, email: string) {
  // strip leading # and spaces
  const cleanNumber = orderNumber.replace(/^#/, "").trim();
  const query = `name:#${cleanNumber} email:${email}`;
  const data = await adminGql<{
    orders: {
      edges: { node: {
        id: string; name: string; email: string;
        lineItems: { edges: { node: { title: string; product: { productType: string; tags: string[] } | null } }[] };
      } }[];
    };
  }>(
    `query($q: String!) {
      orders(first: 5, query: $q) {
        edges { node {
          id name email
          lineItems(first: 50) {
            edges { node { title product { productType tags } } }
          }
        } }
      }
    }`,
    { q: query }
  );
  return data.orders.edges.map((e) => e.node);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { orderNumber, email } = await req.json();
    if (!orderNumber || !email) {
      return new Response(JSON.stringify({ error: "Order number and email are required." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const cleanEmail = String(email).trim().toLowerCase();

    if (!ADMIN_TOKEN) {
      return new Response(JSON.stringify({ error: "Server not configured." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const orders = await findOrder(String(orderNumber), cleanEmail);
    const order = orders.find((o) => (o.email || "").toLowerCase() === cleanEmail);

    if (!order) {
      return new Response(JSON.stringify({
        error: "We couldn't find an order matching that number and email. Double-check your confirmation email.",
      }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const hasEbook = order.lineItems.edges.some(({ node }) =>
      isEbookLineItem(node.title, node.product?.productType || "", node.product?.tags || [])
    );

    if (!hasEbook) {
      return new Response(JSON.stringify({
        error: "This order doesn't include the ebook. If you believe this is wrong, contact support.",
      }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: signed, error } = await supabase
      .storage.from(EBOOK_BUCKET)
      .createSignedUrl(EBOOK_FILE_PATH, SIGNED_URL_TTL_SECONDS, { download: "Boss-Queens-Playbook.pdf" });

    if (error || !signed) {
      return new Response(JSON.stringify({
        error: "Ebook file is not available yet. Please contact support and we'll send it directly.",
      }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({
      downloadUrl: signed.signedUrl,
      expiresInSeconds: SIGNED_URL_TTL_SECONDS,
      orderName: order.name,
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("ebook-download error", e);
    return new Response(JSON.stringify({ error: "Something went wrong. Please try again or contact support." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});