import { Star } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Shaniqua T.",
    location: "Miami, FL",
    text: "I ordered the Brazilian body wave bundles and I'm obsessed! The hair is so soft, no shedding, no tangling. I've washed it multiple times and it still looks brand new. Best hair I've ever bought online, period.",
    rating: 5,
  },
  {
    name: "Amara J.",
    location: "Brooklyn, NY",
    text: "The HD lace frontal wig is EVERYTHING. It melted into my skin so perfectly, people think it's my real hair. Shipping to New York was fast too. I'm a customer for life!",
    rating: 5,
  },
  {
    name: "Destiny W.",
    location: "Houston, TX",
    text: "I was skeptical about ordering hair online but Boss Queens exceeded my expectations. The deep wave bundles are gorgeous and the customer service team was so helpful. Already placed my second order!",
    rating: 5,
  },
  {
    name: "Priya K.",
    location: "London, UK",
    text: "International shipping was surprisingly quick! The straight bundles are silky smooth and the quality is on par with hair that costs twice as much. My stylist was impressed too.",
    rating: 5,
  },
  {
    name: "Gabrielle N.",
    location: "Toronto, CA",
    text: "The honey blonde wig is stunning — the color is perfect and the lace is undetectable. I wore it to a wedding and got so many compliments. 10/10 would recommend Boss Queens to every queen out there!",
    rating: 5,
  },
];

export const Testimonials = () => {
  return (
    <section className="py-28 bg-gradient-cream relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/[0.03] rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

      <div className="container px-4 md:px-8 relative">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-primary text-sm font-medium tracking-[0.2em] uppercase mb-3 block">
            Reviews
          </span>
          <h2 className="font-display text-4xl md:text-6xl font-bold text-foreground">
            Queens Love Us
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card rounded-2xl p-8 border border-border/60 hover:border-primary/20 transition-all duration-300 hover:shadow-soft"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-foreground/80 leading-relaxed mb-8 text-[15px]">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-display text-sm font-bold text-primary">
                    {testimonial.name[0]}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm">{testimonial.name}</div>
                  <div className="text-muted-foreground text-xs">{testimonial.location}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
