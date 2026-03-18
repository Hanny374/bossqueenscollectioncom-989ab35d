import { Check, ShieldCheck } from "lucide-react";

interface VerifiedSellerBadgeProps {
  variant?: "default" | "compact" | "detailed";
  className?: string;
}

export const VerifiedSellerBadge = ({ 
  variant = "default", 
  className = "" 
}: VerifiedSellerBadgeProps) => {
  if (variant === "compact") {
    return (
      <div className={`inline-flex items-center gap-1.5 text-primary ${className}`}>
        <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary">
          <Check className="w-3 h-3 text-primary-foreground stroke-[3]" />
        </span>
        <span className="text-xs font-medium">Verified</span>
      </div>
    );
  }

  if (variant === "detailed") {
    return (
      <div className={`flex items-center gap-3 bg-gradient-to-r from-primary/10 to-accent/30 rounded-lg px-4 py-3 border border-primary/20 ${className}`}>
        <div className="flex-shrink-0">
          <ShieldCheck className="w-8 h-8 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            Verified Seller
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary">
              <Check className="w-3 h-3 text-primary-foreground stroke-[3]" />
            </span>
          </span>
          <span className="text-xs text-muted-foreground">
            Trusted • Authentic Products • Secure Checkout
          </span>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`inline-flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-full border border-primary/20 ${className}`}>
      <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary">
        <Check className="w-3 h-3 text-primary-foreground stroke-[3]" />
      </span>
      <span className="text-xs font-semibold tracking-wide">Verified Seller</span>
    </div>
  );
};
