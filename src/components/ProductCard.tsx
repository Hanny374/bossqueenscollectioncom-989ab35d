import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShopifyProduct, PRICE_MARKUP } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { getCardDescription } from "@/lib/productSalesCopy";
import { Loader2, Check, Ruler, Palette, Eye, Zap, ShoppingCart, Truck, Star } from "lucide-react";
import { toast } from "sonner";
import { QuickViewModal } from "./QuickViewModal";
import { HairDescriptionModal } from "./HairDescriptionModal";
import { useAllReviewStats } from "@/hooks/useProductReviewStats";

const COLOR_MAP: Record<string, string> = {
  black: "#1a1a1a", "natural black": "#1a1a1a", "1b": "#1a1a1a", "jet black": "#0a0a0a",
  blonde: "#f5d08a", "613": "#f5deb3", "honey blonde": "#d4a84b", "honey": "#d4a84b", "ash blonde": "#c8b89a",
  brown: "#6b4226", "dark brown": "#3e2723", "light brown": "#8b6542", "chocolate": "#5c3317",
  burgundy: "#800020", wine: "#722f37", red: "#b22222", ginger: "#b06500",
  pink: "#e8a0bf", "rose gold": "#b76e79", purple: "#6a1b9a",
  ombre: "linear-gradient(135deg, #1a1a1a 40%, #d4a84b 100%)",
  highlight: "linear-gradient(135deg, #3e2723 40%, #d4a84b 100%)",
  "piano": "linear-gradient(135deg, #1a1a1a 40%, #6b4226 100%)",
  grey: "#9e9e9e", gray: "#9e9e9e", silver: "#c0c0c0",
};

function colorNameToHex(name: string): string {
  const key = name.toLowerCase().trim();
  for (const [k, v] of Object.entries(COLOR_MAP)) {
    if (key.includes(k)) return v;
  }
  return "#c4a882"; // warm fallback
}

interface ProductCardProps {
  product: ShopifyProduct;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { node } = product;
  const [isHovered, setIsHovered] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [hairModalOpen, setHairModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"add" | "buy" | null>(null);
  const [selectedDensity, setSelectedDensity] = useState<string>("200%");
  const isBuyingNow = useCartStore(state => state.isBuyingNow);
  const buyNow = useCartStore(state => state.buyNow);
  const addItem = useCartStore(state => state.addItem);
  const isCartLoading = useCartStore(state => state.isLoading);
  const hairDescription = useCartStore(state => state.hairDescription);
  
  const { data: reviewStatsMap } = useAllReviewStats();
  const reviewStats = reviewStatsMap?.[node.handle];
  
  const image = node.images.edges[0]?.node;
  const secondImage = node.images.edges[1]?.node;
  const price = node.priceRange.minVariantPrice;
  const compareAtPrice = node.compareAtPriceRange?.maxVariantPrice;
  const isOnSale = compareAtPrice && parseFloat(compareAtPrice.amount) > parseFloat(price.amount);
  const firstVariant = node.variants.edges[0]?.node;
  
  const lengthOption = node.options?.find(opt => opt.name.toLowerCase().includes('length'));
  const colorOption = node.options?.find(opt => opt.name.toLowerCase() === 'color');
  const variantCount = node.variants.edges.length;
  const availableVariants = node.variants.edges.filter(v => v.node.availableForSale).length;
  const inStock = availableVariants > 0;

  const getCartItem = () => ({
    product,
    variantId: firstVariant!.id,
    variantTitle: firstVariant!.title,
    price: { amount: (parseFloat(firstVariant!.price.amount) + PRICE_MARKUP).toFixed(2), currencyCode: firstVariant!.price.currencyCode },
    quantity: 1,
    selectedOptions: firstVariant!.selectedOptions || []
  });

  const isAccessory = (node.productType?.toLowerCase().includes("accessor") || node.tags?.some(t => t.toLowerCase().includes("accessor")));

  const requireHairDescription = (action: "add" | "buy", e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!firstVariant) return;
    if (!isAccessory && (!hairDescription || hairDescription.trim().length < 10)) {
      setPendingAction(action);
      setHairModalOpen(true);
    } else if (action === "add") {
      doAddToCart();
    } else {
      doBuyNow();
    }
  };

  const doAddToCart = async () => {
    await addItem(getCartItem());
    toast.success("Added to cart!", { description: node.title });
  };

  const doBuyNow = async () => {
    await buyNow(getCartItem());
  };

  const handleHairConfirm = () => {
    if (pendingAction === "add") doAddToCart();
    else if (pendingAction === "buy") doBuyNow();
    setPendingAction(null);
  };

  return (
    <>
    <Link 
      to={`/product/${node.handle}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] md:aspect-square overflow-hidden rounded-xl bg-secondary/30 shadow-soft hover-lift shine-effect">
        {image ? (
          <img
            src={image.url}
            alt={image.altText || node.title}
            loading="lazy"
            decoding="async"
            className={`w-full h-full object-cover transition-all duration-500 ${isHovered && secondImage ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-cream-dark">
            <span className="text-muted-foreground font-display text-lg">No Image</span>
          </div>
        )}
        
        {secondImage && (
          <img
            src={secondImage.url}
            alt={secondImage.altText || `${node.title} - alternate view`}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          />
        )}
        
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {inStock ? (
            <Badge className="bg-primary/95 text-primary-foreground text-xs shadow-sm backdrop-blur-sm">
              <Check className="w-3 h-3 mr-1" />
              In Stock
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-muted/95 text-muted-foreground text-xs backdrop-blur-sm">
              Sold Out
            </Badge>
          )}
          {isOnSale && (
            <Badge className="bg-destructive/90 text-destructive-foreground text-xs shadow-sm backdrop-blur-sm">
              Sale
            </Badge>
          )}
        </div>

        <div className="absolute top-3 right-3 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickViewOpen(true); }}
            className="flex items-center gap-1 bg-background/95 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium text-foreground shadow-soft hover:bg-background transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            Quick View
          </button>
        </div>
        
        <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4 right-3 md:right-4 opacity-100 translate-y-0 md:opacity-0 md:translate-y-3 transition-all duration-300 md:group-hover:opacity-100 md:group-hover:translate-y-0 z-10 flex gap-1.5 md:gap-2">
          <Button
            onClick={(e) => requireHairDescription("add", e)}
            disabled={isCartLoading || !firstVariant?.availableForSale}
            variant="outline"
            className="flex-1 bg-background/95 backdrop-blur-sm border-primary text-primary hover:bg-primary/10 h-9 md:h-11 text-xs md:text-sm"
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
          <Button
            onClick={(e) => requireHairDescription("buy", e)}
            disabled={isBuyingNow || !firstVariant?.availableForSale}
            className="flex-1 bg-gradient-gold hover:opacity-90 text-espresso shadow-glow h-9 md:h-11 text-xs md:text-sm"
          >
            {isBuyingNow ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : !firstVariant?.availableForSale ? (
              "Sold Out"
            ) : (
              <>
                <Zap className="w-4 h-4 mr-1.5" />
                Buy Now
              </>
            )}
          </Button>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

      <div className="mt-3 md:mt-4 space-y-1.5 md:space-y-2">
        <h3 className="font-display text-base md:text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {node.title}
        </h3>

        {/* Star Rating & Shipping */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(s => (
                <Star
                  key={s}
                  className={`w-3.5 h-3.5 ${
                    reviewStats && s <= Math.round(reviewStats.avgRating)
                      ? "fill-primary text-primary"
                      : "text-border"
                  }`}
                />
              ))}
            </div>
            {reviewStats && reviewStats.count > 0 && (
              <span className="text-xs text-muted-foreground">({reviewStats.count})</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Truck className="w-3.5 h-3.5 text-primary" />
            <span>5–10 days</span>
          </div>
        </div>
        
        <p className="text-muted-foreground text-sm line-clamp-2">
          {getCardDescription({ title: node.title, productType: node.productType, tags: node.tags, description: node.description, options: node.options })}
        </p>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-1.5">
            {variantCount > 1 && (
              <span className="text-xs text-muted-foreground">from</span>
            )}
            <p className="font-display font-bold text-xl text-primary">
              ${(parseFloat(price.amount) + PRICE_MARKUP).toFixed(2)}
            </p>
            {isOnSale && (
              <p className="text-sm text-muted-foreground line-through">
                ${(parseFloat(compareAtPrice.amount) + PRICE_MARKUP).toFixed(2)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Product Specifications - below buttons */}
      <div className="mt-2 space-y-1.5">
        {colorOption && colorOption.values.length > 0 && (
          <div className="flex items-center gap-2">
            <Palette className="w-3.5 h-3.5 text-primary shrink-0" />
            <div className="flex items-center gap-1.5">
              {colorOption.values.slice(0, 6).map((color) => {
                const bg = colorNameToHex(color);
                const isGradient = bg.startsWith("linear-gradient");
                return (
                  <span
                    key={color}
                    title={color}
                    className="w-5 h-5 rounded-full border border-border/60 shadow-sm shrink-0"
                    style={isGradient ? { background: bg } : { backgroundColor: bg }}
                  />
                );
              })}
              {colorOption.values.length > 6 && (
                <span className="text-xs text-muted-foreground ml-0.5">+{colorOption.values.length - 6}</span>
              )}
            </div>
          </div>
        )}
        
        {lengthOption && lengthOption.values.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Ruler className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-muted-foreground font-medium">Available Lengths</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {lengthOption.values.slice(0, 4).map((length) => {
                const matchingVariant = node.variants.edges.find(v => 
                  v.node.selectedOptions?.some(opt => 
                    opt.name.toLowerCase().includes('length') && opt.value === length
                  )
                );
                const variantPrice = matchingVariant?.node.price.amount;
                
                return (
                  <span 
                    key={length} 
                    className="text-xs bg-secondary text-foreground px-2.5 py-1 rounded-full flex items-center gap-1 border border-border/50"
                  >
                    <span className="font-medium">{length}"</span>
                    {variantPrice && (
                      <span className="text-primary font-semibold">
                        ${(parseFloat(variantPrice) + PRICE_MARKUP).toFixed(0)}
                      </span>
                    )}
                  </span>
                );
              })}
              {lengthOption.values.length > 4 && (
                <span className="text-xs text-muted-foreground px-2 py-1">
                  +{lengthOption.values.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}
        
        {(node.productType?.toLowerCase().includes('wig') || node.title?.toLowerCase().includes('wig') || node.productType?.toLowerCase().includes('bob')) && (
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground font-medium">Density</span>
            <div className="flex flex-wrap gap-1.5">
              {["180%", "200%", "210%", "250%", "300%"].map((d) => (
                <button
                  key={d}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedDensity(d); }}
                  className={`text-xs px-2 py-1 rounded-full border transition-all ${
                    selectedDensity === d
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-border/50 text-foreground hover:border-primary/50"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Link>
      <QuickViewModal product={product} open={quickViewOpen} onOpenChange={setQuickViewOpen} />
      <HairDescriptionModal open={hairModalOpen} onOpenChange={setHairModalOpen} onConfirm={handleHairConfirm} />
    </>
  );
};
