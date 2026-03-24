import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Copy, Check, Clock } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const STORAGE_KEY = "boss-queens-exit-intent-shown";
const EXIT_CODE = "STAYBOSS15";

export const ExitIntentPopup = () => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const hasShown = localStorage.getItem(STORAGE_KEY);
    if (hasShown) return;

    let triggered = false;

    const handleMouseLeave = (e: MouseEvent) => {
      if (triggered) return;
      // Only trigger when mouse moves to top of page (leaving)
      if (e.clientY <= 5 && e.relatedTarget === null) {
        triggered = true;
        setOpen(true);
        localStorage.setItem(STORAGE_KEY, "true");
      }
    };

    // Delay activation so it doesn't fire immediately
    const timer = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, 10000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(EXIT_CODE);
      setCopied(true);
      toast.success("Discount code copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy code");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md border-primary/20 overflow-hidden p-0">
        <div className="h-2 w-full bg-gradient-to-r from-destructive via-primary to-destructive" />

        <div className="p-6 pt-4 space-y-5">
          <DialogHeader className="space-y-3 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
              className="mx-auto"
            >
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8 text-destructive" />
              </div>
            </motion.div>
            <DialogTitle className="font-display text-2xl">
              Wait, Queen! Don't Leave Yet! 👑
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              Here's an exclusive <span className="font-bold text-primary">15% off</span> just for you — but hurry, this won't last!
            </DialogDescription>
          </DialogHeader>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-secondary/50 border-2 border-dashed border-primary/30">
              <Crown className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="font-display text-2xl font-bold tracking-widest text-foreground">
                {EXIT_CODE}
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
            Limited time only · Apply at checkout · One-time use
          </p>

          <div className="flex flex-col gap-2">
            <Button
              onClick={() => { handleCopy(); setOpen(false); }}
              className="w-full bg-gradient-gold hover:opacity-90 text-primary-foreground shadow-gold"
              size="lg"
            >
              <Copy className="w-4 h-4 mr-2" />
              Claim My 15% Off
            </Button>
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              className="w-full text-muted-foreground text-sm"
            >
              No thanks, I'll pass
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
