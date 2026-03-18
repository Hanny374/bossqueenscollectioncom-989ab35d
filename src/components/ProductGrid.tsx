import { ShopifyProduct } from "@/lib/shopify";
import { ProductCard } from "./ProductCard";
import { Loader2, Package } from "lucide-react";

interface ProductGridProps {
  products: ShopifyProduct[];
  isLoading?: boolean;
}

export const ProductGrid = ({ products, isLoading }: ProductGridProps) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="w-6 h-6 text-primary animate-pulse" />
          </div>
        </div>
        <p className="text-muted-foreground font-medium">Loading products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-secondary/50 mb-6">
          <Package className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="font-display text-2xl font-semibold text-foreground mb-3">No products found</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          We're working on adding new products. Check back soon for our latest collection!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 stagger-animation">
      {products.map((product) => (
        <ProductCard key={product.node.id} product={product} />
      ))}
    </div>
  );
};
