import { useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { getCardDescription } from "@/lib/productSalesCopy";
import { Loader2, Zap, ShoppingCart, Check, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface QuickViewModalProps {
  product: ShopifyProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QuickViewModal = ({ product, open, onOpenChange }: QuickViewModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const isBuyingNow = useCartStore((s) => s.isBuyingNow);
  const buyNow = useCartStore((s) => s.buyNow);
  const addItem = useCartStore((s) => s.addItem);
  const isCartLoading = useCartStore((s) => s.isLoading);

  if (!product) return null;

  const { node } = product;
  const images = node.images.edges;
  const price = node.priceRange.minVariantPrice;
  const compareAtPrice = node.compareAtPriceRange?.maxVariantPrice;
  const isOnSale = compareAtPrice && parseFloat(compareAtPrice.amount) > parseFloat(price.amount);
  const selectedVariant = node.variants.edges[selectedVariantIndex]?.node;
  const availableVariants = node.variants.edges.filter((v) => v.node.availableForSale).length;
  const inStock = availableVariants > 0;
  const lengthOption = node.options?.find((opt) => opt.name.toLowerCase() === "length");

  const getCartItem = () => ({
    product,
    variantId: selectedVariant!.id,
    variantTitle: selectedVariant!.title,
    price: selectedVariant!.price,
    quantity: 1,
    selectedOptions: selectedVariant!.selectedOptions || [],
  });

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    await addItem(getCartItem());
    toast.success("Added to cart!", { description: node.title });
  };

  const handleBuyNow = async () => {
    if (!selectedVariant) return;
    await buyNow(getCartItem());
  };

  const nextImage = () => setCurrentImageIndex((i) => (i + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((i) => (i - 1 + images.length) % images.length);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Gallery */}
          <div className="relative aspect-square bg-secondary/30">
            {images.length > 0 ? (
              <img
                src={images[currentImageIndex]?.node.url}
                alt={images[currentImageIndex]?.node.altText || node.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-muted-foreground">No Image</span>
              </div>
            )}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.slice(0, 6).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIndex(i)}
                      className={`w-2 h-2 rounded-full transition-all ${i === currentImageIndex ? "bg-primary w-5" : "bg-background/60"}`}
                    />
                  ))}
                </div>
              </>
            )}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {inStock ? (
                <Badge className="bg-primary/95 text-primary-foreground text-xs">
                  <Check className="w-3 h-3 mr-1" />
                  In Stock
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">Sold Out</Badge>
              )}
              {isOnSale && (
                <Badge className="bg-destructive/90 text-destructive-foreground text-xs">Sale</Badge>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="p-6 flex flex-col gap-4 max-h-[500px] overflow-y-auto">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground leading-tight mb-2">
                {node.title}
              </h2>
              <p className="text-muted-foreground text-sm line-clamp-3">
                {getCardDescription({
                  title: node.title,
                  productType: node.productType,
                  tags: node.tags,
                  description: node.description,
                  options: node.options,
                })}
              </p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="font-display text-2xl font-bold text-primary">
                ${parseFloat(selectedVariant?.price.amount || price.amount).toFixed(2)}
              </span>
              {isOnSale && (
                <span className="text-sm text-muted-foreground line-through">
                  ${parseFloat(compareAtPrice.amount).toFixed(2)}
                </span>
              )}
            </div>

            {/* Length Options */}
            {lengthOption && lengthOption.values.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm font-medium text-foreground">Length</span>
                <div className="flex flex-wrap gap-1.5">
                  {lengthOption.values.map((length) => {
                    const variantIdx = node.variants.edges.findIndex((v) =>
                      v.node.selectedOptions?.some(
                        (opt) => opt.name.toLowerCase() === "length" && opt.value === length
                      )
                    );
                    const isSelected = variantIdx === selectedVariantIndex;
                    const variant = node.variants.edges[variantIdx]?.node;
                    return (
                      <button
                        key={length}
                        onClick={() => variantIdx >= 0 && setSelectedVariantIndex(variantIdx)}
                        disabled={variant && !variant.availableForSale}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary font-semibold"
                            : variant?.availableForSale
                            ? "border-border/50 text-foreground hover:border-primary/50"
                            : "border-border/30 text-muted-foreground/50 cursor-not-allowed line-through"
                        }`}
                      >
                        {length}"
                        {variant && (
                          <span className="ml-1 text-primary font-semibold">
                            ${parseFloat(variant.price.amount).toFixed(0)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-auto pt-4">
              <Button
                onClick={handleAddToCart}
                disabled={isCartLoading || !selectedVariant?.availableForSale}
                variant="outline"
                className="flex-1 border-primary text-primary hover:bg-primary/10 h-11"
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
                onClick={handleBuyNow}
                disabled={isBuyingNow || !selectedVariant?.availableForSale}
                className="flex-1 bg-gradient-gold hover:opacity-90 text-espresso shadow-glow h-11"
              >
                {isBuyingNow ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-1.5" />
                    Buy Now
                  </>
                )}
              </Button>
            </div>

            {/* View Full Details Link */}
            <Link
              to={`/product/${node.handle}`}
              onClick={() => onOpenChange(false)}
              className="flex items-center justify-center gap-1.5 text-sm text-primary font-medium hover:underline"
            >
              View Full Details
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
