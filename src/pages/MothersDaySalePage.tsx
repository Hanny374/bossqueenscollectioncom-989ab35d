import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { SEOHead } from "@/components/SEOHead";
import { Crown, Gift, Sparkles, Truck, ShieldCheck, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const SALE_CODE = "MOM20";
const SALE_DISCOUNT = "20% OFF";
const SALE_END_ISO = "2026-05-10T23:59:59-04:00";
const SALE_END_LABEL = "May 10, 2026";

const faqs = [
  {
    question: "When does the Mother's Day sale end?",
    answer: `The Boss Queens Collection Mother's Day sale ends on ${SALE_END_LABEL} at 11:59 PM EST. Orders placed before midnight will receive ${SALE_DISCOUNT} with code ${SALE_CODE}.`,
  },
  {
    question: "What's the best Mother's Day gift for a Black mom?",
    answer:
      "A premium 100% virgin human hair wig is the ultimate Mother's Day gift — it's luxury, confidence, and self-care wrapped in one. Our Grade 10A bob wigs, body wave wigs, and headband wigs ship in luxe gold packaging perfect for gifting.",
  },
  {
    question: "Can I get it shipped in time for Mother's Day?",
    answer:
      "Yes — we offer expedited shipping. US & Caribbean orders typically arrive in 5–10 business days. For guaranteed Mother's Day delivery, order by April 28, 2026.",
  },
  {
    question: "Do you offer gift wrapping?",
    answer:
      "Every Boss Queens Collection order ships in our signature hot pink box with gold foil — no extra wrapping needed. Add a free gift note at checkout.",
  },
  {
    question: `How do I use the ${SALE_CODE} discount code?`,
    answer: `Add any wig, bundle, or accessory to your cart and enter code ${SALE_CODE} at checkout to receive ${SALE_DISCOUNT}. Free worldwide shipping is automatic on orders over $100.`,
  },
];

const giftPicks = [
  {
    title: "Bob Wigs",
    desc: "Effortlessly chic. Perfect for the modern mom.",
    href: "/#products?category=bob-wigs",
  },
  {
    title: "Body Wave Wigs",
    desc: "Soft, romantic curls she'll fall in love with.",
    href: "/#products?category=colored-wigs",
  },
  {
    title: "Headband Wigs",
    desc: "Glam in 60 seconds — no glue, no stress.",
    href: "/#products?category=headband-wigs",
  },
];

const MothersDaySalePage = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SaleEvent",
        name: "Boss Queens Collection Mother's Day Sale 2026",
        description: `Celebrate Mom with ${SALE_DISCOUNT} on all 100% virgin human hair wigs, bundles, and accessories. Use code ${SALE_CODE} at checkout.`,
        startDate: "2026-04-25T00:00:00-04:00",
        endDate: SALE_END_ISO,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
        location: {
          "@type": "VirtualLocation",
          url: "https://bossqueenscollection.com/mothers-day-sale",
        },
        organizer: {
          "@type": "Organization",
          name: "Boss Queens Collection",
          url: "https://bossqueenscollection.com",
        },
        offers: {
          "@type": "Offer",
          url: "https://bossqueenscollection.com/mothers-day-sale",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          validFrom: "2026-04-25T00:00:00-04:00",
          priceValidUntil: SALE_END_ISO,
          description: `${SALE_DISCOUNT} sitewide with code ${SALE_CODE}`,
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://bossqueenscollection.com" },
          {
            "@type": "ListItem",
            position: 2,
            name: "Mother's Day Sale",
            item: "https://bossqueenscollection.com/mothers-day-sale",
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Mother's Day Sale 2026 — 20% Off Luxury Wigs & Bundles"
        description={`Boss Queens Collection Mother's Day Sale: ${SALE_DISCOUNT} all 100% virgin human hair wigs, bundles & accessories with code ${SALE_CODE}. Free shipping over $100. Ends ${SALE_END_LABEL}.`}
        path="/mothers-day-sale"
        type="website"
      />
      <Helmet>
        <meta name="keywords" content="mothers day sale, mothers day gifts for black moms, wig gift mothers day, human hair wig sale, mothers day hair sale 2026, gift for mom, luxury wig sale, boss queens collection sale" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Header />

      <main className="pt-24 pb-20">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-cream to-background pointer-events-none" />
          <div className="container relative px-4 md:px-8 py-16 md:py-24 max-w-5xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 text-primary text-sm font-medium tracking-[0.2em] uppercase mb-4">
                <Heart className="h-4 w-4" /> Mother's Day 2026
              </span>
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
                Spoil Mom in <span className="text-primary">Pure Luxury</span>
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl mb-3 max-w-2xl mx-auto">
                {SALE_DISCOUNT} all 100% virgin human hair wigs, bundles & accessories.
              </p>
              <p className="text-foreground text-base md:text-lg mb-8">
                Use code{" "}
                <span className="inline-block bg-primary text-primary-foreground font-bold px-3 py-1 rounded-md tracking-wider">
                  {SALE_CODE}
                </span>{" "}
                at checkout · Ends {SALE_END_LABEL}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild size="lg" className="bg-gradient-to-r from-primary to-primary/80 text-espresso font-semibold">
                  <Link to="/#products">Shop the Sale</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/#products?category=bundles">Shop Bundles</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Trust strip */}
        <section className="container px-4 md:px-8 py-10 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Truck, label: "Free shipping over $100" },
              { icon: ShieldCheck, label: "100% virgin human hair" },
              { icon: Gift, label: "Luxe gift packaging" },
              { icon: Sparkles, label: "Grade 10A quality" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <Icon className="h-6 w-6 text-primary" />
                <span className="text-sm text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Gift picks */}
        <section className="container px-4 md:px-8 py-12 max-w-5xl">
          <div className="text-center mb-10">
            <span className="text-primary text-sm font-medium tracking-[0.2em] uppercase mb-2 block">
              Top Gift Picks
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Curated for the Queen Who Raised You
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {giftPicks.map((pick) => (
              <Link
                key={pick.title}
                to={pick.href}
                className="group block p-8 bg-card border border-border/60 rounded-2xl hover:border-primary/40 hover:shadow-elegant transition-all duration-300"
              >
                <Crown className="h-7 w-7 text-primary mb-4" />
                <h3 className="font-display text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {pick.title}
                </h3>
                <p className="text-muted-foreground text-sm">{pick.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="container px-4 md:px-8 py-12 max-w-3xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground text-center mb-10">
            Mother's Day Sale FAQ
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="bg-card border border-border/60 rounded-2xl px-6 py-4 group"
              >
                <summary className="font-display text-base font-semibold text-foreground cursor-pointer list-none flex justify-between items-center">
                  {faq.question}
                  <span className="text-primary text-xl transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="text-muted-foreground leading-relaxed mt-3">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="container px-4 md:px-8 py-12 max-w-3xl text-center">
          <div className="bg-gradient-to-br from-primary/10 to-cream rounded-3xl p-10 border border-primary/20">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Don't Wait — Sale Ends {SALE_END_LABEL}
            </h2>
            <p className="text-muted-foreground mb-6">
              Make this the Mother's Day she'll never forget.
            </p>
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-primary/80 text-espresso font-semibold">
              <Link to="/#products">Shop Now with {SALE_CODE}</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default MothersDaySalePage;