import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Gift, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const WELCOME_CODE = "WELCOME10";
const STORAGE_KEY = "boss-queens-welcome-shown";

export const WelcomePopup = () => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem(STORAGE_KEY);
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => setOpen(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(WELCOME_CODE);
      setCopied(true);
      toast.success("Discount code copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy code");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-md border-primary/20 overflow-hidden p-0">
        {/* Decorative top gradient */}
        <div className="h-2 w-full bg-gradient-gold" />
        
        <div className="p-6 pt-4 space-y-5">
          <DialogHeader className="space-y-3 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
              className="mx-auto"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Gift className="w-8 h-8 text-primary" />
              </div>
            </motion.div>
            <DialogTitle className="font-display text-2xl">
              Welcome, Queen! 👑
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              Get <span className="font-bold text-primary">10% off</span> your first order with our exclusive welcome code
            </DialogDescription>
          </DialogHeader>

          {/* Discount Code */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-secondary/50 border-2 border-dashed border-primary/30">
              <Crown className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="font-display text-2xl font-bold tracking-widest text-foreground">
                {WELCOME_CODE}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="h-8 w-8 flex-shrink-0 hover:bg-primary/10"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </motion.div>

          <p className="text-xs text-center text-muted-foreground">
            Apply at checkout · One-time use · Valid for all products
          </p>

          <div className="flex flex-col gap-2">
            <Button
              onClick={() => { handleCopy(); handleClose(); }}
              className="w-full bg-gradient-gold hover:opacity-90 text-primary-foreground shadow-gold"
              size="lg"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Code & Start Shopping
            </Button>
            <Button
              variant="ghost"
              onClick={handleClose}
              className="w-full text-muted-foreground text-sm"
            >
              No thanks, I'll pay full price
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
