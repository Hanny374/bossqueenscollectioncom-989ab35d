import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Truck, Globe, Clock, Package, ShieldCheck } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

const ShippingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Shipping & Delivery"
        description="Free worldwide shipping on orders over $100. Learn about Boss Queens Collection delivery times, tracking, and shipping policies for 180+ countries."
        path="/shipping"
      />
      <Header />
      <main className="pt-32 pb-20">
        <div className="container px-4 md:px-8 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-primary text-sm font-medium tracking-[0.2em] uppercase mb-3 block">
              Delivery
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              Shipping Information
            </h1>
            <p className="text-muted-foreground text-lg mb-12 max-w-2xl">
              We ship worldwide from St. Maarten, Caribbean. Here's everything you need to know about getting your order delivered.
            </p>
          </motion.div>

          <div className="grid gap-8">
            {[
              {
                icon: Truck,
                title: "Free Worldwide Shipping",
                description: "Enjoy free shipping on all orders over $100. We deliver to every corner of the globe so every queen can access premium hair.",
              },
              {
                icon: Clock,
                title: "Processing Time",
                description: "Orders are processed within 1–3 business days. You'll receive a confirmation email with tracking details once your order ships.",
              },
              {
                icon: Globe,
                title: "Delivery Times",
                description: "Caribbean & US: 5–10 business days. Europe: 7–14 business days. Rest of World: 10–21 business days. Times may vary during peak seasons.",
              },
              {
                icon: Package,
                title: "Packaging",
                description: "All orders are carefully packaged in premium, discreet packaging to ensure your hair arrives in perfect condition.",
              },
              {
                icon: ShieldCheck,
                title: "Tracking & Insurance",
                description: "Every order includes tracking information and is insured during transit. If anything goes wrong, we've got you covered.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                className="flex gap-5 bg-card border border-border/60 rounded-2xl p-6 hover:border-primary/20 transition-all duration-300"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ShippingPage;
