import { useState } from "react";
import { Link } from "react-router-dom";
import { Sun, X } from "lucide-react";

export const SummerSaleBanner = () => {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  return (
    <div className="relative w-full bg-gradient-to-r from-primary via-amber-400 to-primary text-espresso">
      <Link
        to="/#products"
        className="flex items-center justify-center gap-2 px-10 py-2 text-center text-xs sm:text-sm font-semibold tracking-wide"
      >
        <Sun className="h-4 w-4 shrink-0" />
        <span>
          Summer Sale — Up to <strong>30% OFF</strong> sitewide · Use code{" "}
          <strong>SUMMER30</strong> · Free worldwide shipping over $100
        </span>
      </Link>
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Dismiss summer sale banner"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-espresso/10 transition"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};