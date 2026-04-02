import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { useProducts, useNewestProducts } from "@/hooks/useProducts";
import { ShopifyProduct } from "@/lib/shopify";
import { useScrollToHash } from "@/hooks/useScrollToHash";
import { SEOHead } from "@/components/SEOHead";
import { motion } from "framer-motion";
import { Crown, Globe, Heart, ShieldCheck, Truck, Shield, Package, Flame, Sparkles, Camera, Instagram } from "lucide-react";
import { VisaLogo, MastercardLogo, AmexLogo, DiscoverLogo, PayPalLogo, ApplePayLogo, GooglePayLogo } from "@/components/PaymentLogos";

// Lazy load below-fold sections
const EasterBanner = lazy(() => import("@/components/EasterBanner").then(m => ({ default: m.EasterBanner })));
const Marquee = lazy(() => import("@/components/Marquee").then(m => ({ default: m.Marquee })));
const Categories = lazy(() => import("@/components/Categories").then(m => ({ default: m.Categories })));
const ProductGrid = lazy(() => import("@/components/ProductGrid").then(m => ({ default: m.ProductGrid })));
const Testimonials = lazy(() => import("@/components/Testimonials").then(m => ({ default: m.Testimonials })));
const HomeReviewsSection = lazy(() => import("@/components/HomeReviewsSection").then(m => ({ default: m.HomeReviewsSection })));
const TrustBar = lazy(() => import("@/components/TrustBar").then(m => ({ default: m.TrustBar })));
const Footer = lazy(() => import("@/components/Footer").then(m => ({ default: m.Footer })));

const CATEGORY_FILTERS = [
  { label: "All", value: "all" },
  { label: "Colored Wigs", value: "colored-wigs" },
  { label: "Bob Wigs", value: "bob-wigs" },
  { label: "Lace Front Wigs", value: "lace-front-wigs" },
  { label: "Headband Wigs", value: "headband-wigs" },
  { label: "V Part & Half Wigs", value: "v-part-half-wigs" },
  { label: "Boho Braids", value: "boho-braids" },
  { label: "Bundles", value: "bundles" },
  { label: "Accessories", value: "accessories" },
] as const;

// Map filter values to Shopify productType values
const CATEGORY_TYPE_MAP: Record<string, string[]> = {
  "colored-wigs": ["Colored Wigs"],
  "bob-wigs": ["Bob Wig"],
  "lace-front-wigs": [],
  "headband-wigs": ["Headband Wig"],
  "v-part-half-wigs": [],
  "boho-braids": [],
  "bundles": ["Hair Bundles", "Bundle Deals"],
  "accessories": ["Frontals", "Closures", "Accessories", "Dryer"],
};

function getCategoryFromHash(hash: string): string {
  const match = hash.match(/category=([^&]+)/);
  return match ? match[1] : "all";
}

const PRODUCTS_PER_PAGE = 20;

const Index = () => {
  // collection fix
  const { data: products = [], isLoading } = useProducts(500);
  const { data: newestProducts = [], isLoading: isLoadingNewest } = useNewestProducts(30);
  const location = useLocation();
  const navigate = useNavigate();

  const categoryFromUrl = getCategoryFromHash(location.hash);
  const [activeCategory, setActiveCategory] = useState(categoryFromUrl);
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);

  // Sync category from URL hash changes
  useEffect(() => {
    const cat = getCategoryFromHash(location.hash);
    setActiveCategory(cat);
  }, [location.hash]);

  useScrollToHash();

  // Top Sellers: mix of best-selling wigs AND bundles (products sorted by BEST_SELLING)
  const topSellers = useMemo(() => {
    const topWigs = products.filter((p) => {
      const title = (p.node.title || "").toLowerCase();
      const isWig = title.includes("wig") || title.includes("lace");
      const isAccessory = ["wig glue", "lace tint", "lace melting", "melting spray", "tint spray", "installation kit", "wig stand", "wig storage", "wig bag", "blowout brush", "styling tool", "wax stick", "edge brush", "glue remover", "hair glue", "adhesive"].some(k => title.includes(k));
      return isWig && !isAccessory;
    }).slice(0, 5);

    const topBundles = products.filter((p) => {
      const title = (p.node.title || "").toLowerCase();
      return (title.includes("bundle") || title.includes("hair weave") || title.includes("hair weft") || title.includes("hair extension"))
        && !title.includes("wig");
    }).slice(0, 3);

    return [...topWigs, ...topBundles].slice(0, 8);
  }, [products]);

  // Newly Added: curated mix of wigs, bobs, boho braids, bundles, and styling tools
  const newestBundles = useMemo(() => {
    const accessoryKeywords = ["wig glue", "lace tint", "lace melting", "melting spray", "tint spray", "installation kit", "wig stand", "wig storage", "wig bag", "glue remover", "hair glue", "adhesive", "walker tape", "wig cap", "melt band", "edge control"];
    const isAccessory = (t: string) => accessoryKeywords.some(k => t.includes(k));

    const categorize = (p: ShopifyProduct) => {
      const t = (p.node.title || "").toLowerCase();
      if (isAccessory(t)) return "accessory";
      if (t.includes("boho") || t.includes("braid") || t.includes("crochet")) return "boho";
      if (t.includes("bob") && (t.includes("wig") || t.includes("lace"))) return "bob";
      if (t.includes("bundle") || t.includes("hair weave") || t.includes("hair weft") || t.includes("hair extension")) return "bundles";
      if (t.includes("blowout") || t.includes("dryer") || t.includes("styling") || t.includes("brush") || t.includes("flat iron") || t.includes("curling")) return "tools";
      if (t.includes("wig") || t.includes("lace") || t.includes("frontal") || t.includes("glueless")) return "wig";
      return "other";
    };

    const source = newestProducts.length > 0 ? newestProducts : products;
    const wigs = source.filter(p => categorize(p) === "wig");
    const bobs = source.filter(p => categorize(p) === "bob");
    const boho = source.filter(p => categorize(p) === "boho");
    const bundles = source.filter(p => categorize(p) === "bundles");
    const tools = source.filter(p => categorize(p) === "tools");

    // Pick a mix: 2 wigs, 2 bobs, 1 boho, 1 bundle, 1 styling tool, 1 extra
    const mix: ShopifyProduct[] = [];
    mix.push(...wigs.slice(0, 2));
    mix.push(...bobs.slice(0, 2));
    mix.push(...boho.slice(0, 1));
    mix.push(...bundles.slice(0, 1));
    mix.push(...tools.slice(0, 1));

    // Fill remaining slots up to 8
    const usedIds = new Set(mix.map(p => p.node.id));
    const extras = [...wigs, ...bobs, ...boho, ...bundles, ...tools].filter(p => !usedIds.has(p.node.id));
    while (mix.length < 8 && extras.length > 0) {
      mix.push(extras.shift()!);
    }

    return mix.slice(0, 8);
  }, [newestProducts, products]);

  // Lace Wig Collection: lace front wigs (natural black, not colored, not bob, not headband)
  const laceWigCollection = useMemo(() => {
    return products.filter((p) => {
      const t = (p.node.title || "").toLowerCase();
      const isLace = t.includes("lace") || (t.includes("wig") && (t.includes("frontal") || t.includes("13x4") || t.includes("13x6") || t.includes("hd")));
      const isAccessory = ["wig glue", "lace tint", "lace melting", "melting spray", "tint spray", "installation kit", "wig stand", "glue remover", "hair glue", "adhesive"].some(k => t.includes(k));
      const isBundle = (t.includes("bundle") || t.includes("hair weave")) && !t.includes("wig");
      const isBraid = t.includes("boho") || t.includes("braid") || t.includes("crochet");
      return isLace && !isAccessory && !isBundle && !isBraid && !t.includes("headband") && !t.includes("v part") && !t.includes("u part");
    }).slice(0, 8);
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") return products;

    const titleOf = (p: ShopifyProduct) => (p.node.title || "").toLowerCase();
    const descOf = (p: ShopifyProduct) => (p.node.description || "").toLowerCase();
    const typeOf = (p: ShopifyProduct) => (p.node.productType || "").toLowerCase().trim();

    // Shared accessory keywords
    const accessoryKeywords = ["wig glue", "lace glue", "glue for", "glue and", "glue with", "super lace glue",
      "lace tint", "lace melting", "melting spray", "tint spray", "edge control", "wig installation kit", "installation kit",
      "wig stand", "wig storage", "wig bag", "wig rack", "wig holder", "blowout brush", "styling tool",
      "wig cap", "hd wig cap", "melt band", "wax stick", "edge brush", "hair polisher", "scalp oil",
      "glue remover", "hair glue", "adhesive", "walker tape", "dryer", "flat iron", "curling iron"];

    const isAccessory = (p: ShopifyProduct) => {
      const t = titleOf(p);
      const type = typeOf(p);
      if (type === "dryer" || type === "accessories") return true;
      return accessoryKeywords.some(k => t.includes(k));
    };

    const isBundle = (p: ShopifyProduct) => {
      const t = titleOf(p);
      return (t.includes("bundle") || t.includes("hair weave") || t.includes("hair weft") || t.includes("hair extension"))
        && !t.includes("wig");
    };

    const isBohoBraid = (p: ShopifyProduct) => {
      const t = titleOf(p);
      return (t.includes("boho") || t.includes("braid") || t.includes("crochet") || t.includes("bulk hair"))
        && !t.includes("wig");
    };

    const isHeadband = (p: ShopifyProduct) => {
      const t = titleOf(p);
      return t.includes("headband") || typeOf(p) === "headband wig";
    };

    const isBob = (p: ShopifyProduct) => {
      const t = titleOf(p);
      return t.includes("bob") && (t.includes("wig") || t.includes("lace"));
    };

    const isVPart = (p: ShopifyProduct) => {
      const t = titleOf(p);
      return t.includes("v part") || t.includes("v-part") || t.includes("half wig") || t.includes("u part") || t.includes("u-part") || t.includes("flip wig");
    };

    const colorKeywords = ["blonde", "burgundy", "#27", "#99j", "ombre", "honey", "ginger", "highlight", "#613",
      "#4/27", "#4/613", "#30", "auburn", "reddish", "red ", "pink", "blue", "purple", "chocolate", "#4 ", "colored", "ash"];

    const isColored = (p: ShopifyProduct) => {
      const t = titleOf(p);
      const isWig = t.includes("wig") || t.includes("lace");
      return isWig && colorKeywords.some(k => t.includes(k));
    };

    // Each category filter excludes products that belong to other specific categories
    if (activeCategory === "accessories") {
      return products.filter(isAccessory);
    }

    if (activeCategory === "bundles") {
      return products.filter(p => isBundle(p) && !isAccessory(p));
    }

    if (activeCategory === "boho-braids") {
      return products.filter(p => isBohoBraid(p) && !isAccessory(p));
    }

    if (activeCategory === "v-part-half-wigs") {
      return products.filter(p => isVPart(p) && !isAccessory(p) && !isBundle(p));
    }

    if (activeCategory === "headband-wigs") {
      return products.filter(p => isHeadband(p) && !isAccessory(p) && !isBundle(p));
    }

    if (activeCategory === "bob-wigs") {
      return products.filter(p => isBob(p) && !isAccessory(p) && !isBundle(p) && !isHeadband(p) && !isVPart(p));
    }

    if (activeCategory === "colored-wigs") {
      return products.filter(p => isColored(p) && !isAccessory(p) && !isBundle(p) && !isBohoBraid(p));
    }

    // Lace front wigs: wigs that don't belong to bob, headband, v-part, colored, boho, bundles, or accessories
    if (activeCategory === "lace-front-wigs") {
      return products.filter((p) => {
        const t = titleOf(p);
        const isWig = t.includes("lace") || t.includes("wig") || t.includes("frontal") || t.includes("glueless");
        return isWig && !isAccessory(p) && !isBundle(p) && !isBohoBraid(p)
          && !isHeadband(p) && !isBob(p) && !isVPart(p) && !isColored(p);
      });
    }

    return products;
  }, [products, activeCategory]);

  const visibleProducts = useMemo(() => filteredProducts.slice(0, visibleCount), [filteredProducts, visibleCount]);
  const hasMore = visibleCount < filteredProducts.length;

  const handleCategoryChange = (value: string) => {
    setActiveCategory(value);
    setVisibleCount(PRODUCTS_PER_PAGE);
    if (value === "all") {
      navigate("/#products", { replace: true });
    } else {
      navigate(`/#products?category=${value}`, { replace: true });
    }
    // Smooth scroll to products
    const el = document.getElementById("products");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SEOHead
        title="Premium 100% Human Hair Wigs & Bundles"
        description="Shop premium 100% virgin human hair wigs, bundles, frontals & closures. Brazilian, Peruvian, Indian hair. Free worldwide shipping over $100. Founded in St. Maarten."
        path="/"
      />
      {/* ItemList JSON-LD for AI search engines to discover top products */}
      {topSellers.length > 0 && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: "Best Selling Hair Products",
              description: "Top selling wigs, bundles and hair products from Boss Queens Collection",
              numberOfItems: topSellers.length,
              itemListElement: topSellers.map((p, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: `https://bossqueenscollection.com/product/${p.node.handle}`,
                name: p.node.title,
                image: p.node.images?.edges[0]?.node?.url || "",
                item: {
                  "@type": "Product",
                  name: p.node.title,
                  url: `https://bossqueenscollection.com/product/${p.node.handle}`,
                  image: p.node.images?.edges[0]?.node?.url || "",
                  brand: { "@type": "Brand", name: "Boss Queens Collection" },
                  offers: {
                    "@type": "Offer",
                    priceCurrency: p.node.priceRange.minVariantPrice.currencyCode,
                    price: (parseFloat(p.node.priceRange.minVariantPrice.amount) + 20).toFixed(2),
                    availability: p.node.availableForSale !== false ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                  }
                }
              }))
            })}
          </script>
        </Helmet>
      )}
      <main>
        <EasterBanner />
        <Hero />
        <Marquee />
        {/* Free Shipping Banner */}
        <section className="py-4 md:py-6 bg-primary/5 border-y border-primary/10">
          <div className="container px-4 md:px-8">
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 text-center"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-primary" />
                </div>
                <span className="font-display text-lg md:text-xl font-bold text-foreground">
                  Free Global Shipping
                </span>
              </div>
              <span className="text-muted-foreground text-sm md:text-base">
                On all orders over <span className="font-semibold text-primary">$100</span> — delivered worldwide to your doorstep
              </span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Globe className="w-4 h-4" />
                <span>180+ Countries</span>
                <span className="text-border">·</span>
                <Package className="w-4 h-4" />
                <span>Tracked & Insured</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Top Sellers Section */}
        <section className="py-12 md:py-20 relative bg-secondary/30">
          <div className="container px-4 md:px-8">
            <motion.div
              className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 md:mb-12 gap-3 md:gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div>
                <div className="flex items-center gap-2 mb-2 md:mb-3">
                  <Flame className="w-5 h-5 text-primary" />
                  <span className="text-primary text-xs md:text-sm font-medium tracking-[0.2em] uppercase">Best Sellers</span>
                </div>
                <h2 className="font-display text-2xl md:text-5xl font-bold text-foreground">Top Sellers</h2>
              </div>
              <p className="text-muted-foreground text-lg max-w-sm">Our most popular picks loved by queens worldwide</p>
            </motion.div>
            <ProductGrid products={topSellers} isLoading={isLoading} />
          </div>
        </section>

        <Categories />

        {/* Newly Added Section */}
        <section className="py-12 md:py-20 relative">
          <div className="container px-4 md:px-8">
            <motion.div
              className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 md:mb-12 gap-3 md:gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div>
                <div className="flex items-center gap-2 mb-2 md:mb-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="text-primary text-xs md:text-sm font-medium tracking-[0.2em] uppercase">Fresh Drops</span>
                </div>
                <h2 className="font-display text-2xl md:text-5xl font-bold text-foreground">Newly Added</h2>
              </div>
              <p className="text-muted-foreground text-lg max-w-sm">The latest additions to our premium collection</p>
            </motion.div>
            <ProductGrid products={newestBundles} isLoading={isLoadingNewest} />
          </div>
        </section>

        {/* Products Section */}
        <section id="products" className="py-14 md:py-28 relative">
          <div className="container px-4 md:px-8">
            <motion.div
              className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 md:mb-16 gap-3 md:gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div>
                <span className="text-primary text-xs md:text-sm font-medium tracking-[0.2em] uppercase mb-2 md:mb-3 block">
                  Our Products
                </span>
                <h2 className="font-display text-3xl md:text-6xl font-bold text-foreground">
                  The Collection
                </h2>
              </div>
              <p className="text-muted-foreground text-lg max-w-sm">
                Premium human hair wigs and bundles, crafted for queens who demand the best
              </p>
            </motion.div>

            {/* Category Filter Tabs */}
            <motion.div
              className="flex gap-2 mb-6 md:mb-10 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap scrollbar-hide"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              {CATEGORY_FILTERS.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryChange(cat.value)}
                  className={`relative px-4 md:px-5 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-medium transition-all duration-300 whitespace-nowrap shrink-0 ${activeCategory === cat.value
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                    }`}
                >
                  {cat.label}
                  {activeCategory === cat.value && (
                    <motion.div
                      layoutId="category-indicator"
                      className="absolute inset-0 bg-primary rounded-full -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                </button>
              ))}
            </motion.div>

            <ProductGrid products={visibleProducts} isLoading={isLoading} />

            {/* Load More Button */}
            {!isLoading && hasMore && (
              <motion.div
                className="flex flex-col items-center gap-3 mt-12"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  onClick={() => setVisibleCount((prev) => prev + PRODUCTS_PER_PAGE)}
                  className="px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-medium text-sm shadow-glow hover:opacity-90 transition-all duration-300"
                >
                  Load More Products
                </button>
                <span className="text-xs text-muted-foreground">
                  Showing {visibleProducts.length} of {filteredProducts.length} products
                </span>
              </motion.div>
            )}

            {/* No results message */}
            {!isLoading && filteredProducts.length === 0 && products.length > 0 && (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-muted-foreground text-lg mb-4">
                  No products found in this category yet.
                </p>
                <button
                  onClick={() => handleCategoryChange("all")}
                  className="text-primary font-medium hover:underline"
                >
                  View all products
                </button>
              </motion.div>
            )}
          </div>
        </section>

        {/* Recently Viewed */}
        <RecentlyViewed />

        <Suspense fallback={null}>
          {/* Trust Stats Bar */}
          <TrustBar />

          {/* Customer Reviews */}
          <HomeReviewsSection />

          {/* Tag Us In Your Selfie Banner */}
          <section className="py-12 md:py-20 relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5">
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            <div className="container px-4 md:px-8 relative">
              <motion.div
                className="flex flex-col items-center text-center gap-6 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="w-20 h-20 rounded-full bg-gradient-gold flex items-center justify-center shadow-glow">
                  <Camera className="w-9 h-9 text-primary-foreground" />
                </div>
                <div className="space-y-3">
                  <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
                    Tag Us In Your Selfie
                  </h2>
                  <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    Show off your Boss Queens hair! Tag us on Instagram for a chance to be featured and win a discount on your next order.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
                  <a
                    href="https://www.instagram.com/bossqueenscollection"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm shadow-glow hover:opacity-90 transition-all duration-300"
                  >
                    <Instagram className="w-5 h-5" />
                    @bossqueenscollection
                  </a>
                  <span className="text-sm text-muted-foreground font-medium">
                    Use <span className="text-primary font-bold">#BossQueensHair</span>
                  </span>
                </div>
                <div className="flex items-center gap-6 mt-4 text-muted-foreground text-sm">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>Get featured</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-primary" />
                    <span>Win discounts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-primary" />
                    <span>Join 5K+ queens</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Follow Us on TikTok */}
          <section className="py-10 md:py-16 relative overflow-hidden bg-foreground text-background">
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }} />
            <div className="container px-4 md:px-8 relative">
              <motion.div
                className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-4 md:gap-5 text-center md:text-left">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-background/10 flex items-center justify-center shrink-0 hidden md:flex">
                    <svg viewBox="0 0 24 24" className="w-7 h-7 md:w-8 md:h-8 fill-current" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.89a8.28 8.28 0 004.76 1.5v-3.4a4.85 4.85 0 01-1-.3z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-display text-xl md:text-2xl font-bold">
                      Follow Us on TikTok
                    </h3>
                    <p className="text-sm md:text-base opacity-70 mt-0.5">
                      Tutorials, transformations & behind-the-scenes
                    </p>
                  </div>
                </div>
                <a
                  href="https://www.tiktok.com/@bossqueenscollection"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-background text-foreground font-semibold text-sm hover:opacity-90 transition-all duration-300 shadow-lg shrink-0"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.89a8.28 8.28 0 004.76 1.5v-3.4a4.85 4.85 0 01-1-.3z"/>
                  </svg>
                  @bossqueenscollection
                </a>
              </motion.div>
            </div>
          </section>

          {/* Testimonials removed — real reviews shown in HomeReviewsSection above */}

          {/* Payment & Trust Banner */}
          <section className="py-12 md:py-20 border-y border-border/50 bg-secondary/20">
            <div className="container px-4 md:px-8">
              <motion.div
                className="flex flex-col items-center text-center gap-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div>
                  <span className="text-primary text-sm font-medium tracking-[0.2em] uppercase mb-3 block">
                    Your Purchase Is Protected
                  </span>
                  <h3 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                    Shop With Confidence
                  </h3>
                  <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
                    Every order is backed by our satisfaction guarantee and protected by industry-leading security
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-3xl">
                  {[
                    { icon: Truck, label: "Free Shipping", desc: "On orders over $100" },
                    { icon: Shield, label: "Secure Checkout", desc: "256-bit SSL encryption" },
                    { icon: ShieldCheck, label: "100% Authentic", desc: "Guaranteed human hair" },
                    { icon: Package, label: "Easy Returns", desc: "30-day money back" },
                  ].map((badge) => (
                    <motion.div
                      key={badge.label}
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border/60 hover:border-primary/20 hover:shadow-soft transition-all duration-300"
                      whileHover={{ y: -2 }}
                    >
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <badge.icon className="w-7 h-7" />
                      </div>
                      <span className="text-sm font-semibold text-foreground">{badge.label}</span>
                      <span className="text-xs text-muted-foreground">{badge.desc}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Payment logos */}
                <div className="flex flex-col items-center gap-3 pt-4">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">We Accept</span>
                  <div className="flex items-center gap-3 flex-wrap justify-center">
                    <VisaLogo className="h-10 w-auto" />
                    <MastercardLogo className="h-10 w-auto" />
                    <AmexLogo className="h-10 w-auto" />
                    <DiscoverLogo className="h-10 w-auto" />
                    <PayPalLogo className="h-10 w-auto" />
                    <ApplePayLogo className="h-10 w-auto" />
                    <GooglePayLogo className="h-10 w-auto" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Accepted Worldwide via Bank Account</span>
                </div>
              </motion.div>
            </div>
          </section>

          {/* About / Why Us Section */}
          <section className="py-14 md:py-28 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/[0.03] rounded-full blur-3xl -translate-x-1/2" />

            <div className="container px-4 md:px-8 relative">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                {/* Left — Story */}
                <motion.div
                  className="space-y-8"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                >
                  <div>
                    <span className="text-primary text-sm font-medium tracking-[0.2em] uppercase mb-3 block">
                      Our Story
                    </span>
                    <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground leading-tight">
                      Born in the Caribbean,
                      <br />
                      <span className="text-gradient-gold">Made for Queens</span>
                    </h2>
                  </div>

                  <div className="space-y-5 text-muted-foreground leading-relaxed">
                    <p>
                      From the beautiful island of <span className="text-foreground font-medium">St. Maarten</span> — a Caribbean gem of just 37 square miles — Boss Queens Collection was founded with a bold vision: to make premium, 100% human hair accessible to queens everywhere.
                    </p>
                    <p>
                      We source only the finest virgin hair from around the world and deliver it straight to your doorstep. Our mission is simple: <span className="text-foreground font-medium">top quality, affordable luxury, worldwide</span>.
                    </p>
                  </div>
                </motion.div>

                {/* Right — Features grid */}
                <motion.div
                  className="grid grid-cols-2 gap-4"
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.15 }}
                >
                  {[
                    { icon: Crown, title: "100% Human Hair", desc: "No synthetic blends — only premium virgin hair" },
                    { icon: ShieldCheck, title: "Affordable Luxury", desc: "Premium quality at prices that won't break the bank" },
                    { icon: Globe, title: "Global Shipping", desc: "From the Caribbean to your doorstep worldwide" },
                    { icon: Heart, title: "Caribbean Heart", desc: "Founded with island love and dedication to every queen" },
                  ].map((feature) => (
                    <div
                      key={feature.title}
                      className="bg-card border border-border/60 rounded-2xl p-6 space-y-3 hover:border-primary/20 hover:shadow-soft transition-all duration-300"
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <feature.icon className="w-6 h-6" />
                      </div>
                      <h4 className="font-display text-lg font-bold text-foreground">{feature.title}</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          </section>
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default Index;
