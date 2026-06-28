import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Crown, Sparkles, Check, Gift, Zap, Star } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { fetchProductByHandle, getMarkup } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ClubChat } from "@/components/ClubChat";

const HAIR_CLUB_HANDLE = "boss-queens-hair-club-membership";

const benefits = [
  { icon: Crown, title: "1 Premium Bundle / Month", desc: "Hand-picked Grade 10A virgin human hair shipped to your door every month." },
  { icon: Zap, title: "Priority Access to New Drops", desc: "Shop limited textures and colors 48 hours before the public — never miss a launch." },
  { icon: Gift, title: "10% Off Every Purchase", desc: "Use code HAIRCLUB10 sitewide on wigs, bundles, and accessories. Stack the savings." },
  { icon: Sparkles, title: "Exclusive Member-Only Deals", desc: "Surprise drops, free upgrades, and birthday gifts reserved for the Club." },
];

const faqs = [
  { q: "How does the monthly bundle work?", a: "Every month we ship one curated Grade 10A virgin human hair bundle ($150 value+) to your door. Free worldwide shipping included." },
  { q: "Can I cancel anytime?", a: "Yes. Cancel or pause your membership any time from your account — no penalties, no questions." },
  { q: "How do I use the 10% off code?", a: "Once you join, use HAIRCLUB10 at checkout on any product. Works on wigs, bundles, and accessories." },
  { q: "When will my first bundle ship?", a: "Bundles ship within 3–5 business days of your monthly billing date." },
  { q: "Do I pick the texture?", a: "Yes — after joining, you'll get a quick style quiz to pick your preferred length, texture (straight, body wave, deep wave, curly), and color." },
];

export default function HairClubPage() {
  const buyNow = useCartStore((s) => s.buyNow);
  const isBuyingNow = useCartStore((s) => s.isBuyingNow);
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = async () => {
    setIsLoading(true);
    try {
      const product = await fetchProductByHandle(HAIR_CLUB_HANDLE);
      const variant = product?.variants.edges[0]?.node;
      if (!product || !variant) {
        toast.error("Membership unavailable right now. Please try again later.");
        return;
      }
      await buyNow({
        product: { node: product },
        variantId: variant.id,
        variantTitle: variant.title,
        price: {
          amount: (parseFloat(variant.price.amount) + getMarkup(product.tags)).toFixed(2),
          currencyCode: variant.price.currencyCode,
        },
        quantity: 1,
        selectedOptions: variant.selectedOptions || [],
      });
    } catch (err) {
      console.error(err);
      toast.error("Could not start checkout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const busy = isLoading || isBuyingNow;

  return (
    <>
      <Helmet>
        <title>Boss Queens VIP Hair Club — $150/mo Bundle Membership</title>
        <meta name="description" content="Join the Boss Queens VIP Hair Club: 1 Grade 10A virgin hair bundle every month, priority access to new drops, 10% off everything, and exclusive member-only deals. $150/month." />
        <link rel="canonical" href="https://bossqueenscollection.com/hair-club" />
      </Helmet>

      <Header />

      <main className="bg-background">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-champagne">
          <div className="absolute inset-0 opacity-30 pointer-events-none [background:radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.25),transparent_60%),radial-gradient(circle_at_80%_60%,hsl(var(--primary)/0.18),transparent_55%)]" />
          <div className="container relative px-4 md:px-8 py-20 md:py-28 text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-background/60 backdrop-blur text-xs uppercase tracking-[0.25em] text-primary mb-6"
            >
              <Crown className="w-3.5 h-3.5" /> Membership · Invite Only
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground"
            >
              The Boss Queens<br />
              <span className="bg-gradient-gold bg-clip-text text-transparent">VIP Hair Club</span>
            </motion.h1>
            <p className="mt-6 max-w-2xl mx-auto text-base md:text-lg text-muted-foreground">
              Premium hair, delivered monthly. One Grade 10A virgin bundle, priority access to new drops, and 10% off every purchase — all for $150/month.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button onClick={handleJoin} disabled={busy} size="lg" className="bg-gradient-gold text-[hsl(25_40%_18%)] font-semibold shadow-glow hover:opacity-95 px-8 h-12 text-base">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join the Club — $150/mo"}
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-6">
                <a href="#benefits">See what's included</a>
              </Button>
            </div>

            <p className="mt-5 text-xs text-muted-foreground/80">Cancel anytime · Free worldwide shipping · 10% off sitewide with HAIRCLUB10</p>
          </div>
        </section>

        {/* Benefits */}
        <section id="benefits" className="container px-4 md:px-8 py-20">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">Member Perks</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-3">What you get every month</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 max-w-4xl mx-auto">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group rounded-2xl border border-border/60 bg-card p-6 md:p-7 hover:border-primary/40 hover:shadow-elevated transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary inline-flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <b.icon className="w-5 h-5" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">{b.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Value breakdown */}
        <section className="bg-secondary/40 border-y border-border/50 py-20">
          <div className="container px-4 md:px-8 max-w-3xl">
            <div className="rounded-3xl bg-card border border-primary/20 shadow-elevated p-8 md:p-12 text-center">
              <span className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">The Math</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold mt-3">$150/month. $400+ in value.</h2>
              <ul className="mt-8 space-y-3 text-left max-w-md mx-auto">
                {[
                  "1 Grade 10A virgin hair bundle ($150+ retail)",
                  "10% off every additional order (avg. $30/mo savings)",
                  "Free worldwide shipping on all orders",
                  "48-hour early access to new arrivals",
                  "Exclusive birthday gift + surprise drops",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground">{line}</span>
                  </li>
                ))}
              </ul>
              <Button onClick={handleJoin} disabled={busy} size="lg" className="mt-10 bg-gradient-gold text-[hsl(25_40%_18%)] font-semibold shadow-glow hover:opacity-95 px-8 h-12">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Become a Member"}
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonial / Trust */}
        <section className="container px-4 md:px-8 py-20 text-center">
          <div className="flex justify-center gap-1 mb-4 text-primary">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-primary" />)}
          </div>
          <p className="font-display text-xl md:text-2xl max-w-2xl mx-auto text-foreground italic">
            "The VIP Hair Club has changed my whole routine. New bundle every month, always premium quality. I never have to hunt for hair again."
          </p>
          <p className="mt-4 text-sm text-muted-foreground">— Verified Club Member</p>
        </section>

        {/* FAQ */}
        <section className="container px-4 md:px-8 pb-24 max-w-3xl">
          <div className="text-center mb-10">
            <span className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">FAQ</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-3">Questions, answered</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((f) => (
              <details key={f.q} className="group rounded-xl border border-border/60 bg-card p-5 open:shadow-soft transition-shadow">
                <summary className="cursor-pointer list-none flex items-center justify-between gap-4 font-semibold text-foreground">
                  {f.q}
                  <span className="text-primary text-xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button onClick={handleJoin} disabled={busy} size="lg" className="bg-gradient-gold text-[hsl(25_40%_18%)] font-semibold shadow-glow hover:opacity-95 px-8 h-12">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join the VIP Hair Club"}
            </Button>
          </div>
        </section>

        {/* Community Chat */}
        <ClubChat />
      </main>

      <Footer />
    </>
  );
}