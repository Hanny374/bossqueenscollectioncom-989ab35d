import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { fetchProductByHandle, ShopifyProduct, PRICE_MARKUP } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { ChevronLeft, Loader2, Zap, Check, ChevronDown, ShoppingCart, Flame, Eye, Truck, Shield, Clock, AlertTriangle, Tag, Sparkles, Star, Minus, Plus } from "lucide-react";
import { ShareButtons } from "@/components/ShareButtons";
import { generateSalesCopy } from "@/lib/productSalesCopy";
import { ProductReviews } from "@/components/ProductReviews";
import { RecentlyViewed, addToRecentlyViewed } from "@/components/RecentlyViewed";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { HairDescriptionModal } from "@/components/HairDescriptionModal";
import useEmblaCarousel from "embla-carousel-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/** Replace third-party brand names in Shopify HTML with our brand */
function rebrandHtml(html: string): string {
  let out = html.replace(
    /(Brand\s*Name[^:]*:\s*(?:<[^>]*>\s*)*)([^<\n]+)/gi,
    (_m, prefix) => prefix + "Boss Queens Collection"
  );
  const suppliers = /\b(?:Wulala|BPHW(?:\s*Hair)?|Wigirl|Luvin|Beaudiva|Allrun|ALIMICE|Alimice|Aircabin|Yyong|Maxine|Lemoda|Unice|Sunber|Isee|Julia|Luduna|Nadula|Recool|Tuneful|Tinashe|Celie|Abijale|Aliballad|Hermosa|Arabella|Beaufox|Cranberry|Dorsanee|Klaiyi|Megalook|Mscoco|Perstar|Virgo|Westkiss)\b/gi;
  out = out.replace(suppliers, "Boss Queens Collection");
  return out;
}

const DENSITY_OPTIONS = [
  { value: "180%", label: "180%", description: "Natural look", markup: 0 },
  { value: "200%", label: "200%", description: "Full & voluminous", markup: 0 },
  { value: "210%", label: "210%", description: "Extra full", markup: 0 },
  { value: "250%", label: "250%", description: "Maximum volume", markup: 0 },
  { value: "300%", label: "300%", description: "Ultra thick", markup: 0 },
];

const LACE_TYPES = [
  { value: "4x4", label: "4x4 Closure", description: "Natural part", markup: 0 },
  { value: "5x5", label: "5x5 Closure", description: "More parting space", markup: 0 },
  { value: "13x4", label: "13x4 Frontal", description: "Ear to ear", markup: 0 },
  { value: "13x6", label: "13x6 Frontal", description: "Deep part", markup: 0 },
  { value: "360", label: "360 Lace", description: "Full perimeter", markup: 0 },
];

const HEAD_SIZES = [
  { value: "small", label: "Small", measurement: "21.5\" - 22\"", markup: 0 },
  { value: "medium", label: "Medium", measurement: "22\" - 22.5\"", markup: 0 },
  { value: "large", label: "Large", measurement: "22.5\" - 23\"", markup: 0 },
];

const isLengthOption = (name: string) => name.toLowerCase().includes('length');

const ProductPage = () => {
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<ShopifyProduct["node"] | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ShopifyProduct["node"]["variants"]["edges"][0]["node"] | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedLaceType, setSelectedLaceType] = useState<string>("13x4");
  const [selectedHeadSize, setSelectedHeadSize] = useState<string>("medium");
  const [selectedDensity, setSelectedDensity] = useState<string>("200%");
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [hairModalOpen, setHairModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"add" | "buy" | null>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const addItem = useCartStore(state => state.addItem);
  const buyNow = useCartStore(state => state.buyNow);
  const hairDescription = useCartStore(state => state.hairDescription);
  const isCartLoading = useCartStore(state => state.isLoading);
  const isBuyingNow = useCartStore(state => state.isBuyingNow);

  const isWigProduct = product ? (
    product.productType?.toLowerCase().includes('wig') || 
    product.title?.toLowerCase().includes('wig') ||
    product.productType?.toLowerCase().includes('colored wig') ||
    product.productType?.toLowerCase().includes('bob')
  ) : false;

  // Calculate dynamic price with markups for wig products
  const getAdjustedPrice = () => {
    const basePrice = parseFloat(selectedVariant?.price.amount || "0") + PRICE_MARKUP;
    if (!isWigProduct) return basePrice;

    const densityMarkup = DENSITY_OPTIONS.find(d => d.value === selectedDensity)?.markup || 0;
    const laceMarkup = LACE_TYPES.find(l => l.value === selectedLaceType)?.markup || 0;
    const headSizeMarkup = HEAD_SIZES.find(h => h.value === selectedHeadSize)?.markup || 0;

    return basePrice * (1 + densityMarkup + laceMarkup + headSizeMarkup);
  };

  const adjustedPrice = getAdjustedPrice();

  useEffect(() => {
    const loadProduct = async () => {
      if (!handle) return;
      try {
        const data = await fetchProductByHandle(handle);
        setProduct(data);
        if (data?.variants.edges[0]) {
          setSelectedVariant(data.variants.edges[0].node);
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setIsPageLoading(false);
      }
    };
    loadProduct();
  }, [handle]);

  // Track recently viewed
  useEffect(() => {
    if (!product) return;
    addToRecentlyViewed({
      handle: product.handle,
      title: product.title,
      image: product.images.edges[0]?.node?.url || "",
      price: (parseFloat(product.priceRange.minVariantPrice.amount) + PRICE_MARKUP).toFixed(2),
      currencyCode: product.priceRange.minVariantPrice.currencyCode,
    });
  }, [product]);

  // Show sticky bar when CTA buttons scroll out of view
  useEffect(() => {
    if (!ctaRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(ctaRef.current);
    return () => observer.disconnect();
  }, [product]);

  const getCartItem = () => ({
    product: { node: product! },
    variantId: selectedVariant!.id,
    variantTitle: selectedVariant!.title,
    price: { amount: adjustedPrice.toFixed(2), currencyCode: selectedVariant!.price.currencyCode },
    quantity,
    selectedOptions: selectedVariant!.selectedOptions || []
  });

  const isAccessory = product ? (
    product.productType?.toLowerCase().includes("accessor") ||
    product.tags?.some((t: string) => t.toLowerCase().includes("accessor"))
  ) : false;

  const requireHairDescription = useCallback((action: "add" | "buy") => {
    if (!product || !selectedVariant) return;
    if (!isAccessory && (!hairDescription || hairDescription.trim().length < 10)) {
      setPendingAction(action);
      setHairModalOpen(true);
    } else if (action === "add") {
      doAddToCart();
    } else {
      doBuyNow();
    }
  }, [product, selectedVariant, isAccessory, hairDescription]);

  const doAddToCart = async () => {
    if (!product || !selectedVariant) return;
    await addItem(getCartItem());
    toast.success("Added to cart!", { description: product.title });
  };

  const doBuyNow = async () => {
    if (!product || !selectedVariant) return;
    await buyNow(getCartItem());
  };

  const handleHairConfirm = () => {
    if (pendingAction === "add") doAddToCart();
    else if (pendingAction === "buy") doBuyNow();
    setPendingAction(null);
  };

  const handleAddToCart = () => requireHairDescription("add");
  const handleBuyNow = () => requireHairDescription("buy");

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-40">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container px-4 md:px-8 py-20 text-center">
          <h1 className="font-display text-4xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/">Back to Shop</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const images = product.images.edges;
  const variants = product.variants.edges;
  const mainImage = images[0]?.node?.url || "";
  const storeUrl = "https://bossqueenscollection.com";

  // Product JSON-LD for Google Shopping & SEO
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: images.map(img => img.node.url),
    url: `${storeUrl}/product/${product.handle}`,
    brand: { "@type": "Brand", name: "Boss Queens Collection" },
    sku: product.handle,
    category: product.productType || "Hair",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: selectedVariant?.price.currencyCode || "USD",
      lowPrice: (parseFloat(product.priceRange.minVariantPrice.amount) + PRICE_MARKUP).toFixed(2),
      highPrice: ((parseFloat(variants[variants.length - 1]?.node.price.amount || product.priceRange.minVariantPrice.amount)) + PRICE_MARKUP).toFixed(2),
      offerCount: variants.length,
      availability: product.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "Boss Queens Collection" },
      shippingDetails: [
        {
          "@type": "OfferShippingDetails",
          shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "USD" },
          shippingDestination: { "@type": "DefinedRegion", addressCountry: "US" },
          deliveryTime: { "@type": "ShippingDeliveryTime", handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "d" }, transitTime: { "@type": "QuantitativeValue", minValue: 3, maxValue: 7, unitCode: "d" } }
        },
        {
          "@type": "OfferShippingDetails",
          shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "USD" },
          shippingDestination: [
            { "@type": "DefinedRegion", addressCountry: "SX" },
            { "@type": "DefinedRegion", addressCountry: "JM" },
            { "@type": "DefinedRegion", addressCountry: "TT" },
            { "@type": "DefinedRegion", addressCountry: "BB" },
            { "@type": "DefinedRegion", addressCountry: "GY" },
            { "@type": "DefinedRegion", addressCountry: "BS" },
            { "@type": "DefinedRegion", addressCountry: "CU" },
            { "@type": "DefinedRegion", addressCountry: "DO" },
            { "@type": "DefinedRegion", addressCountry: "HT" },
            { "@type": "DefinedRegion", addressCountry: "AG" },
            { "@type": "DefinedRegion", addressCountry: "LC" },
            { "@type": "DefinedRegion", addressCountry: "VC" },
            { "@type": "DefinedRegion", addressCountry: "GD" },
            { "@type": "DefinedRegion", addressCountry: "KN" },
            { "@type": "DefinedRegion", addressCountry: "DM" },
            { "@type": "DefinedRegion", addressCountry: "BZ" },
            { "@type": "DefinedRegion", addressCountry: "SR" },
            { "@type": "DefinedRegion", addressCountry: "CW" },
            { "@type": "DefinedRegion", addressCountry: "AW" },
            { "@type": "DefinedRegion", addressCountry: "KY" },
            { "@type": "DefinedRegion", addressCountry: "TC" },
            { "@type": "DefinedRegion", addressCountry: "VG" },
            { "@type": "DefinedRegion", addressCountry: "VI" },
            { "@type": "DefinedRegion", addressCountry: "PR" },
            { "@type": "DefinedRegion", addressCountry: "AN" }
          ],
          deliveryTime: { "@type": "ShippingDeliveryTime", handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "d" }, transitTime: { "@type": "QuantitativeValue", minValue: 5, maxValue: 10, unitCode: "d" } }
        },
        {
          "@type": "OfferShippingDetails",
          shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "USD" },
          shippingDestination: { "@type": "DefinedRegion", addressCountry: ["GB", "CA", "AU", "NL", "FR", "DE", "NG", "GH", "ZA", "KE"] },
          deliveryTime: { "@type": "ShippingDeliveryTime", handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "d" }, transitTime: { "@type": "QuantitativeValue", minValue: 7, maxValue: 14, unitCode: "d" } }
        }
      ]
    },
    mpn: product.handle,
    material: "100% Virgin Human Hair",
    audience: { "@type": "PeopleAudience", suggestedGender: "female" }
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", position: 1, name: "Home", item: storeUrl },
      { "@type": "ListItem", position: 2, name: product.productType || "Products", item: `${storeUrl}/#products` },
      { "@type": "ListItem", position: 3, name: product.title, item: `${storeUrl}/product/${product.handle}` }
    ]
  };

  // Compare at price
  const compareAtPrice = selectedVariant?.compareAtPrice || null;

  // Simulated urgency data (deterministic based on product handle)
  const hashCode = product.handle.split("").reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
  const viewersNow = Math.abs(hashCode % 15) + 3;
  const soldRecently = Math.abs((hashCode >> 4) % 20) + 5;
  const lowStock = Math.abs((hashCode >> 8) % 12) + 1; // Simulated stock 1-12

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{product.title} | Boss Queens Collection</title>
        <meta name="description" content={product.description?.substring(0, 160) || `Shop ${product.title} — premium 100% human hair from Boss Queens Collection.`} />
        <link rel="canonical" href={`${storeUrl}/product/${product.handle}`} />
        <meta property="og:title" content={`${product.title} | Boss Queens Collection`} />
        <meta property="og:description" content={product.description?.substring(0, 160) || `Shop ${product.title} — premium 100% human hair.`} />
        <meta property="og:image" content={mainImage} />
        <meta property="og:url" content={`${storeUrl}/product/${product.handle}`} />
        <meta property="og:type" content="product" />
        <meta property="og:site_name" content="Boss Queens Collection" />
        <meta property="product:price:amount" content={(parseFloat(product.priceRange.minVariantPrice.amount) + PRICE_MARKUP).toFixed(2)} />
        <meta property="product:price:currency" content={product.priceRange.minVariantPrice.currencyCode} />
        <meta property="product:availability" content={product.availableForSale ? "in stock" : "out of stock"} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${product.title} | Boss Queens Collection`} />
        <meta name="twitter:image" content={mainImage} />
        <script type="application/ld+json">{JSON.stringify(productJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>
      <Header />
      <main className="py-8">
        <div className="container px-4 md:px-8">
          {/* Breadcrumb */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Collection
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Images */}
            <ProductImageCarousel
              images={images}
              selectedImage={selectedImage}
              onSelectImage={setSelectedImage}
              productTitle={product.title}
            />
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
                  {product.title}
                </h1>
                <div className="mb-4">
                  <ShareButtons 
                    url={`${storeUrl}/product/${product.handle}`}
                    title={product.title}
                    image={mainImage}
                  />
                </div>
                
                {/* Price with savings badge */}
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="text-3xl font-bold text-gradient-gold">
                    {selectedVariant?.price.currencyCode} ${adjustedPrice.toFixed(2)}
                  </p>
                  {compareAtPrice && (parseFloat(compareAtPrice.amount) + PRICE_MARKUP) > adjustedPrice && (
                    <>
                      <p className="text-lg text-muted-foreground line-through">
                        ${(parseFloat(compareAtPrice.amount) + PRICE_MARKUP).toFixed(2)}
                      </p>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-bold">
                        <Tag className="w-3.5 h-3.5" />
                        Save {Math.round((((parseFloat(compareAtPrice.amount) + PRICE_MARKUP) - adjustedPrice) / (parseFloat(compareAtPrice.amount) + PRICE_MARKUP)) * 100)}%
                      </span>
                    </>
                  )}
                </div>

                {/* Low stock warning */}
                {lowStock > 0 && lowStock <= 10 && (
                  <motion.div
                    className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/5 border border-destructive/20"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                    <span className="text-sm font-medium text-destructive">
                      Only {lowStock} left in stock — order soon!
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Conversion: Urgency & Social Proof */}
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-2 text-sm">
                  <Eye className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">
                    <span className="font-semibold text-foreground">{viewersNow} people</span> are viewing this right now
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Flame className="w-4 h-4 text-destructive" />
                  <span className="text-muted-foreground">
                    <span className="font-semibold text-foreground">{soldRecently} sold</span> in the last 24 hours
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Truck className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">
                    <span className="font-semibold text-primary">FREE shipping</span> on orders over $100
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">
                    <span className="font-semibold text-foreground">30-day</span> money-back guarantee
                  </span>
                </div>
              </motion.div>


              {/* Variants */}
              {variants.length > 1 && (
                <div className="space-y-4">
                  {product.options.map((option) => {
                    const isLength = isLengthOption(option.name);
                    return (
                      <div key={option.name} className="space-y-3">
                        <label className="block text-sm font-medium text-foreground">
                          {option.name}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {option.values.map((value) => {
                            const variantForValue = variants.find(v => 
                              v.node.selectedOptions.some(
                                opt => opt.name === option.name && opt.value === value
                              )
                            );
                            const isSelected = selectedVariant?.selectedOptions.some(
                              opt => opt.name === option.name && opt.value === value
                            );
                            
                            return (
                              <button
                                key={value}
                                onClick={() => variantForValue && setSelectedVariant(variantForValue.node)}
                                className={`px-3 py-2 rounded-lg border transition-all ${isLength ? 'min-w-[60px]' : 'px-4'} ${
                                  isSelected
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-border hover:border-primary/50"
                                }`}
                              >
                                <span className="text-sm font-medium">
                                  {isLength ? `${value}"` : value}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        {isLength && (
                          <p className="text-xs text-muted-foreground italic">
                            Measured when stretched straight. Longer lengths available upon request.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Lace Type Selection - Wigs Only */}
              {isWigProduct && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-foreground">
                    Lace Type
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {LACE_TYPES.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setSelectedLaceType(type.value)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          selectedLaceType === type.value
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <p className={`text-sm font-medium ${selectedLaceType === type.value ? "text-primary" : "text-foreground"}`}>
                          {type.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {type.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Density Selection - Wigs Only */}
              {isWigProduct && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-foreground">
                    Density
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DENSITY_OPTIONS.map((density) => (
                      <button
                        key={density.value}
                        onClick={() => setSelectedDensity(density.value)}
                        className={`px-4 py-3 rounded-lg border transition-all ${
                          selectedDensity === density.value
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <p className={`text-sm font-medium ${selectedDensity === density.value ? "text-primary" : "text-foreground"}`}>
                          {density.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {density.description}
                        </p>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    Higher density = thicker, fuller look. 200% is the most popular choice.
                  </p>
                </div>
              )}

              {/* Head Size Selection - Wigs Only */}
              {isWigProduct && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-foreground">
                    Head Size
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {HEAD_SIZES.map((size) => (
                      <button
                        key={size.value}
                        onClick={() => setSelectedHeadSize(size.value)}
                        className={`px-4 py-3 rounded-lg border transition-all ${
                          selectedHeadSize === size.value
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <p className={`text-sm font-medium ${selectedHeadSize === size.value ? "text-primary" : "text-foreground"}`}>
                          {size.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {size.measurement}
                        </p>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    Measure around your head at the hairline. All wigs include adjustable straps.
                  </p>
                </div>
              )}

              {/* Add to Cart & Buy Now */}
              <div ref={ctaRef} className="pt-4 space-y-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={isCartLoading || !selectedVariant?.availableForSale}
                  size="lg"
                  variant="outline"
                  className="w-full border-primary text-primary hover:bg-primary/10 text-base md:text-lg py-5 md:py-6"
                >
                  {isCartLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleBuyNow}
                  disabled={isBuyingNow || !selectedVariant?.availableForSale}
                  size="lg"
                  className="w-full bg-gradient-gold hover:opacity-90 text-primary-foreground shadow-gold text-base md:text-lg py-5 md:py-6"
                >
                  {isBuyingNow ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : !selectedVariant?.availableForSale ? (
                    "Sold Out"
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Buy Now
                    </>
                  )}
                </Button>
              </div>

              {/* Mobile sticky CTA bar */}
              <div className="fixed bottom-16 left-0 right-0 z-30 md:hidden bg-background/95 backdrop-blur-lg border-t border-border/40 px-4 py-2.5 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] safe-area-bottom">
                <div className="flex flex-col gap-2">
                  {/* Quantity + Buy Now row */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-border rounded-lg overflow-hidden shrink-0">
                      <button
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-foreground">{quantity}</span>
                      <button
                        onClick={() => setQuantity(q => Math.min(10, q + 1))}
                        className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <Button
                      onClick={handleBuyNow}
                      disabled={isBuyingNow || !selectedVariant?.availableForSale}
                      className="flex-1 bg-gradient-gold hover:opacity-90 text-primary-foreground shadow-gold py-3 text-sm font-semibold"
                    >
                      {isBuyingNow ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : !selectedVariant?.availableForSale ? (
                        "Sold Out"
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-1.5" />
                          Buy Now — ${(adjustedPrice * quantity).toFixed(2)}
                        </>
                      )}
                    </Button>
                  </div>
                  <Button
                    onClick={handleAddToCart}
                    disabled={isCartLoading || !selectedVariant?.availableForSale}
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-primary/10 py-2.5 text-sm font-semibold"
                  >
                    {isCartLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-1.5" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Sales-optimized description */}
              {(() => {
                const salesCopy = generateSalesCopy({
                  title: product.title,
                  productType: product.productType,
                  tags: product.tags,
                  description: product.description,
                  options: product.options,
                });
                return (
                  <div className="space-y-5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary shrink-0" />
                      <p className="font-display text-lg font-semibold text-foreground">
                        {salesCopy.headline}
                      </p>
                    </div>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      {salesCopy.shortDescription}
                    </p>
                    {product.descriptionHtml && (
                      <div 
                        className="text-muted-foreground text-sm leading-relaxed prose prose-stone max-w-none whitespace-pre-wrap
                        [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-3 [&>li]:mb-1.5 [&>strong]:text-foreground [&>h3]:text-foreground [&>h3]:font-bold [&>h3]:mt-4 [&>h3]:mb-2"
                        dangerouslySetInnerHTML={{ __html: rebrandHtml(product.descriptionHtml) }}
                      />
                    )}
                    <div className="p-4 rounded-xl bg-secondary/40 border border-border/50 space-y-2.5">
                      <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-primary" />
                        Why You'll Love It
                      </p>
                      <ul className="space-y-2">
                        {salesCopy.benefits.slice(0, 6).map((benefit, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {["✨ Premium 10A Grade", "💎 100% Human Hair", "🔥 Best Seller", "🛡️ 30-Day Guarantee"].map((tag) => (
                        <span key={tag} className="text-xs font-medium px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Trust badges */}
              <div className="border-t border-border pt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Check className="w-5 h-5 text-primary" />
                  <span>100% Human Hair Guaranteed</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Free Shipping on Orders Over $100</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Easy 30-Day Returns</span>
                </div>
              </div>

              {/* Hair Details Dropdown */}
              <Accordion type="single" collapsible className="w-full border-t border-border pt-4">
                <AccordionItem value="hair-details" className="border-b-0">
                  <AccordionTrigger className="text-foreground font-semibold hover:no-underline">
                    Hair Details & Specifications
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground uppercase tracking-wide">Hair Type</span>
                          <p className="text-sm font-medium text-foreground">100% Virgin Human Hair</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground uppercase tracking-wide">Hair Grade</span>
                          <p className="text-sm font-medium text-foreground">10A Premium Quality</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground uppercase tracking-wide">Available Lengths</span>
                          <p className="text-sm font-medium text-foreground">8" - 40" inches</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground uppercase tracking-wide">Hair Weight</span>
                          <p className="text-sm font-medium text-foreground">95-105g per bundle</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground uppercase tracking-wide">Weft Type</span>
                          <p className="text-sm font-medium text-foreground">Double Weft (Machine)</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground uppercase tracking-wide">Can Be Dyed</span>
                          <p className="text-sm font-medium text-foreground">Yes, up to #27</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground uppercase tracking-wide">Heat Styling</span>
                          <p className="text-sm font-medium text-foreground">Up to 400°F / 200°C</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground uppercase tracking-wide">Lace Types</span>
                          <p className="text-sm font-medium text-foreground">4x4, 5x5, 13x4, 13x6, 360</p>
                        </div>
                      </div>
                      
                      {/* Lace Type Chart */}
                      <div className="mt-4 p-4 bg-secondary/30 rounded-lg">
                        <h4 className="text-sm font-semibold text-foreground mb-3">Lace Size Guide</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                          <div className="text-center p-2 bg-background rounded">
                            <p className="font-medium text-foreground">4x4 Closure</p>
                            <p className="text-muted-foreground">4" x 4" lace area</p>
                            <p className="text-muted-foreground/70">Natural part</p>
                          </div>
                          <div className="text-center p-2 bg-background rounded">
                            <p className="font-medium text-foreground">5x5 Closure</p>
                            <p className="text-muted-foreground">5" x 5" lace area</p>
                            <p className="text-muted-foreground/70">More parting space</p>
                          </div>
                          <div className="text-center p-2 bg-background rounded">
                            <p className="font-medium text-foreground">13x4 Frontal</p>
                            <p className="text-muted-foreground">13" x 4" ear to ear</p>
                            <p className="text-muted-foreground/70">Natural hairline</p>
                          </div>
                          <div className="text-center p-2 bg-background rounded">
                            <p className="font-medium text-foreground">13x6 Frontal</p>
                            <p className="text-muted-foreground">13" x 6" deep part</p>
                            <p className="text-muted-foreground/70">Deeper parting</p>
                          </div>
                          <div className="text-center p-2 bg-background rounded col-span-2 md:col-span-1">
                            <p className="font-medium text-foreground">360 Lace</p>
                            <p className="text-muted-foreground">Full perimeter lace</p>
                            <p className="text-muted-foreground/70">High ponytails & updos</p>
                          </div>
                        </div>
                      </div>

                      {/* Head Size Chart */}
                      <div className="mt-4 p-4 bg-secondary/30 rounded-lg">
                        <h4 className="text-sm font-semibold text-foreground mb-3">Head Circumference</h4>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center p-2 bg-background rounded">
                            <p className="font-medium text-foreground">Small</p>
                            <p className="text-muted-foreground">21.5" - 22"</p>
                          </div>
                          <div className="text-center p-2 bg-background rounded">
                            <p className="font-medium text-foreground">Medium</p>
                            <p className="text-muted-foreground">22" - 22.5"</p>
                          </div>
                          <div className="text-center p-2 bg-background rounded">
                            <p className="font-medium text-foreground">Large</p>
                            <p className="text-muted-foreground">22.5" - 23"</p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 italic">
                          All wigs include adjustable straps for a perfect fit.
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="shipping" className="border-b-0">
                  <AccordionTrigger className="text-foreground font-semibold hover:no-underline">
                    Shipping & Delivery
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2 text-sm text-muted-foreground">
                      <p><span className="font-medium text-foreground">Processing Time:</span> 1-3 business days</p>
                      <p><span className="font-medium text-foreground">US Shipping:</span> 3-7 business days (Free over $100)</p>
                      <p><span className="font-medium text-foreground">International:</span> 7-21 business days</p>
                      <p><span className="font-medium text-foreground">Tracking:</span> Provided for all orders</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="care" className="border-b-0">
                  <AccordionTrigger className="text-foreground font-semibold hover:no-underline">
                    Care Instructions
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2 text-sm text-muted-foreground">
                      <ul className="list-disc list-inside space-y-2">
                        <li>Wash with sulfate-free shampoo every 7-14 days</li>
                        <li>Deep condition weekly for best results</li>
                        <li>Detangle gently from ends to roots</li>
                        <li>Air dry or use low heat setting</li>
                        <li>Store on a wig stand or in silk/satin bag</li>
                        <li>Use heat protectant before styling</li>
                      </ul>
                      <p className="text-xs italic pt-2">With proper care, our hair can last 12+ months.</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="returns" className="border-b-0">
                  <AccordionTrigger className="text-foreground font-semibold hover:no-underline">
                    Returns & Exchanges
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2 text-sm text-muted-foreground">
                      <p>We offer a <span className="font-medium text-foreground">30-day return policy</span> on all unused items in original packaging.</p>
                      <ul className="list-disc list-inside space-y-2">
                        <li>Hair must be uncut, unwashed, and unaltered</li>
                        <li>Original packaging and tags must be intact</li>
                        <li>Contact us within 30 days of delivery</li>
                        <li>Refund processed within 5-7 business days</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>

        {/* Product Reviews */}
        {product && (
          <div className="container px-4 md:px-8 pb-16">
            <ProductReviews productHandle={product.handle} productTitle={product.title} />
          </div>
        )}

        {/* Recently Viewed */}
        <RecentlyViewed excludeHandle={product?.handle} />
      </main>
      <Footer />

      {/* Sticky Mobile Buy Bar */}
      <AnimatePresence>
        {showStickyBar && product && selectedVariant && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border shadow-lg px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-display font-semibold text-foreground truncate">{product.title}</p>
                <p className="text-lg font-bold text-primary">${adjustedPrice.toFixed(2)}</p>
              </div>
              <Button
                onClick={handleAddToCart}
                disabled={isCartLoading || !selectedVariant.availableForSale}
                size="sm"
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10 shrink-0"
              >
                {isCartLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
              </Button>
              <Button
                onClick={handleBuyNow}
                disabled={isBuyingNow || !selectedVariant.availableForSale}
                size="sm"
                className="bg-gradient-gold hover:opacity-90 text-primary-foreground shadow-gold shrink-0"
              >
                {isBuyingNow ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                    <Zap className="w-4 h-4 mr-1" />
                    Buy Now
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <HairDescriptionModal open={hairModalOpen} onOpenChange={setHairModalOpen} onConfirm={handleHairConfirm} />
    </div>
  );
};

export default ProductPage;
