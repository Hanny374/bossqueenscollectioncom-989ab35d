import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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

async function adminGql<T = any>(query: string, variables: any = {}): Promise<T> {
  const r = await fetch(ADMIN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": ADMIN_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await r.json();
  if (!r.ok || json.errors) {
    throw new Error(`Shopify Admin error ${r.status}: ${JSON.stringify(json.errors || json)}`);
  }
  return json.data as T;
}

async function getOnlineStorePublicationId(): Promise<string | null> {
  const data = await adminGql<{ publications: { edges: { node: { id: string; name: string } }[] } }>(
    `query { publications(first: 25) { edges { node { id name } } } }`
  );
  const node = data.publications.edges.find(
    (e) => e.node.name.toLowerCase() === "online store"
  );
  return node?.node.id ?? null;
}

async function listUnpublishedProducts(publicationId: string): Promise<{ id: string; title: string }[]> {
  const results: { id: string; title: string }[] = [];
  let cursor: string | null = null;
  let hasNext = true;

  while (hasNext) {
    const data: any = await adminGql(
      `query($cursor: String, $pubId: ID!) {
        products(first: 50, after: $cursor, query: "status:active") {
          pageInfo { hasNextPage endCursor }
          edges {
            node {
              id
              title
              publishedOnPublication(publicationId: $pubId)
            }
          }
        }
      }`,
      { cursor, pubId: publicationId }
    );
    for (const e of data.products.edges) {
      if (!e.node.publishedOnPublication) {
        results.push({ id: e.node.id, title: e.node.title });
      }
    }
    hasNext = data.products.pageInfo.hasNextPage;
    cursor = data.products.pageInfo.endCursor;
  }
  return results;
}

async function publishProduct(productId: string, publicationId: string): Promise<boolean> {
  const data: any = await adminGql(
    `mutation($id: ID!, $input: [PublicationInput!]!) {
      publishablePublish(id: $id, input: $input) {
        userErrors { field message }
      }
    }`,
    { id: productId, input: [{ publicationId }] }
  );
  const errs = data?.publishablePublish?.userErrors || [];
  if (errs.length) {
    console.error("publish error", productId, errs);
    return false;
  }
  return true;
}

async function triggerEmbeddingsSync(): Promise<string> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  try {
    const r = await fetch(`${supabaseUrl}/functions/v1/sync-product-embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ trigger: "auto-sync-shopify" }),
    });
    return `embeddings sync: ${r.status}`;
  } catch (e) {
    return `embeddings sync error: ${(e as Error).message}`;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const report: any = {
    started_at: new Date().toISOString(),
    publication_id: null,
    unpublished_found: 0,
    published_now: [] as string[],
    failed: [] as string[],
    embeddings: "",
  };

  try {
    if (!ADMIN_TOKEN) throw new Error("Missing SHOPIFY_ADMIN_ACCESS_TOKEN / SHOPIFY_ACCESS_TOKEN");

    const pubId = await getOnlineStorePublicationId();
    if (!pubId) throw new Error("Online Store publication not found");
    report.publication_id = pubId;

    const unpublished = await listUnpublishedProducts(pubId);
    report.unpublished_found = unpublished.length;

    for (const p of unpublished) {
      const ok = await publishProduct(p.id, pubId);
      (ok ? report.published_now : report.failed).push(p.title);
    }

    // Always refresh embeddings (cheap; ensures Queen B + AI search know new products)
    if (unpublished.length > 0) {
      report.embeddings = await triggerEmbeddingsSync();
    } else {
      report.embeddings = "skipped (nothing new)";
    }

    return new Response(JSON.stringify({ ok: true, ...report }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("auto-sync-shopify error", e);
    return new Response(
      JSON.stringify({ ok: false, error: (e as Error).message, ...report }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});