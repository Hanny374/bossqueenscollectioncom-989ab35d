import { useState, useEffect } from "react";
import { X, PartyPopper, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const CarnivalStickyWidget = () => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    return sessionStorage.getItem("carnival-widget-dismissed") === "true";
  });

  // Show after scrolling 400px
  useEffect(() => {
    if (dismissed) return;
    const onScroll = () => setVisible(window.scrollY > 400);
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
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 200 }}
          className="fixed bottom-24 md:bottom-6 right-4 z-30 max-w-[280px]"
        >
          <div className="relative rounded-2xl overflow-hidden shadow-elevated border border-primary/20">
            {/* Vibrant carnival gradient */}
            <div className="bg-gradient-to-br from-[hsl(340,80%,55%)] via-[hsl(30,90%,55%)] to-[hsl(50,90%,55%)] p-4">
              <button
                onClick={dismiss}
                className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <PartyPopper className="w-5 h-5 text-white" />
                <span className="text-white font-bold text-sm tracking-wide uppercase">
                  Carnival Sale
                </span>
                <Sparkles className="w-4 h-4 text-yellow-200" />
              </div>

              <p className="text-white/90 text-xs leading-relaxed mb-3">
                Celebrate Caribbean style! Get <span className="font-bold text-white">20% off</span> your order 🎭
              </p>

              <button
                onClick={copyCode}
                className="w-full bg-white/95 hover:bg-white text-[hsl(340,80%,40%)] font-bold text-sm py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <span>CARNIVAL20</span>
                <span className="text-[10px] font-normal opacity-70">tap to copy</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
