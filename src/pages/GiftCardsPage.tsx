import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Gift,
  Scissors,
  BookOpen,
  Sparkles,
  Briefcase,
  Heart,
  IdCard,
  Mail,
  Crown,
  Check,
  ArrowRight,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

const serviceCards = [
  {
    icon: Scissors,
    title: "Hair Gift Card",
    tagline: "Wigs · Bundles · Frontals",
    desc: "Treat her to Grade 10A virgin human hair — she picks the texture, length, and color.",
    denoms: ["$50", "$100", "$250", "$500", "$1,000"],
    perks: [
      "Redeemable on any wig, bundle, or accessory",
      "Digital delivery within minutes",
      "Free worldwide shipping over $300",
    ],
    href: "/contact?topic=gift-card-hair",
    cta: "Send a Hair Gift",
  },
  {
    icon: BookOpen,
    title: "Ebook Gift",
    tagline: "60 Seconds to $100K Brand Blueprint",
    desc: "Gift the blueprint that turns side hustles into 6-figure brands. Instant PDF delivery.",
    denoms: ["$47"],
    perks: [
      "Instant PDF download for the recipient",
      "Lifetime access — no expiration",
      "Personalized note included",
    ],
    href: "/contact?topic=gift-card-ebook",
    cta: "Gift the Ebook",
  },
  {
    icon: Sparkles,
    title: "Massage Gift Card",
    tagline: "Elite Escape Mobile Massage",
    desc: "Pour into the woman who pours into everyone else. Mobile spa experience delivered to her door.",
    denoms: ["Custom amount"],
    perks: [
      "You choose the amount — any value",
      "Mobile service — they come to her",
      "Bookable via Fresha",
    ],
    href: "/contact?topic=gift-card-massage",
    cta: "Gift a Massage",
  },
  {
    icon: Briefcase,
    title: "Business Plan Gift",
    tagline: "AI Custom Startup Plan",
    desc: "Help her launch the brand she's been dreaming about — full AI-built business strategy.",
    denoms: ["$250", "$500", "$1,500"],
    perks: [
      "Custom AI-generated plan",
      "Branding, pricing, marketing & ops",
      "Apply gift toward 3-payment plan",
    ],
    href: "/contact?topic=gift-card-business",
    cta: "Gift a Business",
  },
];

const stationeryCards = [
  {
    icon: Heart,
    title: "Client Appreciation Cards",
    desc: "Hand-finished thank-you notes for your dedicated clientele — printed on luxe cream cardstock with gold foil.",
    bullets: [
      "Custom monogram or salon logo",
      "Personalized inside message",
      "Matching envelope + wax seal option",
    ],
    sets: ["Set of 25", "Set of 50", "Set of 100"],
  },
  {
    icon: IdCard,
    title: "Luxury Business Cards",
    desc: "Make every handoff feel like a moment. Designed in the Boss Queens signature gold & cream aesthetic.",
    bullets: [
      "Matte, soft-touch, or linen finish",
      "Gold foil accents on both sides",
      "QR code linking to your booking site",
    ],
    sets: ["100 cards", "250 cards", "500 cards"],
  },
  {
    icon: Mail,
    title: "Thank You Cards",
    desc: "Tucked into every order or sent on its own — gratitude that reflects your brand's elegance.",
    bullets: [
      "Custom front design + interior copy",
      "Optional discount code printed inside",
      "Gift-ready packaging available",
    ],
    sets: ["Set of 10", "Set of 25", "Set of 50"],
  },
];

const howItWorks = [
  {
    step: "1",
    title: "Pick an option",
    desc: "Choose a service gift card or a custom stationery package below.",
  },
  {
    step: "2",
    title: "Tell us the details",
    desc: "Send us recipient info, personalization, denomination, and delivery date.",
  },
  {
    step: "3",
    title: "We deliver",
    desc: "Digital cards arrive in minutes. Printed cards ship worldwide within 5–7 days.",
  },
];

export default function GiftCardsPage() {
  return (
    <>
      <Helmet>
        <title>Gift Cards & Luxury Stationery — Boss Queens Collection</title>
        <meta
          name="description"
          content="Gift cards for hair, ebooks, massages, and business plans — plus luxury client appreciation cards, business cards, and thank-you notes for your salon or brand."
        />
        <link rel="canonical" href="https://bossqueenscollection.com/gift-cards" />
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
              <Gift className="w-3.5 h-3.5" /> Gift the Boss Queens Experience
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground"
            >
              Gift Cards &<br />
              <span className="bg-gradient-gold bg-clip-text text-transparent">Luxury Stationery</span>
            </motion.h1>
            <p className="mt-6 max-w-2xl mx-auto text-base md:text-lg text-muted-foreground">
              From premium hair and massages to AI business plans and client appreciation cards —
              give the women in your life (or your dedicated clientele) something they'll actually use.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg" className="bg-gradient-gold text-[hsl(25_40%_18%)] font-semibold shadow-glow hover:opacity-95 px-8 h-12 text-base">
                <a href="#service-cards">Shop Gift Cards</a>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-6">
                <a href="#stationery">For Your Business</a>
              </Button>
            </div>
          </div>
        </section>

        {/* Service Gift Cards */}
        <section id="service-cards" className="container px-4 md:px-8 py-20">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">For Loved Ones</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-3">Service Gift Cards</h2>
            <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
              Digital delivery, no expiration, and redeemable across the Boss Queens ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {serviceCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="group relative rounded-2xl bg-card border border-primary/20 p-6 shadow-soft hover:shadow-elevated hover:border-primary/50 transition-all flex flex-col"
              >
                <div className="relative mb-5 rounded-xl bg-gradient-gold p-5 text-[hsl(25_40%_18%)] overflow-hidden">
                  <div className="absolute -top-6 -right-6 opacity-20">
                    <Crown className="w-20 h-20" />
                  </div>
                  <div className="flex items-center justify-between relative">
                    <card.icon className="w-7 h-7" />
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Gift Card</span>
                  </div>
                  <div className="mt-6 font-display text-lg font-bold relative">{card.title}</div>
                  <div className="text-[11px] opacity-80 relative">{card.tagline}</div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{card.desc}</p>

                <ul className="space-y-1.5 mb-4">
                  {card.perks.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-xs text-foreground">
                      <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {card.denoms.map((d) => (
                    <span
                      key={d}
                      className="text-[11px] font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
                    >
                      {d}
                    </span>
                  ))}
                </div>

                <Button
                  asChild
                  size="sm"
                  className="mt-auto w-full bg-gradient-gold text-[hsl(25_40%_18%)] font-semibold hover:opacity-95"
                >
                  <Link to={card.href}>
                    {card.cta} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="bg-secondary/40 border-y border-border/50 py-16">
          <div className="container px-4 md:px-8 max-w-5xl">
            <div className="text-center mb-10">
              <span className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">How It Works</span>
              <h2 className="font-display text-2xl md:text-3xl font-bold mt-2">Three steps, zero stress</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {howItWorks.map((s) => (
                <div key={s.step} className="rounded-2xl bg-card border border-border/60 p-6 text-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-gold text-[hsl(25_40%_18%)] font-bold flex items-center justify-center mx-auto mb-3">
                    {s.step}
                  </div>
                  <h3 className="font-display font-semibold text-foreground">{s.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stationery */}
        <section id="stationery" className="container px-4 md:px-8 py-20">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <span className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">For Your Business</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-3">
              Cards for Dedicated Clientele
            </h2>
            <p className="mt-3 text-sm md:text-base text-muted-foreground">
              Luxury client appreciation, business cards, and thank-you notes — designed and printed for
              brands that want every touchpoint to feel premium.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {stationeryCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl bg-card border border-border/60 p-6 hover:border-primary/40 hover:shadow-soft transition-all flex flex-col"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary inline-flex items-center justify-center mb-4">
                  <card.icon className="w-5 h-5" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">{card.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
                <ul className="mt-4 space-y-1.5">
                  {card.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-xs text-foreground">
                      <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {card.sets.map((s) => (
                    <span
                      key={s}
                      className="text-[11px] font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <Button
                  asChild
                  size="sm"
                  className="mt-5 w-full bg-gradient-gold text-[hsl(25_40%_18%)] font-semibold hover:opacity-95"
                >
                  <Link to={`/contact?topic=stationery-${card.title.toLowerCase().replace(/\s+/g, "-")}`}>
                    Request Quote <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="container px-4 md:px-8 pb-24">
          <div className="rounded-3xl bg-gradient-champagne border border-primary/20 p-10 md:p-14 text-center max-w-4xl mx-auto">
            <Crown className="w-8 h-8 text-primary mx-auto mb-4" />
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Need something completely custom?
            </h2>
            <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
              Bulk corporate gifting, branded packaging, wedding favors, or full stationery suites —
              tell us what you have in mind and we'll build it.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-6 bg-gradient-gold text-[hsl(25_40%_18%)] font-semibold shadow-glow hover:opacity-95 px-8 h-12"
            >
              <Link to="/contact?topic=gift-card-custom">Start a Custom Request</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}