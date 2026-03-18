import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { SEOHead } from "@/components/SEOHead";

const sections = [
  {
    title: "Information We Collect",
    content:
      "We collect information you provide directly, such as your name, email address, and shipping details when you place an order or contact us. We also collect browsing data through cookies and similar technologies, including your IP address, browser type, and pages visited.",
  },
  {
    title: "How We Use Your Information",
    content:
      "We use your information to process orders, provide customer support, improve our website experience, send promotional communications (with your consent), and comply with legal obligations. We never sell your personal data to third parties.",
  },
  {
    title: "Cookies",
    content:
      "Our website uses cookies to enhance your browsing experience, remember your preferences, and analyze site traffic. You can manage your cookie preferences through your browser settings or by using the cookie consent banner on our site. Essential cookies are required for the site to function properly.",
  },
  {
    title: "Data Sharing",
    content:
      "We may share your information with trusted third-party service providers who assist us in operating our website, processing payments, and delivering orders. These providers are contractually obligated to protect your data and use it only for the services they provide to us.",
  },
  {
    title: "Data Security",
    content:
      "We implement industry-standard security measures to protect your personal information, including SSL encryption for all data transmissions and secure storage of your data. However, no method of transmission over the internet is 100% secure.",
  },
  {
    title: "Your Rights",
    content:
      "You have the right to access, correct, or delete your personal data. You may also opt out of marketing communications at any time. To exercise any of these rights, please contact us at Bossqueenscollections@gmail.com.",
  },
  {
    title: "Changes to This Policy",
    content:
      "We may update this privacy policy from time to time. Any changes will be posted on this page with an updated effective date. We encourage you to review this policy periodically.",
  },
  {
    title: "Contact Us",
    content:
      "If you have any questions about this privacy policy or how we handle your data, please contact us at Bossqueenscollections@gmail.com or call +1 (721) 585-3221.",
  },
];

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Privacy Policy"
        description="Boss Queens Collection privacy policy. Learn how we collect, use, and protect your personal information when you shop with us."
        path="/privacy-policy"
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
              Legal
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground text-lg mb-12 max-w-2xl">
              Your privacy matters to us. This policy explains how Boss Queens Collection collects, uses, and protects your personal information.
            </p>
          </motion.div>

          <div className="grid gap-8">
            {sections.map((section, i) => (
              <motion.div
                key={section.title}
                className="bg-card border border-border/60 rounded-2xl p-6 hover:border-primary/20 transition-all duration-300"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <h2 className="font-display text-lg font-bold text-foreground mb-2">
                  {section.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {section.content}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.p
            className="text-muted-foreground text-sm mt-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Last updated: March 2026
          </motion.p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
