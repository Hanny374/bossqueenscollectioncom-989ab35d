import { motion } from "framer-motion";
import { ShieldCheck, Star, Users, Package, Award, RotateCcw } from "lucide-react";

const stats = [
  { icon: Users, value: "5,000+", label: "Happy Customers" },
  { icon: Package, value: "12,000+", label: "Orders Shipped" },
  { icon: Star, value: "4.9/5", label: "Average Rating" },
  { icon: Award, value: "3+ Years", label: "In Business" },
];

const guarantees = [
  { icon: ShieldCheck, text: "100% Authentic Human Hair" },
  { icon: RotateCcw, text: "30-Day Money-Back Guarantee" },
  { icon: Package, text: "Tracked & Insured Shipping" },
];

export const TrustBar = () => {
  return (
    <section className="py-10 bg-card border-y border-border/50">
      <div className="container px-4 md:px-8">
        {/* Stats Row */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="flex flex-col items-center text-center gap-2"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="font-display text-2xl md:text-3xl font-bold text-foreground">
                {stat.value}
              </span>
              <span className="text-xs md:text-sm text-muted-foreground font-medium">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Guarantees Strip */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-4 md:gap-8 pt-6 border-t border-border/50"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {guarantees.map((g) => (
            <div key={g.text} className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10">
              <g.icon className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-sm font-medium text-foreground whitespace-nowrap">{g.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
