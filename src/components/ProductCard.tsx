import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { getCardDescription } from "@/lib/productSalesCopy";
import { Loader2, Check, Ruler, Palette, Eye, Zap, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { QuickViewModal } from "./QuickViewModal";

interface ProductCardProps {
  product: ShopifyProduct;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { node } = product;
  const [isHovered, setIsHovered] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [selectedDensity, setSelectedDensity] = useState<string>("200%");
  const isBuyingNow = useCartStore(state => state.isBuyingNow);
  const buyNow = useCartStore(state => state.buyNow);
  const addItem = useCartStore(state => state.addItem);
  const isCartLoading = useCartStore(state => state.isLoading);
  
  const image = node.images.edges[0]?.node;
  const secondImage = node.images.edges[1]?.node;
  const price = node.priceRange.minVariantPrice;
  const compareAtPrice = node.compareAtPriceRange?.maxVariantPrice;
  const isOnSale = compareAtPrice && parseFloat(compareAtPrice.amount) > parseFloat(price.amount);
  const firstVariant = node.variants.edges[0]?.node;
  
  const lengthOption = node.options?.find(opt => opt.name.toLowerCase() === 'length');
  const colorOption = node.options?.find(opt => opt.name.toLowerCase() === 'color');
  const variantCount = node.variants.edges.length;
  const availableVariants = node.variants.edges.filter(v => v.node.availableForSale).length;
  const inStock = availableVariants > 0;

  const getCartItem = () => ({
    product,
    variantId: firstVariant!.id,
    variantTitle: firstVariant!.title,
    price: firstVariant!.price,
    quantity: 1,
    selectedOptions: firstVariant!.selectedOptions || []
  });

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!firstVariant) return;
    await addItem(getCartItem());
    toast.success("Added to cart!", { description: node.title });
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!firstVariant) return;
    await buyNow(getCartItem());
  };

  return (
    <Link 
      to={`/product/${node.handle}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-secondary/30 shadow-soft hover-lift shine-effect">
        {image ? (
          <img
            src={image.url}
            alt={image.altText || node.title}
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

        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickViewOpen(true); }}
            className="flex items-center gap-1 bg-background/95 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium text-foreground shadow-soft hover:bg-background transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            Quick View
          </button>
        </div>
        
        <div className="absolute bottom-4 left-4 right-4 opacity-0 translate-y-3 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 z-10 flex gap-2">
          <Button
            onClick={handleAddToCart}
            disabled={isCartLoading || !firstVariant?.availableForSale}
            variant="outline"
            className="flex-1 bg-background/95 backdrop-blur-sm border-primary text-primary hover:bg-primary/10 h-11"
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
            disabled={isBuyingNow || !firstVariant?.availableForSale}
            className="flex-1 bg-gradient-gold hover:opacity-90 text-espresso shadow-glow h-11"
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

      <div className="mt-4 space-y-2">
        <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {node.title}
        </h3>
        
        <p className="text-muted-foreground text-sm line-clamp-2">
          {getCardDescription({ title: node.title, productType: node.productType, tags: node.tags, description: node.description, options: node.options })}
        </p>
        
        {colorOption && colorOption.values.length > 0 && (
          <div className="flex items-center gap-2">
            <Palette className="w-3.5 h-3.5 text-primary" />
            <span className="text-sm text-foreground font-medium">
              {colorOption.values.slice(0, 3).join(', ')}{colorOption.values.length > 3 ? ` +${colorOption.values.length - 3}` : ''}
            </span>
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
                    opt.name.toLowerCase() === 'length' && opt.value === length
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
                        ${parseFloat(variantPrice).toFixed(0)}
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

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-1.5">
            {variantCount > 1 && (
              <span className="text-xs text-muted-foreground">from</span>
            )}
            <p className="font-display font-bold text-xl text-primary">
              ${parseFloat(price.amount).toFixed(2)}
            </p>
            {isOnSale && (
              <p className="text-sm text-muted-foreground line-through">
                ${parseFloat(compareAtPrice.amount).toFixed(2)}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};
