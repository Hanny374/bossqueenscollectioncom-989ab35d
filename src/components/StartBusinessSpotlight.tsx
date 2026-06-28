import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Rocket, Store, Briefcase, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const PILLARS = [
  {
    icon: Store,
    title: "Retail & Wholesale Pricing",
    description:
      "Competitive worldwide wholesale tiers — buy for yourself or stock your storefront and maximize margins.",
  },
  {
    icon: Rocket,
    title: "Launch Your Hair Business",
    description:
      "Premium product, supplier guidance, and wholesale support to launch online, in-salon, or from your living room.",
  },
  {
    icon: Briefcase,
    title: "Business Revamp Packages",
    description:
      "Branding, social strategy, and full revamp packages to elevate the business you've already built.",
  },
  {
    icon: TrendingUp,
    title: "Grow & Scale Together",
    description:
      "From marketing playbooks to supplier intros — the same knowledge that grew us, shared with you.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

export const StartBusinessSpotlight = () => {
  return (
    <section
      id="start-business-spotlight"
      aria-labelledby="start-business-heading"
      className="py-16 md:py-24 bg-gradient-cream"
    >
      <div className="container px-4 md:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs md:text-sm font-medium tracking-[0.2em] uppercase">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              Start Your Business With Us
            </span>
            <h2
              id="start-business-heading"
              className="font-display text-3xl md:text-5xl font-bold text-foreground mt-5"
            >
              Build Your Empire — We've Got Your Back
            </h2>
            <p className="text-muted-foreground md:text-lg mt-4 leading-relaxed">
              Every young entrepreneur deserves the tools and support to grow. Whether you're starting online or in your home city, we'll help you launch and scale.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 max-w-5xl mx-auto">
          {PILLARS.map((item, i) => (
            <motion.div
              key={item.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp}
              className="bg-background rounded-2xl p-6 md:p-8 shadow-soft hover:shadow-elevated transition-shadow"
            >
              <div
                className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/10 flex items-center justify-center mb-5"
                aria-hidden="true"
              >
                <item.icon className="w-6 h-6 md:w-7 md:h-7 text-primary" />
              </div>
              <h3 className="font-display text-xl md:text-2xl font-bold text-foreground mb-3">
                {item.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10 md:mt-12">
          <Button
            asChild
            size="lg"
            className="bg-gradient-gold-dark hover:opacity-90 text-primary-foreground shadow-gold"
          >
            <Link to="/start-business">Get Started</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/about#start-business">Learn More</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default StartBusinessSpotlight;