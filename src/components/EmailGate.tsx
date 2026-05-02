import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Crown, Sparkles, X } from "lucide-react";

const STORAGE_KEY = "bqc_email_captured";
const SHOW_DELAY_MS = 20000; // Wait 20s before showing — let visitors browse first

export const EmailGate = () => {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const captured = localStorage.getItem(STORAGE_KEY);
    if (captured) return;

    // Delay popup so visitors can browse products first (better conversions)
    const timer = window.setTimeout(() => {
      setShow(true);
      document.body.style.overflow = "hidden";
    }, SHOW_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await supabase.from("email_captures").insert({ email: trimmed, source: "gate" });
      // Sync to Mailchimp in background (don't block the UI)
      supabase.functions.invoke("sync-mailchimp", {
        body: { email: trimmed },
      }).catch((err) => console.error("Mailchimp sync error:", err));
      localStorage.setItem(STORAGE_KEY, "1");
      document.body.style.overflow = "";
      setShow(false);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
            className="relative w-full max-w-md rounded-2xl bg-gradient-to-br from-background via-background to-secondary/30 border border-primary/20 shadow-2xl p-8 text-center"
          >
            {/* Close button */}
            <button
              onClick={() => {
                localStorage.setItem(STORAGE_KEY, "1");
                document.body.style.overflow = "";
                setShow(false);
              }}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex justify-center mb-4">
              <div className="relative">
                <Crown className="w-12 h-12 text-primary" />
                <Sparkles className="w-5 h-5 text-primary absolute -top-1 -right-2 animate-pulse" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-2">
              Welcome, Queen! 👑
            </h2>
            <p className="text-muted-foreground mb-6 text-sm">
              Enter your email to unlock exclusive deals, new arrivals & VIP access to our collection.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-center text-base"
                  disabled={loading}
                />
                {error && (
                  <p className="text-destructive text-xs mt-2">{error}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity disabled:opacity-50 shadow-glow"
              >
                {loading ? "Please wait..." : "Unlock the Collection ✨"}
              </button>
            </form>

            <p className="text-muted-foreground/60 text-[10px] mt-4">
              We respect your privacy. Unsubscribe anytime.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EmailGate;
