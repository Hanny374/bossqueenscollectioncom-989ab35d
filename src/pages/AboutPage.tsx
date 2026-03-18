import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, Globe, Award, Users, Sparkles, Shield } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="About Us"
        description="Boss Queens Collection was founded in St. Maarten with a bold vision: to make premium, 100% human hair accessible to queens everywhere. Learn our story."
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
              <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground mb-6">
                Our Story
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                From a tiny Caribbean island to queens around the world — this is the Boss Queens Collection journey.
              </p>
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
                    <span className="text-primary font-semibold">St. Maarten</span> — a stunning Caribbean island of just 37 square miles, where the sun kisses the ocean and beauty is celebrated in every form. This is where Boss Queens Collection was born.
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

        {/* Mission & Vision */}
        <section className="py-20 bg-gradient-cream">
          <div className="container px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                  Our Mission
                </h2>
                <p className="text-2xl text-primary font-display italic">
                  "Top quality, affordable luxury, delivered worldwide."
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-background rounded-2xl p-8 shadow-soft">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Award className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground mb-4">Quality First</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We believe every woman deserves premium hair. That's why we source only 100% virgin human hair from ethical suppliers around the world. No synthetic blends, no compromises — just pure, beautiful hair that looks and feels natural.
                  </p>
                </div>

                <div className="bg-background rounded-2xl p-8 shadow-soft">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Heart className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground mb-4">Affordable Luxury</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Looking like a million bucks shouldn't cost a million bucks. We've cut out the middlemen and work directly with suppliers to bring you premium hair at prices that respect your budget without sacrificing quality.
                  </p>
                </div>

                <div className="bg-background rounded-2xl p-8 shadow-soft">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Globe className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground mb-4">Global Reach</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    From our Caribbean home, we ship to queens everywhere. Whether you're in New York, London, Lagos, or Tokyo — we deliver the same premium quality and exceptional service to your doorstep.
                  </p>
                </div>

                <div className="bg-background rounded-2xl p-8 shadow-soft">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Users className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground mb-4">Community Love</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We're more than a hair brand — we're a community of confident women who lift each other up. When you shop with us, you join a sisterhood of boss queens who know their worth.
                  </p>
                </div>
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
                When you choose us, you're not just buying hair — you're investing in confidence, quality, and a brand that truly cares.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-8 rounded-2xl hover:bg-gradient-cream transition-colors">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
                  <Shield className="w-8 h-8" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-3">100% Human Hair</h3>
                <p className="text-muted-foreground">
                  Every strand is ethically-sourced virgin human hair. Style, color, and treat it just like your own.
                </p>
              </div>

              <div className="text-center p-8 rounded-2xl hover:bg-gradient-cream transition-colors">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-3">Long-Lasting Quality</h3>
                <p className="text-muted-foreground">
                  With proper care, our hair lasts 12+ months. That's luxury that keeps giving.
                </p>
              </div>

              <div className="text-center p-8 rounded-2xl hover:bg-gradient-cream transition-colors">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-3">Customer First</h3>
                <p className="text-muted-foreground">
                  Real support from real people who care about your satisfaction. We're here for you, always.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Promise */}
        <section className="py-20 bg-gradient-gold">
          <div className="container px-4 md:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
                The Boss Queens Promise
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                We promise to always deliver premium quality hair at fair prices, treat every customer like royalty, and never stop striving to be the best hair brand in the world. Because when you look good, you feel good — and that's what being a Boss Queen is all about.
              </p>
              <Button asChild size="lg" className="bg-gradient-gold-dark hover:opacity-90 text-primary-foreground shadow-gold">
                <Link to="/#products">
                  Shop Our Collection
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
