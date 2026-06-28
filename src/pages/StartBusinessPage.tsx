import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Crown, CheckCircle2, Sparkles, Rocket, Target, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

type FormState = {
  full_name: string;
  email: string;
  phone: string;
  country: string;
  business_stage: string;
  business_type: string;
  monthly_budget: string;
  target_customers: string;
  goals: string;
  timeline: string;
  notes: string;
};

const initialState: FormState = {
  full_name: "",
  email: "",
  phone: "",
  country: "",
  business_stage: "",
  business_type: "",
  monthly_budget: "",
  target_customers: "",
  goals: "",
  timeline: "",
  notes: "",
};

const StartBusinessPage = () => {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.business_stage) {
      toast.error("Please fill in your name, email, and current stage.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("business_inquiries").insert([form]);
    setSubmitting(false);
    if (error) {
      toast.error("Something went wrong. Please try again or email us directly.");
      return;
    }
    setSubmitted(true);
    toast.success("We received your application — check your email within 24 hours.");
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Start Your Hair Business — Boss Queens Collection</title>
        <meta
          name="description"
          content="Launch your own luxury hair brand with Boss Queens Collection. Take our 2-minute questionnaire to get a custom startup plan, wholesale pricing, and mentorship."
        />
        <link rel="canonical" href="https://bossqueenscollection.com/start-business" />
      </Helmet>
      <Header />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-espresso via-espresso/95 to-primary/30 py-16 md:py-24">
          <div className="container px-4 md:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center text-cream"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 mb-5">
                <Crown className="w-4 h-4 text-primary" />
                <span className="text-xs uppercase tracking-[0.25em] text-primary font-semibold">Start Your Business</span>
              </div>
              <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold mb-5 leading-tight">
                Launch Your Own <span className="text-gradient-gold">Luxury Hair Brand</span>
              </h1>
              <p className="text-cream/80 text-base md:text-lg max-w-2xl mx-auto mb-7">
                Take the 2-minute questionnaire and we'll build you a custom startup plan with wholesale pricing,
                supplier access, and a sales playbook from a 7-figure operator.
              </p>
              <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm text-cream/80">
                {[
                  { icon: Rocket, label: "Launch in 30 days" },
                  { icon: Target, label: "Wholesale pricing" },
                  { icon: TrendingUp, label: "Scale to 6 figures" },
                ].map((b) => (
                  <div key={b.label} className="flex items-center gap-2">
                    <b.icon className="w-4 h-4 text-primary" />
                    <span>{b.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Form */}
        <section className="py-12 md:py-20 bg-background">
          <div className="container px-4 md:px-8 max-w-3xl">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center bg-gradient-to-br from-cream to-primary/5 border border-primary/20 rounded-3xl p-10 md:p-16 shadow-soft"
              >
                <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-gradient-gold flex items-center justify-center shadow-glow">
                  <CheckCircle2 className="w-8 h-8 text-espresso" />
                </div>
                <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-3">
                  Application Received 👑
                </h2>
                <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto mb-6">
                  We'll review your goals and send a personalized startup roadmap to <span className="text-foreground font-medium">{form.email}</span> within 24 hours.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link
                    to="/product/ai-custom-startup-plan"
                    className="inline-flex items-center h-11 px-6 rounded-full bg-gradient-gold text-espresso font-semibold shadow-glow hover:opacity-90 transition-opacity"
                  >
                    Pay $250 Deposit · Lock In My Plan
                  </Link>
                  <Link
                    to="/product/60-seconds-to-100k-brand-blueprint-ebook"
                    className="inline-flex items-center h-11 px-6 rounded-full border-2 border-primary/30 text-foreground font-semibold hover:bg-primary/5 transition-colors"
                  >
                    Or grab the $47 Ebook
                  </Link>
                  <Link
                    to="/"
                    className="inline-flex items-center h-11 px-6 rounded-full border-2 border-primary/30 text-foreground font-semibold hover:bg-primary/5 transition-colors"
                  >
                    Back to Home
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-card border border-border/60 rounded-3xl p-6 md:p-10 shadow-soft space-y-6"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                    Tell us about your business
                  </h2>
                </div>
                <p className="text-muted-foreground text-sm -mt-3">
                  All answers are confidential. We use this to tailor your plan.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Full name *">
                    <Input value={form.full_name} onChange={(e) => update("full_name", e.target.value)} required placeholder="Jasmine R." />
                  </Field>
                  <Field label="Email *">
                    <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required placeholder="you@email.com" />
                  </Field>
                  <Field label="Phone / WhatsApp">
                    <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+1 …" />
                  </Field>
                  <Field label="Country">
                    <Input value={form.country} onChange={(e) => update("country", e.target.value)} placeholder="United States" />
                  </Field>
                </div>

                <Field label="Where are you in your business journey? *">
                  <Select value={form.business_stage} onValueChange={(v) => update("business_stage", v)}>
                    <SelectTrigger><SelectValue placeholder="Select your current stage" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="just-an-idea">Just an idea — haven't started</SelectItem>
                      <SelectItem value="planning">Planning & researching</SelectItem>
                      <SelectItem value="launching-soon">Launching in the next 90 days</SelectItem>
                      <SelectItem value="already-selling">Already selling — want to scale</SelectItem>
                      <SelectItem value="rebranding">Rebranding / pivoting</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="What kind of business?">
                  <Select value={form.business_type} onValueChange={(v) => update("business_type", v)}>
                    <SelectTrigger><SelectValue placeholder="Choose a focus" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wigs">Wigs & lace fronts</SelectItem>
                      <SelectItem value="bundles">Bundles & extensions</SelectItem>
                      <SelectItem value="salon">Salon / stylist</SelectItem>
                      <SelectItem value="boutique">Online boutique</SelectItem>
                      <SelectItem value="digital">Digital products / coaching</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Startup budget">
                    <Select value={form.monthly_budget} onValueChange={(v) => update("monthly_budget", v)}>
                      <SelectTrigger><SelectValue placeholder="Select budget" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under-500">Under $500</SelectItem>
                        <SelectItem value="500-2k">$500 – $2,000</SelectItem>
                        <SelectItem value="2k-5k">$2,000 – $5,000</SelectItem>
                        <SelectItem value="5k-10k">$5,000 – $10,000</SelectItem>
                        <SelectItem value="10k-plus">$10,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="When do you want to launch?">
                    <Select value={form.timeline} onValueChange={(v) => update("timeline", v)}>
                      <SelectTrigger><SelectValue placeholder="Select timeline" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asap">ASAP — this month</SelectItem>
                        <SelectItem value="30-days">Within 30 days</SelectItem>
                        <SelectItem value="90-days">Within 90 days</SelectItem>
                        <SelectItem value="6-months">Within 6 months</SelectItem>
                        <SelectItem value="exploring">Just exploring</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <Field label="Who is your dream customer?">
                  <Textarea
                    value={form.target_customers}
                    onChange={(e) => update("target_customers", e.target.value)}
                    placeholder="e.g. Working women 25–40 who want luxury hair without the boutique markup."
                    rows={3}
                  />
                </Field>

                <Field label="What's your #1 goal for the next 6 months?">
                  <Textarea
                    value={form.goals}
                    onChange={(e) => update("goals", e.target.value)}
                    placeholder="e.g. Hit $10K months, build a loyal customer base, launch my first 5 products."
                    rows={3}
                  />
                </Field>

                <Field label="Anything else we should know?">
                  <Textarea
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    placeholder="Share your biggest challenge or questions."
                    rows={3}
                  />
                </Field>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 rounded-full bg-gradient-gold text-espresso font-semibold text-base shadow-glow hover:opacity-90"
                >
                  {submitting ? "Submitting…" : "Get My Custom Startup Plan"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Custom AI-built startup plan — <span className="text-primary font-semibold">$1,500 total</span>, paid as
                  3 installments of $500 (first installment split into two $250 payments). Start today with a
                  <span className="text-primary font-semibold"> $250 deposit</span>. PDF roadmap delivered within 3–5 business days.
                </p>
              </motion.form>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium text-foreground">{label}</Label>
    {children}
  </div>
);

export default StartBusinessPage;