import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Download, Infinity as InfinityIcon, Sparkles } from "lucide-react";

const EBOOK_HANDLE = "60-seconds-to-100k-brand-blueprint-ebook";

export const EbookSpotlight = () => {
  return (
    <section className="py-12 md:py-20 relative">
      <div className="container px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-secondary/40 shadow-elevated"
        >
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 p-6 md:p-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-primary text-xs md:text-sm font-medium tracking-[0.25em] uppercase">
                  Boss Queens Digital Drop
                </span>
              </div>
              <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground leading-tight mb-4">
                The Million-Dollar <span className="text-primary italic">Playbook</span>
              </h2>
              <p className="text-muted-foreground text-base md:text-lg mb-6 max-w-md">
                Source raw Grade 10A hair, command luxury prices, and scale your brand to seven figures —
                the exact framework Boss Queens use.
              </p>

              <ul className="space-y-2 mb-7">
                {[
                  { icon: Download, text: "Instant PDF download" },
                  { icon: InfinityIcon, text: "Lifetime access — read on any device" },
                  { icon: BookOpen, text: "Step-by-step sourcing, branding & scaling" },
                ].map((f) => (
                  <li key={f.text} className="flex items-center gap-3 text-sm md:text-base text-foreground/90">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary">
                      <f.icon className="w-3.5 h-3.5" />
                    </span>
                    {f.text}
                  </li>
                ))}
              </ul>

              <div className="flex items-baseline gap-3 mb-6">
                <span className="font-display text-3xl md:text-4xl font-bold text-primary">$7</span>
                <span className="text-muted-foreground line-through text-lg">$97</span>
                <span className="text-xs uppercase tracking-widest text-primary font-semibold">Launch price</span>
              </div>

              <Link
                to={`/product/${EBOOK_HANDLE}`}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold tracking-wide shadow-soft hover:shadow-elevated hover:-translate-y-0.5 transition-all"
              >
                Get The Ebook
                <Download className="w-4 h-4" />
              </Link>
            </div>

            <div className="relative aspect-[4/5] max-w-sm mx-auto w-full">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/30 via-primary/10 to-transparent blur-2xl" />
              <div className="relative h-full rounded-2xl border border-primary/30 bg-card/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center shadow-elevated">
                <BookOpen className="w-12 h-12 text-primary mb-4" />
                <span className="text-xs tracking-[0.3em] uppercase text-primary mb-3">Ebook · PDF</span>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight">
                  Boss Queens
                </h3>
                <p className="font-display italic text-foreground/80 mt-1 mb-4">The Million-Dollar Playbook</p>
                <div className="h-px w-16 bg-primary/50 my-3" />
                <p className="text-xs text-muted-foreground">
                  Sourcing · Branding · Scaling
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default EbookSpotlight;