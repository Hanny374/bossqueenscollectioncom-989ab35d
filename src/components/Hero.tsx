import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import heroImage from "@/assets/hero-beauty.webp";
import modelStraight from "@/assets/model-straight-black-wig.jpg";
import modelBlonde from "@/assets/model-blonde-bodywave-wig.jpg";
import modelBurgundy from "@/assets/model-burgundy-deepwave-wig.jpg";

const slides = [
  { img: heroImage, alt: "Beautiful woman with luxurious human hair wig" },
  { img: modelStraight, alt: "Sleek straight jet black lace front wig" },
  { img: modelBlonde, alt: "Honey blonde body wave lace front wig" },
  { img: modelBurgundy, alt: "Burgundy deep wave lace front wig" },
];

export const Hero = () => {
  const [current, setCurrent] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), []);

  // Defer auto-rotate until after LCP/first paint settles to protect LCP.
  useEffect(() => {
    const start = window.setTimeout(() => {
      const timer = window.setInterval(next, 4000);
      (start as unknown as { _t?: number })._t = timer;
    }, 4000);
    return () => {
      window.clearTimeout(start);
      const t = (start as unknown as { _t?: number })._t;
      if (t) window.clearInterval(t);
    };
  }, [next]);

  // Lazily preload non-LCP slides during browser idle time so they don't
  // contend with the hero image for bandwidth during the LCP window.
  useEffect(() => {
    const ric: (cb: () => void) => number =
      (window as unknown as { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback ||
      ((cb) => window.setTimeout(cb, 1500));
    const id = ric(() => {
      slides.slice(1).forEach((s) => {
        const img = new Image();
        img.src = s.img;
      });
    });
    return () => {
      const cancel = (window as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;
      if (cancel) cancel(id);
    };
  }, []);

  return (
    <section className="hero-slot relative min-h-[85vh] md:min-h-[100vh] flex items-center overflow-hidden">
      {/* Background Carousel */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence initial={false}>
          <motion.img
            key={current}
            src={slides[current].img}
            alt={slides[current].alt}
            className="absolute inset-0 w-full h-full object-cover object-top"
            loading={current === 0 ? "eager" : "lazy"}
            fetchPriority={current === 0 ? "high" : undefined}
            decoding={current === 0 ? "sync" : "async"}
            initial={current === 0 && !hasInteracted ? false : { opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            onAnimationComplete={() => setHasInteracted(true)}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />
        </AnimatePresence>
        {/* Cinematic overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-espresso/80 via-espresso/40 to-transparent z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/60 via-transparent to-espresso/20 z-[1]" />
      </div>

      {/* Carousel Controls */}
      <button
        onClick={prev}
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-cream/10 backdrop-blur-sm border border-cream/20 flex items-center justify-center text-cream/70 hover:text-cream hover:bg-cream/20 transition-all"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-cream/10 backdrop-blur-sm border border-cream/20 flex items-center justify-center text-cream/70 hover:text-cream hover:bg-cream/20 transition-all"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i === current ? "bg-primary w-8" : "bg-cream/40 hover:bg-cream/60"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
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
            <h1 className="font-display text-4xl md:text-7xl lg:text-8xl font-bold tracking-tight text-cream leading-[0.95]">
              Slay Every
              <br />
              <span className="text-gradient-gold">Day</span>
            </h1>

            <p className="text-base md:text-xl text-cream/70 max-w-md leading-relaxed font-light">
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
              className="bg-gradient-gold hover:opacity-90 text-espresso shadow-glow text-sm md:text-base px-8 md:px-10 h-12 md:h-14 font-semibold tracking-wide"
            >
              <Link to="/#products">Shop Now</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-cream/30 text-cream hover:bg-cream/10 hover:text-cream font-semibold text-sm md:text-base px-8 md:px-10 h-12 md:h-14 backdrop-blur-sm bg-cream/5"
            >
              <a href="#top-sellers">View Best Sellers</a>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="flex gap-6 md:gap-10 pt-4 md:pt-8"
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
