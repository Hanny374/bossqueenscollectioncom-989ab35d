import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";

export const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-[60] bg-card border border-border/60 rounded-2xl p-5 shadow-lg"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Cookie className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-sm font-bold text-foreground mb-1">
                We use cookies
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed mb-3">
                We use cookies to enhance your browsing experience and analyze site traffic. By clicking "Accept", you consent to our use of cookies. Learn more in our{" "}
                <a href="/privacy-policy" className="underline text-foreground hover:text-primary transition-colors">Privacy Policy</a>.
              </p>
              <div className="flex items-center gap-2">
                <Button onClick={accept} size="sm" className="text-xs h-8 px-4">
                  Accept
                </Button>
                <Button onClick={decline} variant="ghost" size="sm" className="text-xs h-8 px-4 text-muted-foreground">
                  Decline
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
