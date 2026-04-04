import { useState } from "react";
import { X, Egg, Gift } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const EasterBanner = () => {
  const [visible, setVisible] = useState(() => {
    return sessionStorage.getItem("easter-banner-dismissed") !== "true";
  });

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem("easter-banner-dismissed", "true");
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden"
        >
          <div className="bg-gradient-to-r from-[hsl(330,60%,92%)] via-[hsl(280,50%,92%)] to-[hsl(200,60%,90%)] py-3 px-4">
            <div className="container flex items-center justify-center gap-3 text-center">
              <Egg className="w-5 h-5 text-[hsl(330,50%,55%)] shrink-0 hidden sm:block" />
              <p className="text-sm font-semibold text-[hsl(280,30%,25%)]">
                🐣 Easter Sale! Use code{" "}
                <span
                  className="inline-block bg-[hsl(280,40%,98%)] border border-[hsl(280,40%,80%)] text-[hsl(330,50%,45%)] font-bold px-2 py-0.5 rounded-md mx-1 cursor-pointer hover:bg-[hsl(280,40%,95%)] transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText("EASTER25");
                    import("sonner").then(({ toast }) => toast.success("Code copied!"));
                  }}
                >
                  EASTER25
                </span>{" "}
                for 25% off everything 🌸
              </p>
              <Gift className="w-5 h-5 text-[hsl(200,50%,55%)] shrink-0 hidden sm:block" />
              <button
                onClick={dismiss}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(280,20%,50%)] hover:text-[hsl(280,20%,30%)] transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
