import { motion } from "framer-motion";
import { Link } from "react-router-dom";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Denom = string;

const serviceCards: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  tagline: string;
  desc: string;
  denoms: Denom[];
  cta: string;
  href: string;
}[] = [
  {
    icon: Scissors,
    title: "Hair Gift Card",
    tagline: "Wigs · Bundles · Frontals",
    desc: "Treat her to Grade 10A virgin human hair — she picks the texture, length, and color.",
    denoms: ["$50", "$100", "$250", "$500"],
    cta: "Send a Hair Gift",
    href: "/contact?topic=gift-card-hair",
  },
  {
    icon: BookOpen,
    title: "Ebook Gift",
    tagline: "60 Seconds to $100K Blueprint",
    desc: "Gift the blueprint that turns side hustles into 6-figure brands. Instant PDF delivery.",
    denoms: ["$47"],
    cta: "Gift the Ebook",
    href: "/contact?topic=gift-card-ebook",
  },
  {
    icon: Sparkles,
    title: "Massage Gift Card",
    tagline: "Elite Escape Mobile Massage",
    desc: "Pour into the woman who pours into everyone else. Mobile spa experience delivered.",
    denoms: ["$75", "$150", "$250"],
    cta: "Gift a Massage",
    href: "/contact?topic=gift-card-massage",
  },
  {
    icon: Briefcase,
    title: "Business Plan Gift",
    tagline: "AI Custom Startup Plan",
    desc: "Help her launch the brand she's been dreaming about — full AI-built business plan.",
    denoms: ["$250", "$500", "$1,500"],
    cta: "Gift a Business",
    href: "/contact?topic=gift-card-business",
  },
];

const stationeryCards: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  bullets: string[];
}[] = [
  {
    icon: Heart,
    title: "Client Appreciation Cards",
    desc: "Hand-finished thank-you notes for your dedicated clientele — printed on luxe cream cardstock with gold foil.",
    bullets: ["Custom monogram or salon logo", "Inside personalization", "Matching envelope + seal"],
  },
  {
    icon: IdCard,
    title: "Luxury Business Cards",
    desc: "Make every handoff feel like a moment. Designed in the Boss Queens signature gold & cream aesthetic.",
    bullets: ["Matte or soft-touch finish", "Gold foil accents", "Double-sided design"],
  },
  {
    icon: Mail,
    title: "Thank You Cards",
    desc: "Tucked into every order or sent on its own — gratitude that reflects your brand's elegance.",
    bullets: ["Set of 10, 25, or 50", "Custom message inside", "Gift-ready packaging"],
  },
];

export const GiftCardsSpotlight = () => {
  return (
    <section
      id="gift-cards"
      className="relative py-20 md:py-28 bg-gradient-champagne overflow-hidden"
      aria-labelledby="gift-cards-heading"
    >
      <div className="absolute inset-0 pointer-events-none opacity-40 [background:radial-gradient(circle_at_15%_20%,hsl(var(--primary)/0.18),transparent_55%),radial-gradient(circle_at_85%_75%,hsl(var(--primary)/0.14),transparent_60%)]" />

      <div className="container relative px-4 md:px-8">
        {/* Header */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-primary font-semibold">
            <Gift className="w-3.5 h-3.5" /> Gift the Boss Queens Experience
          </span>
          <h2
            id="gift-cards-heading"
            className="font-display text-3xl md:text-5xl font-bold mt-3 text-foreground"
          >
            Gift Cards for the{" "}
            <span className="bg-gradient-gold bg-clip-text text-transparent">Women You Love</span>
          </h2>
          <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed">
            From premium hair to massages, business plans, and luxury stationery — give a gift she'll
            actually use. Every card is digitally delivered or hand-printed in our signature gold & cream.
          </p>
        </motion.div>

        {/* Service Gift Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {serviceCards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="group relative rounded-2xl bg-card border border-primary/20 p-6 shadow-soft hover:shadow-elevated hover:border-primary/50 transition-all flex flex-col"
            >
              {/* Card visual */}
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

              <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                {card.desc}
              </p>

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
                className="w-full bg-gradient-gold text-[hsl(25_40%_18%)] font-semibold hover:opacity-95"
              >
                <Link to={card.href}>{card.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Stationery Cards */}
        <motion.div
          className="mt-16 md:mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">
              For Your Business
            </span>
            <h3 className="font-display text-2xl md:text-3xl font-bold mt-2 text-foreground">
              Stationery for Dedicated Clientele
            </h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Luxury client appreciation, business cards, and thank-you notes — designed and printed for
              brands that want every touchpoint to feel premium.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {stationeryCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl bg-card/70 backdrop-blur border border-border/60 p-6 hover:border-primary/40 hover:shadow-soft transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary inline-flex items-center justify-center mb-4">
                  <card.icon className="w-5 h-5" />
                </div>
                <h4 className="font-display text-lg font-semibold text-foreground">{card.title}</h4>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
                <ul className="mt-4 space-y-1.5">
                  {card.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-xs text-foreground">
                      <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="bg-gradient-gold text-[hsl(25_40%_18%)] font-semibold shadow-glow hover:opacity-95 px-8 h-12"
              >
                <Link to="/gift-cards">Explore All Gift Cards</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary/40 text-foreground hover:bg-primary/5 h-12"
              >
                <Link to="/contact?topic=stationery">Custom Stationery Quote</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GiftCardsSpotlight;