import { Instagram, Sparkles, CalendarCheck } from "lucide-react";
import { motion } from "framer-motion";

export const MassageSpotlight = () => {
  return (
    <section className="py-12 md:py-16 relative">
      <div className="container px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-8 md:p-12 shadow-elevated"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-primary text-xs md:text-sm font-medium tracking-[0.25em] uppercase">
                  Self-Care Partner
                </span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
                Book a Luxury Massage
              </h2>
              <p className="font-display italic text-foreground/90 text-lg md:text-xl leading-relaxed mb-3">
                "Welcome, Queen. You've poured into everyone else — now it's your turn to be poured into."
              </p>
              <p className="text-muted-foreground md:text-lg leading-relaxed">
                Step into a private, candle-lit ritual with
                <span className="text-foreground font-semibold"> Elite Escape Mobile Massage</span>.
                Reserve your time on Fresha through the link below — your sanctuary is one tap away.
              </p>
              <a
                href="https://www.fresha.com/a/elite-escape-mobile-massage-phillipsburg-brysons-drive-uastojpm"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-primary font-semibold underline underline-offset-4 decoration-primary/40 hover:decoration-primary transition-all"
              >
                <CalendarCheck className="w-4 h-4" />
                Open the Fresha booking app →
              </a>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <a
                href="https://www.fresha.com/a/elite-escape-mobile-massage-phillipsburg-brysons-drive-uastojpm"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold shadow-elevated hover:shadow-glow transition-all"
              >
                <CalendarCheck className="w-4 h-4" />
                Book on Fresha
              </a>
              <a
                href="https://www.instagram.com/eliteescapemassage/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-primary/40 text-foreground font-semibold hover:bg-primary/10 transition-all"
              >
                <Instagram className="w-4 h-4" />
                Instagram
              </a>
              <a
                href="https://www.tiktok.com/@eliteescapemassage"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-primary/40 text-foreground font-semibold hover:bg-primary/10 transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.97a8.16 8.16 0 0 0 4.77 1.52V7.04a4.85 4.85 0 0 1-1.84-.35z"/></svg>
                TikTok
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MassageSpotlight;