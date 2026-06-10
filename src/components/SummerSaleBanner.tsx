import { useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

export const SummerSaleBanner = () => {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  return (
    <div
      className="relative w-full overflow-hidden text-white"
      style={{
        backgroundImage:
          "linear-gradient(90deg, #0EA5A4 0%, #14B8A6 25%, #F59E0B 55%, #FB7185 85%, #EC4899 100%)",
      }}
    >
      {/* Sun shimmer */}
      <div className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay bg-[radial-gradient(circle_at_20%_50%,#FDE68A_0%,transparent_45%),radial-gradient(circle_at_80%_50%,#FBCFE8_0%,transparent_45%)]" />
      <Link
        to="/#products"
        className="relative flex items-center justify-center gap-2 px-10 py-2 text-center text-xs sm:text-sm font-semibold tracking-wide"
      >
        <span aria-hidden className="text-base leading-none">🌴</span>
        <span aria-hidden className="text-base leading-none">🌺</span>
        <span className="drop-shadow-[0_1px_0_rgba(0,0,0,0.25)]">
          Launch Special — <strong>15% OFF</strong> your first order · Code{" "}
          <strong>FIRST15</strong> · Free shipping over $100
        </span>
        <span aria-hidden className="text-base leading-none">🍍</span>
        <span aria-hidden className="text-base leading-none">🌴</span>
      </Link>
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Dismiss summer sale banner"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-white/20 transition"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};