import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter, Youtube, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SEOHead } from "@/components/SEOHead";

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

    // Client-side validation
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
              Custom Wig <span className="text-gradient-gold">Orders</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Want a wig made just for you? Tell us your dream style — color, length, density, texture — and we'll craft it to perfection.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <div className="bg-card rounded-2xl p-8 shadow-soft border border-border">
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">Send Us a Message</h2>
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
                    placeholder="How can we help?"
                    maxLength={200}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-foreground">
                    Message <span className="text-destructive">*</span>
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us more about your inquiry..."
                    rows={5}
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

            {/* Contact Info & Social */}
            <div className="space-y-8">
              {/* Contact Information */}
              <div className="bg-card rounded-2xl p-8 shadow-soft border border-border">
                <h2 className="font-display text-2xl font-bold text-foreground mb-6">Contact Information</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Email</p>
                      <a
                        href="mailto:Bossqueenscollections@gmail.com"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        Bossqueenscollections@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Phone</p>
                      <a
                        href="tel:+17215853221"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        +1 (721) 585-3221
                      </a>
                      <p className="text-xs text-muted-foreground mt-1">Open 24/7</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Location</p>
                      <p className="text-muted-foreground">St. Maarten, Caribbean</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-card rounded-2xl p-8 shadow-soft border border-border">
                <h2 className="font-display text-2xl font-bold text-foreground mb-6">Follow Us</h2>
                <p className="text-muted-foreground mb-6">
                  Stay connected for styling tips, new arrivals, and exclusive offers!
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors group"
                  >
                    <Instagram className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-foreground">Instagram</span>
                  </a>

                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors group"
                  >
                    <Facebook className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-foreground">Facebook</span>
                  </a>

                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors group"
                  >
                    <Twitter className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-foreground">Twitter</span>
                  </a>

                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors group"
                  >
                    <Youtube className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-foreground">YouTube</span>
                  </a>
                </div>
              </div>

              {/* FAQ Teaser */}
              <div className="bg-gradient-gold rounded-2xl p-8 text-primary-foreground">
                <h3 className="font-display text-xl font-bold mb-3">Need Quick Answers?</h3>
                <p className="opacity-90 mb-4">
                  Check out our product pages for detailed hair specs, care instructions, and sizing guides.
                </p>
                <Button variant="secondary" className="bg-background text-foreground hover:bg-background/90">
                  Browse Products
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