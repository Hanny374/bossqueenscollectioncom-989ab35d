import { useEffect, useRef } from "react";
import { Star, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LooxReviewsProps {
  productId: string; // Shopify product GID e.g. "gid://shopify/Product/123"
}

/**
 * Renders the Loox product reviews widget for a given Shopify product.
 * The Loox script is loaded globally in index.html.
 */
export const LooxReviews = ({ productId }: LooxReviewsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract numeric ID from Shopify GID
  const numericId = productId.replace(/^gid:\/\/shopify\/Product\//, "");

  useEffect(() => {
    // Re-initialize the Loox widget when the product changes
    const win = window as any;
    if (win.loox) {
      win.loox.init?.();
    }
  }, [numericId]);

  const handleWriteReview = () => {
    // Loox uses this method to open the review form
    const win = window as any;
    if (win.loox?.openReviewForm) {
      win.loox.openReviewForm(numericId);
    } else {
      // Fallback: scroll to the widget area where Loox renders its form
      containerRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div ref={containerRef} className="mt-12 pt-8 border-t border-border">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
          Customer Reviews
        </h2>
        <Button
          onClick={handleWriteReview}
          className="bg-gradient-gold hover:opacity-90 text-espresso shadow-glow font-semibold"
        >
          <PenLine className="w-4 h-4 mr-2" />
          Write a Review
        </Button>
      </div>

      {/* Loox widget target - the script auto-detects this element */}
      <div
        id="looxReviews"
        data-product-id={numericId}
        className="loox-reviews-default"
      />

      {/* Fallback empty state when Loox hasn't loaded */}
      <div className="loox-empty-fallback text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Star className="w-8 h-8 text-primary" />
        </div>
        <p className="text-muted-foreground text-lg mb-2">No reviews yet</p>
        <p className="text-muted-foreground text-sm mb-6">
          Be the first to share your experience!
        </p>
        <Button
          onClick={handleWriteReview}
          variant="outline"
          className="border-primary text-primary hover:bg-primary/10"
        >
          <PenLine className="w-4 h-4 mr-2" />
          Leave a Review
        </Button>
      </div>
    </div>
  );
};
