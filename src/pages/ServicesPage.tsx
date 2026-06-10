import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Globe, Briefcase, Check, Sparkles, Rocket, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { SEOHead } from "@/components/SEOHead";

const services = [
  {
    icon: Globe,
    title: "Web Development",
    tagline: "Luxury websites that convert",
    price: "From $499",
    description:
      "Custom-built, mobile-first websites for beauty brands, boutiques, and entrepreneurs. Fast, elegant, and SEO-ready.",
    features: [
      "Custom design tailored to your brand",
      "Shopify or Lovable storefront setup",
      "Mobile + SEO optimized",
      "Payment & checkout integration",
      "Up to 2 weeks delivery",
    ],
  },
  {
    icon: Briefcase,
    title: "Business Setup",
    tagline: "Launch your hair business",
    price: "From $799",
    description:
      "Everything you need to start your own hair or beauty business — from sourcing to branding to your first sale.",
    features: [
      "Supplier sourcing & wholesale access",
      "Brand identity (logo + colors + fonts)",
      "Social media starter kit",
      "Pricing & profit margin strategy",
      "1:1 launch coaching call",
    ],
  },
];

const ServicesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Services — Web Development & Business Setup"
        description="Luxury web development and turn-key hair business setup services by Boss Queens Collection. Launch your brand with confidence."
        path="/services"
      />
      <Header />

      <main>
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-cream via-background to-primary/5 py-20 md:py-28">
          <div className="container px-4 text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                Boss Queens Services
              </div>
              <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-4">
                Build Your Empire
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
                Whether you need a stunning website or a full business launch — we'll get you queen-ready.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Services */}
        <section className="py-16 md:py-24">
          <div className="container px-4 max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {services.map((service, i) => {
                const Icon = service.icon;
                return (
                  <motion.div
                    key={service.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <Card className="h-full p-8 md:p-10 border-primary/15 hover:border-primary/40 hover:shadow-xl transition-all bg-gradient-to-br from-background to-cream/40">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                        <Icon className="w-7 h-7 text-primary" />
                      </div>
                      <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
                        {service.title}
                      </h2>
                      <p className="text-primary font-medium mb-1">{service.tagline}</p>
                      <p className="text-2xl font-display font-bold text-foreground mb-5">
                        {service.price}
                      </p>
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        {service.description}
                      </p>
                      <ul className="space-y-3 mb-8">
                        {service.features.map((feat) => (
                          <li key={feat} className="flex items-start gap-3 text-sm">
                            <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        asChild
                        className="w-full bg-gradient-gold text-espresso hover:opacity-90 font-semibold"
                      >
                        <Link to={`/contact?inquiry=${encodeURIComponent(service.title)}`}>
                          Get Started
                        </Link>
                      </Button>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-espresso text-cream">
          <div className="container px-4 text-center max-w-2xl mx-auto">
            <Crown className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Not sure which fits you?
            </h2>
            <p className="text-cream/80 mb-8 text-lg">
              Book a free 15-minute discovery call and we'll map out your next move.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-gradient-gold text-espresso hover:opacity-90 font-semibold"
            >
              <Link to="/contact?inquiry=discovery-call">
                <Rocket className="w-4 h-4 mr-2" />
                Book Free Call
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ServicesPage;