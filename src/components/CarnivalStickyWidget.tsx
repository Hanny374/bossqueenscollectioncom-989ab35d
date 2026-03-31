import { useState, useEffect } from "react";
import { X, PartyPopper, Sparkles, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const CarnivalStickyWidget = () => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    return sessionStorage.getItem("carnival-widget-dismissed") === "true";
  });

  // Show after scrolling 200px (earlier visibility)
  useEffect(() => {
    if (dismissed) return;
    const onScroll = () => setVisible(window.scrollY > 200);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismissed]);

  const dismiss = () => {
    setDismissed(true);
    setVisible(false);
    sessionStorage.setItem("carnival-widget-dismissed", "true");
  };

  const copyCode = () => {
    navigator.clipboard.writeText("CARNIVAL20");
    toast.success("Code CARNIVAL20 copied! 🎉");
  };

  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={dismiss}
          />
          {/* Centered popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-[360px] max-w-full">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-yellow-300/60">
                {/* Pulsing glow ring */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary via-[hsl(50,90%,55%)] to-primary opacity-50 blur-md animate-pulse pointer-events-none" />

                <div className="relative bg-gradient-to-br from-primary via-[hsl(20,85%,50%)] to-[hsl(50,90%,50%)] p-6">
                  <button
                    onClick={dismiss}
                    className="absolute top-2.5 right-2.5 text-primary-foreground/60 hover:text-primary-foreground transition-colors rounded-full hover:bg-primary-foreground/20 p-1"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Header with confetti animation */}
                  <div className="flex items-center gap-2 mb-2">
                    <motion.div
                      animate={{ rotate: [0, -15, 15, 0] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    >
                      <PartyPopper className="w-7 h-7 text-yellow-200 drop-shadow-lg" />
                    </motion.div>
                    <span className="text-primary-foreground font-extrabold text-lg tracking-wide uppercase drop-shadow-md">
                      🎭 Carnival Sale
                    </span>
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <Sparkles className="w-5 h-5 text-yellow-200 drop-shadow-lg" />
                    </motion.div>
                  </div>

                  <p className="text-primary-foreground text-base leading-relaxed mb-4 font-medium">
                    Celebrate Caribbean style! Get{" "}
                    <span className="font-black text-yellow-200 text-xl">20% OFF</span>{" "}
                    your entire order 🎉
                  </p>

                  {/* Prominent code button */}
                  <motion.button
                    onClick={copyCode}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full bg-background hover:bg-secondary text-primary font-black text-lg py-3.5 rounded-xl transition-colors flex items-center justify-center gap-3 shadow-lg border-2 border-dashed border-primary/40"
                  >
                    <span className="tracking-widest">CARNIVAL20</span>
                    <Copy className="w-4 h-4 opacity-60" />
                  </motion.button>
                  <p className="text-primary-foreground/70 text-xs text-center mt-2 tracking-wide">
                    Tap to copy · Apply at checkout
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
