import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SEOHead } from "@/components/SEOHead";
import { Helmet } from "react-helmet-async";

const faqs = [
  {
    question: "Is the hair 100% human hair?",
    answer: "Yes! All of our products are made from 100% premium virgin human hair. We never use synthetic blends. Our hair can be dyed, straightened, curled, and styled just like your natural hair.",
  },
  {
    question: "How long does shipping take?",
    answer: "Processing takes 1–3 business days. Delivery times vary: Caribbean & US (5–10 days), Europe (7–14 days), Rest of World (10–21 days). All orders include tracking.",
  },
  {
    question: "Do you offer free shipping?",
    answer: "Yes! We offer free worldwide shipping on all orders over $100. For orders under $100, a flat shipping fee will be calculated at checkout.",
  },
  {
    question: "What is your return policy?",
    answer: "We accept returns within 14 days of delivery for unused, unaltered hair in its original packaging. Please contact us at Bossqueenscollections@gmail.com to initiate a return.",
  },
  {
    question: "How do I care for my hair?",
    answer: "We recommend using sulfate-free shampoo and conditioner, detangling gently from ends to roots, and storing on a wig stand or in a silk bag when not in use. Avoid excessive heat to extend the life of your hair.",
  },
  {
    question: "Can I dye or bleach the hair?",
    answer: "Absolutely! Since our hair is 100% virgin human hair, it can be dyed, bleached, and colored. We recommend having a professional stylist perform any color treatments for best results.",
  },
  {
    question: "How do I choose the right length?",
    answer: "Hair length is measured when straight. If you prefer curly or wavy textures, keep in mind the hair will appear shorter due to the curl pattern. Feel free to message us on WhatsApp for personalized recommendations.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all Visa payments worldwide via bank account. This allows customers from any country to securely purchase our products with ease.",
  },
  {
    question: "How can I contact you?",
    answer: "You can reach us via email at Bossqueenscollections@gmail.com, by phone at +1 (721) 585-3221, or through our WhatsApp chat. We're available 24/7!",
  },
];

const FAQPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="FAQ"
        description="Frequently asked questions about Boss Queens Collection hair products, shipping, returns, and care. Get answers about our 100% human hair wigs and bundles."
        path="/faq"
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          })}
        </script>
      </Helmet>
      <Header />
      <main className="pt-32 pb-20">
        <div className="container px-4 md:px-8 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-primary text-sm font-medium tracking-[0.2em] uppercase mb-3 block">
              Help
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-muted-foreground text-lg mb-12 max-w-2xl">
              Got questions? We've got answers. If you can't find what you're looking for, feel free to contact us.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="bg-card border border-border/60 rounded-2xl px-6 hover:border-primary/20 transition-all duration-300"
                >
                  <AccordionTrigger className="font-display text-base font-semibold text-foreground hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQPage;
