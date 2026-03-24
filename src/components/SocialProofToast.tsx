import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { ShoppingBag } from "lucide-react";

const FIRST_NAMES = [
  "Sarah", "Ashley", "Jessica", "Tiffany", "Aaliyah", "Jasmine",
  "Diamond", "Crystal", "Nikki", "Brianna", "Destiny", "Amber",
  "Kayla", "Maya", "Zara", "Naomi", "Keisha", "Tyra", "Imani", "Lena",
];

const LOCATIONS = [
  "New York, NY", "Atlanta, GA", "Houston, TX", "Miami, FL",
  "Chicago, IL", "Los Angeles, CA", "Dallas, TX", "Charlotte, NC",
  "Detroit, MI", "Philadelphia, PA", "London, UK", "Toronto, CA",
  "Lagos, NG", "Nairobi, KE", "Paris, FR",
];

const PRODUCTS = [
  "Body Wave Lace Front Wig", "Deep Wave Bob Wig", "Straight HD Lace Wig",
  "Water Wave Bundles", "Burgundy Lace Front Wig", "Blonde Highlight Wig",
  "Kinky Curly Wig", "Loose Deep Wave Wig", "613 Blonde Bob Wig",
];

const TIMES = ["2 minutes ago", "5 minutes ago", "just now", "8 minutes ago", "12 minutes ago"];

function random<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const SocialProofToast = () => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const show = () => {
      const name = random(FIRST_NAMES);
      const location = random(LOCATIONS);
      const product = random(PRODUCTS);
      const time = random(TIMES);

      toast(
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <ShoppingBag className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              {name} from {location}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              purchased <span className="font-medium text-foreground">{product}</span>
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{time}</p>
          </div>
        </div>,
        {
          duration: 4000,
          position: "bottom-left",
          className: "!bg-card !border-border !shadow-lg",
        }
      );

      // Schedule next one 15-45 seconds later
      const delay = 15000 + Math.random() * 30000;
      timerRef.current = setTimeout(show, delay);
    };

    // First toast after 8-15 seconds
    timerRef.current = setTimeout(show, 8000 + Math.random() * 7000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return null;
};
