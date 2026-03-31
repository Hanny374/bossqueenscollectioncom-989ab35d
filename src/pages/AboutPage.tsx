import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, Globe, Award, Users, Sparkles, Shield, Rocket, Store, Briefcase, TrendingUp, CheckCircle, Zap } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="About Us — Empowering Queens & Entrepreneurs"
        description="Boss Queens Collection is a verified vendor from St. Maarten offering retail & wholesale hair worldwide. We inspire young entrepreneurs and offer freelancing services to grow your business."
        path="/about"
      />
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative py-24 bg-gradient-gold overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          </div>
          <div className="container px-4 md:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
                  ✅ Verified Vendor • Retail & Wholesale
                </span>
                <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground mb-6">
                  Our Story & Mission
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  From a tiny Caribbean island to empowering queens and entrepreneurs around the world — we're more than hair, we're a movement.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Origin Story */}
        <section className="py-20">
          <div className="container px-4 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  Where It All Began
                </span>
                <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
                  Born in the Heart of the Caribbean
                </h2>
                <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
                  <p>
                    <span className="text-primary font-semibold">St. Maarten</span> — a stunning Caribbean island of just 37 square miles. This is where Boss Queens Collection was born.
                  </p>
                  <p>
                    Founded by a passionate entrepreneur who understood the struggle of finding quality hair at reasonable prices, Boss Queens Collection started with a simple mission: to make every woman feel like royalty without the royal price tag.
                  </p>
                  <p>
                    What began as a small operation serving local island queens has grown into a global brand, but our heart remains rooted in the warmth and spirit of the Caribbean.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-3xl bg-gradient-cream p-8 shadow-elevated">
                  <div className="w-full h-full rounded-2xl bg-gradient-gold flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <Globe className="w-20 h-20 text-primary mx-auto" />
                      <div className="font-display text-6xl font-bold text-foreground">37</div>
                      <p className="text-muted-foreground text-lg">Square Miles of<br />Caribbean Magic</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
              </div>
            </div>
          </div>
        </section>

        {/* Verified Vendor Banner */}
        <section className="py-12 bg-primary/5 border-y border-primary/10">
          <div className="container px-4 md:px-8">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
              {[
                { icon: CheckCircle, text: "Verified Vendor" },
                { icon: Globe, text: "Worldwide Shipping" },
                { icon: Store, text: "Retail & Wholesale" },
                { icon: Shield, text: "100% Human Hair" },
              ].map((item, i) => (
                <motion.div
                  key={item.text}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-display text-lg font-semibold text-foreground">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Inspiring Young Entrepreneurs */}
        <section className="py-20 bg-gradient-cream">
          <div className="container px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                    🚀 Empowering Entrepreneurs
                  </span>
                  <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                    Start Your Business With Us
                  </h2>
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    We believe every young entrepreneur deserves the tools and support to build their empire. Whether you're starting online or in your home city, we've got your back.
                  </p>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  {
                    icon: Store,
                    title: "Retail & Wholesale Pricing",
                    description: "Access competitive wholesale prices worldwide. Whether you're buying for yourself or building inventory for your store, our tiered pricing helps you maximize profits.",
                  },
                  {
                    icon: Rocket,
                    title: "Launch Your Hair Business",
                    description: "Dream of owning a hair brand? We provide the premium products, guidance, and wholesale support to help you launch — online, in a salon, or from your living room.",
                  },
                  {
                    icon: Briefcase,
                    title: "Business Revamp Packages",
                    description: "Already have a business but need a boost? Our freelancing services include branding, social media strategy, and complete business revamp packages to elevate your brand.",
                  },
                  {
                    icon: TrendingUp,
                    title: "Grow & Scale Together",
                    description: "From marketing tips to supplier connections, we share the knowledge that helped us grow. Your success is our success — let's build empires together.",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    className="bg-background rounded-2xl p-8 shadow-soft hover:shadow-elevated transition-shadow"
                  >
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                      <item.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-foreground mb-4">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Freelancing Services */}
        <section className="py-20">
          <div className="container px-4 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
                <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  💼 Freelancing Services
                </span>
                <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
                  Business Revamp Packages
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Need help growing your business? Our expert freelancing services are designed to help entrepreneurs at every stage. We offer comprehensive packages to transform your brand and boost your revenue.
                </p>
                <ul className="space-y-4">
                  {[
                    "Brand identity & logo design",
                    "Social media strategy & content creation",
                    "Website setup & optimization",
                    "Business consulting & growth planning",
                    "Product photography & marketing materials",
                  ].map((service) => (
                    <li key={service} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">{service}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild size="lg" className="bg-gradient-gold-dark hover:opacity-90 text-primary-foreground shadow-gold mt-4">
                  <Link to="/contact">Inquire About Services</Link>
                </Button>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
                <div className="rounded-3xl bg-gradient-gold p-10 shadow-elevated">
                  <div className="space-y-6">
                    {[
                      { icon: Zap, stat: "50+", label: "Businesses Helped" },
                      { icon: Globe, stat: "15+", label: "Countries Served" },
                      { icon: TrendingUp, stat: "3x", label: "Avg Revenue Growth" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-4 bg-background/80 rounded-xl p-5">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <div className="font-display text-3xl font-bold text-foreground">{item.stat}</div>
                          <p className="text-muted-foreground text-sm">{item.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Mission & Values */}
        <section className="py-20 bg-gradient-cream">
          <div className="container px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                  Our Core Values
                </h2>
                <p className="text-2xl text-primary font-display italic">
                  "Top quality, affordable luxury, delivered worldwide."
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { icon: Award, title: "Quality First", desc: "We source only 100% virgin human hair from ethical suppliers. No synthetic blends, no compromises — just pure, beautiful hair." },
                  { icon: Heart, title: "Affordable Luxury", desc: "We've cut out the middlemen and work directly with suppliers to bring you premium hair at prices that respect your budget." },
                  { icon: Globe, title: "Global Reach", desc: "From our Caribbean home, we ship to queens everywhere — New York, London, Lagos, Tokyo. Same premium quality to your doorstep." },
                  { icon: Users, title: "Community & Mentorship", desc: "We're building a community of confident women and young entrepreneurs. When you grow with us, you join a sisterhood of boss queens." },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    className="bg-background rounded-2xl p-8 shadow-soft"
                  >
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                      <item.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-foreground mb-4">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-20">
          <div className="container px-4 md:px-8">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Why Boss Queens?
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Whether you're buying for yourself or building a business, we're the partner you can trust.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Shield, title: "100% Human Hair", desc: "Every strand is ethically-sourced virgin human hair. Style, color, and treat it just like your own." },
                { icon: Sparkles, title: "Long-Lasting Quality", desc: "With proper care, our hair lasts 12+ months. That's luxury that keeps giving." },
                { icon: Heart, title: "Customer & Entrepreneur First", desc: "Real support from real people. Whether you're shopping or starting a business, we're here for you." },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="text-center p-8 rounded-2xl hover:bg-gradient-cream transition-colors"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
                    <item.icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-gold">
          <div className="container px-4 md:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
                Ready to Be a Boss Queen?
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                Whether you're shopping for the perfect hair or ready to launch your own business, we're here to help you win. Premium products, wholesale pricing, and expert freelancing services — all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-gradient-gold-dark hover:opacity-90 text-primary-foreground shadow-gold">
                  <Link to="/#products">Shop Our Collection</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/5">
                  <Link to="/contact">Start Your Business</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
