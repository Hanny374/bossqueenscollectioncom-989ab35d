import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, BookOpen, Download, Mail, Hash, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const EbookAccessPage = () => {
  const [params] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(params.get("order") || "");
  const [email, setEmail] = useState(params.get("email") || "");
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [orderName, setOrderName] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !email.trim()) {
      toast.error("Please enter both your order number and email.");
      return;
    }
    setLoading(true);
    setDownloadUrl(null);
    try {
      const { data, error } = await supabase.functions.invoke("ebook-download", {
        body: { orderNumber: orderNumber.trim(), email: email.trim() },
      });
      if (error) {
        const msg = (error as { message?: string }).message || "Couldn't verify your order.";
        toast.error(msg);
        return;
      }
      if (data?.downloadUrl) {
        setDownloadUrl(data.downloadUrl);
        setOrderName(data.orderName || null);
        toast.success("Ebook unlocked! Download will start automatically.");
        // Auto-trigger download
        window.location.href = data.downloadUrl;
      } else if (data?.error) {
        toast.error(data.error);
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-submit when both prefilled via query params
  useEffect(() => {
    if (params.get("order") && params.get("email") && !downloadUrl && !loading) {
      handleSubmit(new Event("submit") as unknown as React.FormEvent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Access Your Ebook | Boss Queens Collection</title>
        <meta name="description" content="Download your Boss Queens digital playbook after checkout." />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-gold mb-4 shadow-glow">
            <BookOpen className="w-8 h-8 text-espresso" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Access Your Ebook
          </h1>
          <p className="text-muted-foreground">
            Enter your order number and email from your Shopify confirmation email to download your copy of the Boss Queens Playbook.
          </p>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8 shadow-lg">
          {downloadUrl ? (
            <div className="text-center space-y-5 py-4">
              <CheckCircle2 className="w-14 h-14 text-primary mx-auto" />
              <div>
                <h2 className="font-display text-2xl font-semibold text-foreground mb-1">
                  You're in, Queen 👑
                </h2>
                {orderName && (
                  <p className="text-sm text-muted-foreground">Verified order {orderName}</p>
                )}
              </div>
              <a href={downloadUrl} download>
                <Button size="lg" className="bg-gradient-gold hover:opacity-90 text-espresso shadow-glow">
                  <Download className="w-5 h-5 mr-2" />
                  Download Ebook (PDF)
                </Button>
              </a>
              <p className="text-xs text-muted-foreground">
                This download link is valid for 1 hour. You can return to this page anytime to generate a new one.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="order">
                  <Hash className="w-4 h-4 inline mr-1.5" />
                  Order Number
                </Label>
                <Input
                  id="order"
                  placeholder="#1234"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  required
                  className="h-12"
                />
                <p className="text-xs text-muted-foreground">From your Shopify confirmation email (e.g. #1042).</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="w-4 h-4 inline mr-1.5" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                />
                <p className="text-xs text-muted-foreground">The email you used at checkout.</p>
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full bg-gradient-gold hover:opacity-90 text-espresso shadow-glow h-12"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Verifying order…</>
                ) : (
                  <>Unlock & Download</>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground pt-2">
                Trouble accessing your ebook? Email{" "}
                <a href="mailto:Bossqueenscollections@gmail.com" className="text-primary underline">
                  Bossqueenscollections@gmail.com
                </a>
              </p>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EbookAccessPage;