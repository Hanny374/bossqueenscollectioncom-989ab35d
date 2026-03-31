import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter, Youtube, Send, Clock, Globe, Package, Briefcase, MessageCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SEOHead } from "@/components/SEOHead";
import { motion } from "framer-motion";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.name.length > 100 || formData.email.length > 255 || formData.message.length > 1000) {
      toast.error("Please keep your inputs within the character limits");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/contact-form`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to send message");
        return;
      }

      toast.success("Message sent!", {
        description: "We'll get back to you within 24-48 hours.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Contact Us"
        description="Get in touch with Boss Queens Collection. Questions about hair products, orders, or shipping? We're here to help. Email, phone, or send us a message."
        path="/contact"
      />
      <Header />
      <main className="py-16">
        <div className="container px-4 md:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground mb-6">
              Get In <span className="text-gradient-gold">Touch</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Custom wig orders, wholesale inquiries, or general questions — we're here to help you slay.
            </p>
          </div>

          {/* Contact Info Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto mb-12">
            {[
              {
                icon: Mail,
                label: "Email Us",
                value: "Bossqueenscollections@gmail.com",
                href: "mailto:Bossqueenscollections@gmail.com",
                sub: "We reply within 24 hours",
              },
              {
                icon: Phone,
                label: "Call / WhatsApp",
                value: "+1 (721) 585-3221",
                href: "tel:+17215853221",
                sub: "Available 24/7",
              },
              {
                icon: MapPin,
                label: "Location",
                value: "St. Maarten, Caribbean",
                href: undefined,
                sub: "Shipping worldwide 🌍",
              },
              {
                icon: Clock,
                label: "Response Time",
                value: "Within 24 Hours",
                href: undefined,
                sub: "Mon–Sun, all day",
              },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl p-6 shadow-soft border border-border text-center"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{item.label}</p>
                {item.href ? (
                  <a href={item.href} className="font-semibold text-foreground hover:text-primary transition-colors text-sm break-all">
                    {item.value}
                  </a>
                ) : (
                  <p className="font-semibold text-foreground text-sm">{item.value}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">{item.sub}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <div className="space-y-8">
              <div className="bg-card rounded-2xl p-8 shadow-soft border border-border">
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">Request a Custom Wig</h2>
                <p className="text-sm text-muted-foreground mb-6">Describe your ideal wig — we'll get back to you with a quote within 24-48 hours.</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-foreground">
                        Name <span className="text-destructive">*</span>
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        maxLength={100}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-foreground">
                        Email <span className="text-destructive">*</span>
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        maxLength={255}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium text-foreground">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="e.g. Custom wig inquiry, Color request, etc."
                      maxLength={200}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium text-foreground">
                      Wig Details <span className="text-destructive">*</span>
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Describe your dream wig: hair type, length, color, density, lace type, and any other preferences..."
                      rows={6}
                      maxLength={1000}
                      required
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {formData.message.length}/1000
                    </p>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-gold hover:opacity-90 text-primary-foreground shadow-gold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Wholesale Inquiry Box */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 rounded-2xl p-8 shadow-soft border-2 border-primary/20 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-display text-2xl font-bold text-foreground">Wholesale Inquiries</h2>
                      <p className="text-xs text-primary font-medium uppercase tracking-wider">Start or Grow Your Business</p>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm mb-5 leading-relaxed">
                    Boss Queens Collection is a verified vendor offering competitive wholesale pricing worldwide. Whether you're launching an online store or selling locally, we provide bulk orders with tiered pricing to help you maximize profit.
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                      { icon: Package, text: "Bulk Order Discounts" },
                      { icon: Globe, text: "Worldwide Shipping" },
                      { icon: MessageCircle, text: "Dedicated Support" },
                      { icon: Briefcase, text: "Business Revamp Packages" },
                    ].map((item) => (
                      <div key={item.text} className="flex items-center gap-2 text-sm text-foreground">
                        <item.icon className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button asChild className="bg-gradient-gold hover:opacity-90 text-primary-foreground shadow-gold flex-1">
                      <a href="mailto:Bossqueenscollections@gmail.com?subject=Wholesale%20Inquiry">
                        <Mail className="w-4 h-4 mr-2" />
                        Email for Wholesale
                      </a>
                    </Button>
                    <Button asChild variant="outline" className="border-primary/30 hover:bg-primary/5 flex-1">
                      <a href="https://wa.me/17215853221?text=Hi%2C%20I%27m%20interested%20in%20wholesale%20pricing" target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        WhatsApp Us
                      </a>
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Social Media */}
              <div className="bg-card rounded-2xl p-8 shadow-soft border border-border">
                <h2 className="font-display text-2xl font-bold text-foreground mb-6">Follow Us</h2>
                <p className="text-muted-foreground mb-6">
                  Stay connected for styling tips, new arrivals, and exclusive offers!
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors group">
                    <Instagram className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-foreground">Instagram</span>
                  </a>
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors group">
                    <Facebook className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-foreground">Facebook</span>
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors group">
                    <Twitter className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-foreground">Twitter</span>
                  </a>
                  <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors group">
                    <Youtube className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-foreground">YouTube</span>
                  </a>
                </div>
              </div>

              {/* How Custom Orders Work */}
              <div className="bg-gradient-gold rounded-2xl p-8 text-primary-foreground">
                <h3 className="font-display text-xl font-bold mb-3">How Custom Orders Work</h3>
                <ul className="space-y-2 opacity-90 text-sm mb-4">
                  <li>✦ Tell us your desired style, color, length & density</li>
                  <li>✦ We'll send you a quote within 24-48 hours</li>
                  <li>✦ Your custom wig is handcrafted & shipped to you</li>
                  <li>✦ 100% virgin human hair, made to order</li>
                </ul>
                <Button variant="secondary" className="bg-background text-foreground hover:bg-background/90" asChild>
                  <a href="/#products">Browse Ready-Made Wigs</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;