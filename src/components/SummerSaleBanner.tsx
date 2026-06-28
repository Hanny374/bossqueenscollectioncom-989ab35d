import { useEffect, useState } from "react";
import { X, Check, Copy, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "bqc_summer15_unlocked";

export const SummerSaleBanner = () => {
  const [open, setOpen] = useState(true);
  const [modal, setModal] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) === "1") {
      setUnlocked(true);
    }
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
      await supabase.from("email_captures").insert({ email: trimmed, source: "summer15" });
      supabase.functions
        .invoke("sync-mailchimp", { body: { email: trimmed } })
        .catch((err) => console.error("Mailchimp sync error:", err));
      localStorage.setItem(STORAGE_KEY, "1");
      setUnlocked(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText("SUMMER15");
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* noop */
    }
  };

  if (!open) return null;

  return (
    <>
    <div
      className="relative w-full overflow-hidden text-white"
      style={{
        backgroundImage:
          "linear-gradient(90deg, #0EA5A4 0%, #14B8A6 25%, #F59E0B 55%, #FB7185 85%, #EC4899 100%)",
      }}
    >
      {/* Sun shimmer */}
      <div className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay bg-[radial-gradient(circle_at_20%_50%,#FDE68A_0%,transparent_45%),radial-gradient(circle_at_80%_50%,#FBCFE8_0%,transparent_45%)]" />
      <button
        type="button"
        onClick={() => (unlocked ? copyCode() : setModal(true))}
        className="relative flex w-full items-center justify-center gap-2 px-10 py-2 text-center text-xs sm:text-sm font-semibold tracking-wide cursor-pointer"
      >
        <span aria-hidden className="text-base leading-none">🌴</span>
        <span aria-hidden className="text-base leading-none">🌺</span>
        {unlocked ? (
          <span className="drop-shadow-[0_1px_0_rgba(0,0,0,0.25)]">
            Summer Special — <strong>15% OFF</strong> · Code{" "}
            <strong>SUMMER15</strong>{" "}
            {copied ? (
              <span className="inline-flex items-center gap-1"><Check className="h-3 w-3" /> Copied!</span>
            ) : (
              <span className="inline-flex items-center gap-1 underline underline-offset-2"><Copy className="h-3 w-3" /> Tap to copy</span>
            )}
          </span>
        ) : (
          <span className="drop-shadow-[0_1px_0_rgba(0,0,0,0.25)]">
            Summer Special — <strong>15% OFF</strong> your first order ·{" "}
            <span className="underline underline-offset-2">Tap to unlock your code</span> · Free shipping over $300
          </span>
        )}
        <span aria-hidden className="text-base leading-none">🍍</span>
        <span aria-hidden className="text-base leading-none">🌴</span>
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Dismiss summer sale banner"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-white/20 transition"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>

    {modal && (
      <div
        className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={() => setModal(false)}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md rounded-2xl bg-gradient-to-br from-background via-background to-secondary/30 border border-primary/20 shadow-2xl p-8 text-center"
        >
          <button
            type="button"
            onClick={() => setModal(false)}
            aria-label="Close"
            className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground hover:bg-muted transition"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="mx-auto mb-3 inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-display text-2xl font-bold text-foreground">
            Unlock 15% OFF, Queen
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Drop your email and we'll reveal your <strong>SUMMER15</strong> code instantly. No spam — just exclusive drops.
          </p>

          {unlocked ? (
            <div className="mt-5">
              <div className="rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 px-4 py-4">
                <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Your code</div>
                <div className="mt-1 font-display text-3xl font-bold tracking-widest text-primary">SUMMER15</div>
              </div>
              <button
                type="button"
                onClick={copyCode}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition"
              >
                {copied ? <><Check className="h-4 w-4" /> Copied!</> : <><Copy className="h-4 w-4" /> Copy code</>}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
                className="w-full rounded-full border border-border bg-background px-5 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition disabled:opacity-60"
              >
                {loading ? "Unlocking…" : "Reveal my code"}
              </button>
              <p className="text-[10px] text-muted-foreground">
                By submitting, you agree to receive marketing emails. Unsubscribe anytime.
              </p>
            </form>
          )}
        </div>
      </div>
    )}
    </>
  );
};