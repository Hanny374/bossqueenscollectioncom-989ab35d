import { useState } from "react";
import { X, PartyPopper, Sparkles, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const CarnivalStickyWidget = () => {
  const [dismissed, setDismissed] = useState(() => {
    return sessionStorage.getItem("carnival-widget-dismissed") === "true";
  });

  const dismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDismissed(true);
    sessionStorage.setItem("carnival-widget-dismissed", "true");
  };

  const copyCode = () => {
    navigator.clipboard.writeText("CARNIVAL20");
    toast.success("Code CARNIVAL20 copied! 🎉");
  };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: "spring", damping: 20, stiffness: 200 }}
          className="fixed bottom-20 left-4 z-40 w-[300px] max-w-[calc(100vw-2rem)]"
        >
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-yellow-300/60">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary via-[hsl(50,90%,55%)] to-primary opacity-50 blur-md animate-pulse pointer-events-none" />

            <div className="relative bg-gradient-to-br from-primary via-[hsl(20,85%,50%)] to-[hsl(50,90%,50%)] p-4">
              <button
                onClick={dismiss}
                className="absolute top-2 right-2 z-20 text-primary-foreground/60 hover:text-primary-foreground transition-colors rounded-full hover:bg-primary-foreground/20 p-2 min-w-[32px] min-h-[32px] flex items-center justify-center"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-1.5">
                <motion.div
                  animate={{ rotate: [0, -15, 15, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                >
                  <PartyPopper className="w-5 h-5 text-yellow-200 drop-shadow-lg" />
                </motion.div>
                <span className="text-primary-foreground font-extrabold text-sm tracking-wide uppercase drop-shadow-md">
                  🎭 Carnival Sale
                </span>
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <Sparkles className="w-4 h-4 text-yellow-200 drop-shadow-lg" />
                </motion.div>
              </div>

              <p className="text-primary-foreground text-sm leading-snug mb-3 font-medium">
                Get <span className="font-black text-yellow-200 text-base">20% OFF</span> your entire order 🎉
              </p>

              <motion.button
                onClick={copyCode}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full bg-background hover:bg-secondary text-primary font-black text-sm py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg border-2 border-dashed border-primary/40"
              >
                <span className="tracking-widest">CARNIVAL20</span>
                <Copy className="w-3.5 h-3.5 opacity-60" />
              </motion.button>
              <p className="text-primary-foreground/70 text-[10px] text-center mt-1.5 tracking-wide">
                Tap to copy · Apply at checkout
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
