import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-beauty.webp";

export const Hero = () => {
  return (
    <section className="relative min-h-[85vh] md:min-h-[100vh] flex items-center overflow-hidden">
      {/* Background Image — always visible immediately */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Beautiful woman with luxurious human hair wig"
          className="w-full h-full object-cover object-top"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          width={1200}
          height={686}
        />
        {/* Cinematic overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-espresso/80 via-espresso/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/60 via-transparent to-espresso/20" />
      </div>

      {/* Content */}
      <div className="container relative z-10 px-4 md:px-8 pt-12 md:pt-20">
        <div className="max-w-2xl space-y-5 md:space-y-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-cream/10 border border-cream/20 text-cream text-sm font-medium backdrop-blur-sm">
              <Crown className="w-4 h-4 text-primary" />
              <span>100% Human Hair</span>
              <Sparkles className="w-3.5 h-3.5 text-primary" />
            </span>
          </motion.div>

          {/* Headline */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
          >
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-cream leading-[0.95]">
              Slay Every
              <br />
              <span className="text-gradient-gold">Day</span>
            </h1>

            <p className="text-lg md:text-xl text-cream/70 max-w-md leading-relaxed font-light">
              Affordable luxury hair that looks natural and feels incredible.
              Crafted for queens who demand the best.
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div
            className="flex flex-wrap gap-4 pt-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
          >
            <Button
              asChild
              size="lg"
              className="bg-gradient-gold hover:opacity-90 text-espresso shadow-glow text-base px-10 h-14 font-semibold tracking-wide"
            >
              <Link to="/#products">Shop Collection</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="bg-gradient-gold text-espresso hover:opacity-90 font-semibold text-base px-10 h-14 border-none"
            >
              <a href="#categories">Explore</a>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="flex gap-10 pt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {[
              { value: "5K+", label: "Happy Queens" },
              { value: "100%", label: "Human Hair" },
              { value: "30+", label: "Countries" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-2xl md:text-3xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-xs text-cream/50 uppercase tracking-wider mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <span className="text-cream/40 text-xs uppercase tracking-[0.2em]">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <ArrowDown className="w-4 h-4 text-cream/40" />
        </motion.div>
      </motion.div>
    </section>
  );
};
