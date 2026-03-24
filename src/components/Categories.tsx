import { Link } from "react-router-dom";
import { Crown, Scissors, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const categories = [
  {
    title: "Colored Wigs",
    subtitle: "Blonde, burgundy, honey & ombre HD lace front wigs",
    icon: Sparkles,
    href: "/#products?category=colored-wigs",
    number: "01",
  },
  {
    title: "Bob Wigs",
    subtitle: "Short bob lace front wigs in all textures",
    icon: Scissors,
    href: "/#products?category=bob-wigs",
    number: "02",
  },
  {
    title: "Lace Front Wigs",
    subtitle: "Natural black HD lace frontal wigs, 13x4 & 13x6",
    icon: Crown,
    href: "/#products?category=lace-front-wigs",
    number: "03",
  },
  {
    title: "Bundles",
    subtitle: "Virgin hair bundles & bundle deals in all textures",
    icon: Sparkles,
    href: "/#products?category=bundles",
    number: "04",
  },
];

export const Categories = () => {
  return (
    <section id="categories" className="py-28 relative overflow-hidden bg-background">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

      <div className="container px-4 md:px-8 relative">
        <motion.div
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <span className="text-primary text-sm font-medium tracking-[0.2em] uppercase mb-3 block">
              Collections
            </span>
            <h2 className="font-display text-4xl md:text-6xl font-bold text-foreground">
              Shop by Category
            </h2>
          </div>
          <p className="text-muted-foreground text-lg max-w-sm">
            Explore our curated collections of premium 100% human hair
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                to={category.href}
                className="group relative block overflow-hidden rounded-2xl border border-border/60 bg-card p-8 lg:p-10 transition-all duration-500 hover:border-primary/30 hover:shadow-elevated"
              >
                {/* Number */}
                <span className="font-display text-7xl font-bold text-primary/[0.07] absolute top-4 right-6 select-none group-hover:text-primary/[0.12] transition-colors duration-500">
                  {category.number}
                </span>

                <div className="relative z-10 space-y-6">
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <category.icon className="w-7 h-7" />
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-2">
                      {category.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {category.subtitle}
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-primary text-sm font-medium">
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
