import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, Youtube, Crown, MapPin, Phone, Clock } from "lucide-react";
import { VisaLogo, MastercardLogo, AmexLogo, DiscoverLogo, PayPalLogo, ApplePayLogo, GooglePayLogo } from "./PaymentLogos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Social media links - Update these with your actual account URLs
const SOCIAL_LINKS = {
  instagram: "https://instagram.com/bossqueenscollection",
  facebook: "https://facebook.com/bossqueenscollection",
  tiktok: "https://tiktok.com/@bossqueenscollection",
  youtube: "https://youtube.com/@bossqueenscollection",
  pinterest: "https://pinterest.com/bossqueenscollection",
  email: "mailto:Bossqueenscollections@gmail.com",
};

// TikTok icon component (not in lucide)
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

// Pinterest icon component
const PinterestIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0a12 12 0 0 0-4.37 23.17c-.1-.94-.2-2.4.04-3.43l1.43-6.09s-.36-.73-.36-1.8c0-1.69.98-2.95 2.2-2.95 1.04 0 1.54.78 1.54 1.72 0 1.05-.67 2.62-1.01 4.07-.29 1.21.61 2.2 1.8 2.2 2.17 0 3.83-2.28 3.83-5.58 0-2.92-2.1-4.96-5.1-4.96-3.47 0-5.51 2.6-5.51 5.3 0 1.05.4 2.17.91 2.78.1.12.11.23.08.35l-.34 1.36c-.05.22-.18.27-.4.16-1.5-.7-2.44-2.88-2.44-4.64 0-3.78 2.75-7.25 7.92-7.25 4.16 0 7.4 2.97 7.4 6.93 0 4.13-2.6 7.46-6.22 7.46-1.22 0-2.36-.63-2.75-1.38l-.75 2.86c-.27 1.04-1 2.35-1.49 3.15A12 12 0 1 0 12 0z"/>
  </svg>
);

const socialLinks = [
  { href: SOCIAL_LINKS.instagram, icon: Instagram, label: "Instagram" },
  { href: SOCIAL_LINKS.facebook, icon: Facebook, label: "Facebook" },
  { href: SOCIAL_LINKS.tiktok, icon: TikTokIcon, label: "TikTok" },
  { href: SOCIAL_LINKS.youtube, icon: Youtube, label: "YouTube" },
  { href: SOCIAL_LINKS.pinterest, icon: PinterestIcon, label: "Pinterest" },
  { href: SOCIAL_LINKS.email, icon: Mail, label: "Email" },
];

export const Footer = () => {
  return (
    <footer className="bg-espresso text-cream relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-champagne/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      {/* Newsletter Section */}
      <div className="border-b border-cream/10 relative">
        <div className="container px-4 md:px-8 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <Crown className="w-10 h-10 text-primary mx-auto mb-4" />
            <h3 className="font-display text-3xl md:text-4xl font-bold mb-4 text-cream">
              Join the Boss Queens
            </h3>
            {/* email setup */}
            <p className="text-cream/70 mb-8 text-lg">
              Subscribe for exclusive deals, new arrivals, and beauty tips delivered to your inbox.
            </p>
            <form 
              action="https://bossqueenscollection.us1.list-manage.com/subscribe/post?u=2246e87e87954d8c8ffa90d4e&amp;id=a66ecc91b0&amp;f_id=000114e1f0" 
              method="post" 
              target="_blank"
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto relative"
            >
              <Input 
                type="email" 
                name="EMAIL"
                required
                placeholder="Enter your email" 
                className="bg-cream/10 border-cream/20 text-cream placeholder:text-cream/50 focus-visible:ring-primary h-12"
              />
              {/* Mailchimp anti-bot honeypot */}
              <div aria-hidden="true" style={{ position: 'absolute', left: '-5000px' }}>
                <input type="text" name="b_2246e87e87954d8c8ffa90d4e_a66ecc91b0" tabIndex={-1} defaultValue="" />
              </div>
              <Button type="submit" name="subscribe" className="bg-gradient-gold hover:opacity-90 text-espresso font-semibold shrink-0 h-12 px-8">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container px-4 md:px-8 py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <Crown className="w-6 h-6 text-primary" />
              <span className="font-display text-2xl font-bold text-cream">Boss Queens</span>
            </Link>
            <p className="text-cream/70 mb-6 leading-relaxed">
              Premium 100% human hair wigs, bundles, and cosmetics. Affordable luxury for every queen.
            </p>
            <div className="flex flex-wrap gap-2">
              {socialLinks.map((social) => (
                <a 
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow us on ${social.label}`}
                  className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center hover:bg-primary hover:text-espresso transition-all duration-300"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-6 text-cream">Shop</h4>
            <ul className="space-y-4">
              {[
                { label: "All Products", href: "/#products" },
                { label: "Colored Wigs", href: "/#products?category=colored-wigs" },
                { label: "Bob Wigs", href: "/#products?category=bob-wigs" },
                { label: "Headband Wigs", href: "/#products?category=headband-wigs" },
                { label: "V Part & Half Wigs", href: "/#products?category=v-part-half-wigs" },
                { label: "Boho Braids", href: "/#products?category=boho-braids" },
                { label: "Hair Bundles", href: "/#products?category=bundles" },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-cream/70 hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-6 text-cream">Support</h4>
            <ul className="space-y-4">
              {[
                { label: "Contact Us", href: "/contact" },
                { label: "About Us", href: "/about" },
                { label: "Shipping Info", href: "/shipping" },
                { label: "FAQ", href: "/faq" },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-cream/70 hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-6 text-cream">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-cream/70">St. Maarten, Caribbean</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <a href="mailto:Bossqueenscollections@gmail.com" className="text-cream/70 hover:text-primary transition-colors">
                  Bossqueenscollections@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <a href="tel:+17215853221" className="text-cream/70 hover:text-primary transition-colors">
                  +1 (721) 585-3221
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-cream/70 text-sm">We accept</span>
                <VisaLogo className="h-8 w-auto" />
                <MastercardLogo className="h-8 w-auto" />
                <AmexLogo className="h-8 w-auto" />
                <DiscoverLogo className="h-8 w-auto" />
                <PayPalLogo className="h-8 w-auto" />
                <ApplePayLogo className="h-8 w-auto" />
                <GooglePayLogo className="h-8 w-auto" />
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary shrink-0" />
                <span className="text-cream/70">Open 24/7</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-cream/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-cream/50 text-sm space-y-1">
            <p>© 2026 Boss Queens Collection. All rights reserved.</p>
            <p>Powered by <a href="https://www.shopify.com" target="_blank" rel="noopener noreferrer" className="hover:text-cream transition-colors underline">Shopify</a></p>
          </div>
          <div className="flex gap-6 text-sm text-cream/50">
            <Link to="/privacy-policy" className="hover:text-cream transition-colors">Privacy Policy</Link>
            <Link to="/shipping" className="hover:text-cream transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
