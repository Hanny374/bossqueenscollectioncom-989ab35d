import { useEffect, useRef, useState, useId } from "react";
import { X, Check, Copy, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "bqc_summer15_unlocked";

export const SummerSaleBanner = () => {
  const [open, setOpen] = useState(true);
  const [modal, setModal] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; retryable: boolean } | null>(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const [copied, setCopied] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) === "1") {
      setUnlocked(true);
    }
  }, []);

  // ESC to close + autofocus email field when modal opens
  useEffect(() => {
    if (!modal) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModal(false);
    };
    window.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => emailRef.current?.focus(), 80);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
      document.body.style.overflow = prevOverflow;
    };
  }, [modal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusMsg("");
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError({ message: "Please enter a valid email address.", retryable: false });
      setStatusMsg("Invalid email address. Please correct it and try again.");
      emailRef.current?.focus();
      return;
    }
    setLoading(true);
    setStatusMsg("Submitting your email…");
    try {
      const { error: insertError } = await supabase
        .from("email_captures")
        .insert({ email: trimmed, source: "summer15" });
      if (insertError) {
        const isDup = /duplicate|unique/i.test(insertError.message || "");
        if (!isDup) throw insertError;
      }
      supabase.functions
        .invoke("sync-mailchimp", { body: { email: trimmed } })
        .catch((err) => console.error("Mailchimp sync error:", err));
      localStorage.setItem(STORAGE_KEY, "1");
      setUnlocked(true);
      setStatusMsg("Success! Your discount code has been revealed.");
      setAttempts(0);
    } catch (err: any) {
      console.error("Email capture error:", err);
      setAttempts((n) => n + 1);
      const offline = typeof navigator !== "undefined" && navigator.onLine === false;
      const message = offline
        ? "You appear to be offline. Check your connection and retry."
        : "We couldn't save your email right now. Please try again.";
      setError({ message, retryable: true });
      setStatusMsg(`Error: ${message}`);
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
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
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
            aria-label="Close discount popup"
            className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="mx-auto mb-3 inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
            <Sparkles className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <h3 id={titleId} className="font-display text-2xl font-bold text-foreground">
            Unlock 15% OFF, Queen
          </h3>
          <p id={descId} className="mt-2 text-sm text-muted-foreground">
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
                aria-live="polite"
                className="mt-4 inline-flex w-full min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition"
              >
                {copied ? <><Check className="h-4 w-4" aria-hidden="true" /> Copied!</> : <><Copy className="h-4 w-4" aria-hidden="true" /> Copy code</>}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-5 space-y-3" noValidate>
              {/* Polite status updates for screen readers */}
              <div role="status" aria-live="polite" className="sr-only">
                {statusMsg}
              </div>
              <label htmlFor="summer15-email" className="sr-only">Email address</label>
              <input
                id="summer15-email"
                ref={emailRef}
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                placeholder="you@email.com"
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${descId}-err` : undefined}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                maxLength={255}
                className={`w-full min-h-11 rounded-full border bg-background px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                  error ? "border-destructive ring-1 ring-destructive/40" : "border-border"
                }`}
              />
              {error && (
                <div
                  id={`${descId}-err`}
                  role="alert"
                  aria-live="assertive"
                  className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-left text-xs text-destructive"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  <div className="flex-1">
                    <p className="font-medium">{error.message}</p>
                    {error.retryable && attempts >= 2 && (
                      <p className="mt-1 text-muted-foreground">
                        Still failing? Email us at{" "}
                        <a href="mailto:Bossqueenscollections@gmail.com" className="underline">
                          Bossqueenscollections@gmail.com
                        </a>{" "}
                        and we'll send your code.
                      </p>
                    )}
                  </div>
                </div>
              )}
              {error?.retryable && (
                <button
                  type="button"
                  onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
                  disabled={loading}
                  className="inline-flex w-full min-h-11 items-center justify-center gap-2 rounded-full border border-primary/40 bg-background px-6 py-3 text-sm font-semibold text-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition disabled:opacity-60"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
                  {loading ? "Retrying…" : "Retry"}
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition disabled:opacity-60"
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