import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SHOPIFY_STORE = 'boss-queens-collection-8295.myshopify.com';
const SHOPIFY_TOKEN = '0e942a6ba1a520b2bd97819256fe60c5';
const SITE_URL = 'https://bossqueenscollection.com';

const STATIC_PAGES = [
  { loc: '/', priority: '1.0', changefreq: 'daily' },
  { loc: '/about', priority: '0.7', changefreq: 'monthly' },
  { loc: '/contact', priority: '0.6', changefreq: 'monthly' },
  { loc: '/shipping', priority: '0.6', changefreq: 'monthly' },
  { loc: '/faq', priority: '0.6', changefreq: 'monthly' },
  { loc: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
];

Deno.serve(async () => {
  try {
    // Fetch product handles from Shopify
    const query = `{
      products(first: 250, sortKey: BEST_SELLING) {
        edges {
          node {
            handle
            updatedAt
          }
        }
      }
    }`;

    const res = await fetch(
      `https://${SHOPIFY_STORE}/api/2025-07/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': SHOPIFY_TOKEN,
        },
        body: JSON.stringify({ query }),
      }
    );

    const data = await res.json();
    const products = data?.data?.products?.edges || [];

    const today = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Static pages
    for (const page of STATIC_PAGES) {
      xml += `
  <url>
    <loc>${SITE_URL}${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    }

    // Product pages
    for (const { node } of products) {
      const lastmod = node.updatedAt ? node.updatedAt.split('T')[0] : today;
      xml += `
  <url>
    <loc>${SITE_URL}/product/${node.handle}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
    }

    xml += `
</urlset>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`, {
      headers: { 'Content-Type': 'application/xml' },
    });
  }
});
