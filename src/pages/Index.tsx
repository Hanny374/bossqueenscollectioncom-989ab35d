import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { Categories } from "@/components/Categories";
import { ProductGrid } from "@/components/ProductGrid";
import { useProducts } from "@/hooks/useProducts";
import { useScrollToHash } from "@/hooks/useScrollToHash";
import { SEOHead } from "@/components/SEOHead";
import { motion } from "framer-motion";
import { Crown, Globe, Heart, ShieldCheck, Truck, Shield, Package } from "lucide-react";
import { VisaLogo, MastercardLogo, AmexLogo, DiscoverLogo, PayPalLogo, ApplePayLogo, GooglePayLogo } from "@/components/PaymentLogos";

// Lazy load below-fold sections
const Testimonials = lazy(() => import("@/components/Testimonials").then(m => ({ default: m.Testimonials })));
const Footer = lazy(() => import("@/components/Footer").then(m => ({ default: m.Footer })));

const CATEGORY_FILTERS = [
  { label: "All", value: "all" },
  { label: "Colored Wigs", value: "colored-wigs" },
  { label: "Bob Wigs", value: "bob-wigs" },
  { label: "Bundles", value: "bundles" },
  { label: "Headband Wigs", value: "headband-wigs" },
  { label: "Accessories", value: "accessories" },
] as const;

// Map filter values to Shopify productType values
const CATEGORY_TYPE_MAP: Record<string, string[]> = {
  "colored-wigs": ["Colored Wigs"],
  "bob-wigs": ["Bob Wig"],
  "bundles": ["Hair Bundles", "Bundle Deals"],
  "headband-wigs": ["Headband Wig"],
  "accessories": ["Frontals", "Closures", "Accessories"],
};

function getCategoryFromHash(hash: string): string {
  const match = hash.match(/category=([^&]+)/);
  return match ? match[1] : "all";
}

const Index = () => {
  // collection fix
  const { data: products = [], isLoading } = useProducts(50);
  const location = useLocation();
  const navigate = useNavigate();

  const categoryFromUrl = getCategoryFromHash(location.hash);
  const [activeCategory, setActiveCategory] = useState(categoryFromUrl);

  // Sync category from URL hash changes
  useEffect(() => {
    const cat = getCategoryFromHash(location.hash);
    setActiveCategory(cat);
  }, [location.hash]);

  useScrollToHash();

  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") return products;
    const types = CATEGORY_TYPE_MAP[activeCategory];
    if (!types) return products;
    return products.filter((p) =>
      types.some((t) => p.node.productType?.toLowerCase() === t.toLowerCase())
    );
  }, [products, activeCategory]);

  const handleCategoryChange = (value: string) => {
    setActiveCategory(value);
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
      <main>
        <Hero />
        <Marquee />
        {/* Free Shipping Banner */}
        <section className="py-6 bg-primary/5 border-y border-primary/10">
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

        <Categories />

        {/* Products Section */}
        <section id="products" className="py-28 relative">
          <div className="container px-4 md:px-8">
            <motion.div
              className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div>
                <span className="text-primary text-sm font-medium tracking-[0.2em] uppercase mb-3 block">
                  Our Products
                </span>
                <h2 className="font-display text-4xl md:text-6xl font-bold text-foreground">
                  The Collection
                </h2>
              </div>
              <p className="text-muted-foreground text-lg max-w-sm">
                Premium human hair wigs and bundles, crafted for queens who demand the best
              </p>
            </motion.div>

            {/* Category Filter Tabs */}
            <motion.div
              className="flex flex-wrap gap-2 mb-10"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              {CATEGORY_FILTERS.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryChange(cat.value)}
                  className={`relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${activeCategory === cat.value
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

            <ProductGrid products={filteredProducts} isLoading={isLoading} />

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

        <Suspense fallback={null}>
          <Testimonials />

          {/* Payment & Trust Banner */}
          <section className="py-16 border-y border-border/50">
            <div className="container px-4 md:px-8">
              <motion.div
                className="flex flex-col items-center text-center gap-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  Shop With Confidence
                </h3>
                <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
                  {[
                    { icon: Truck, label: "Free Shipping Over $100" },
                    { icon: Shield, label: "Secure Payments" },
                    { icon: ShieldCheck, label: "100% Authentic Hair" },
                  ].map((badge) => (
                    <div key={badge.label} className="flex flex-col items-center gap-2">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <badge.icon className="w-7 h-7" />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">{badge.label}</span>
                    </div>
                  ))}
                  {/* Payment logos */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                      <VisaLogo className="h-10 w-auto" />
                      <MastercardLogo className="h-10 w-auto" />
                      <AmexLogo className="h-10 w-auto" />
                      <DiscoverLogo className="h-10 w-auto" />
                      <PayPalLogo className="h-10 w-auto" />
                      <ApplePayLogo className="h-10 w-auto" />
                      <GooglePayLogo className="h-10 w-auto" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">Accepted Worldwide</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* About / Why Us Section */}
          <section className="py-28 relative overflow-hidden">
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
