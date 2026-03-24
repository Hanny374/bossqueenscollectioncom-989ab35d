import { useEffect, useRef } from "react";

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

  return (
    <div ref={containerRef} className="mt-12 pt-8 border-t border-border">
      <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
        Customer Reviews
      </h2>
      {/* Loox widget target - the script auto-detects this element */}
      <div
        id="looxReviews"
        data-product-id={numericId}
        className="loox-reviews-default"
      />
    </div>
  );
};
