import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Star, Check, X, Loader2, Shield, Plus, Upload, Trash2 } from "lucide-react";

interface ReviewRow {
  id: string;
  user_id: string;
  product_handle: string;
  product_title: string;
  rating: number;
  title: string | null;
  body: string;
  photos: string[];
  is_verified_purchase: boolean;
  status: string;
  created_at: string;
  profiles: { display_name: string | null } | null;
}

interface ImportReview {
  reviewer_name: string;
  rating: number;
  title: string;
  body: string;
  product_handle: string;
  product_title: string;
}

const EMPTY_IMPORT: ImportReview = {
  reviewer_name: "",
  rating: 5,
  title: "",
  body: "",
  product_handle: "",
  product_title: "",
};

const AdminReviewsPage = () => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"manage" | "import">("manage");

  // Import state
  const [importReviews, setImportReviews] = useState<ImportReview[]>([{ ...EMPTY_IMPORT }]);
  const [bulkText, setBulkText] = useState("");
  const [importMode, setImportMode] = useState<"form" | "bulk">("form");
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (isAdmin) fetchReviews();
  }, [isAdmin, filter]);

  const fetchReviews = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("status", filter)
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      const userIds = data.map(r => r.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      setReviews(data.map(r => ({ ...r, profiles: profileMap.get(r.user_id) || null })));
    } else {
      setReviews([]);
    }
    setIsLoading(false);
  };

  const updateStatus = async (reviewId: string, status: "approved" | "rejected") => {
    setActionLoading(reviewId);
    const { error } = await supabase
      .from("reviews")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", reviewId);
    if (error) {
      toast.error("Failed to update review");
    } else {
      toast.success(`Review ${status}!`);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    }
    setActionLoading(null);
  };

  const updateImportReview = (index: number, field: keyof ImportReview, value: string | number) => {
    setImportReviews(prev => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));
  };

  const addImportRow = () => {
    setImportReviews(prev => [...prev, { ...EMPTY_IMPORT }]);
  };

  const removeImportRow = (index: number) => {
    setImportReviews(prev => prev.filter((_, i) => i !== index));
  };

  const parseBulkText = () => {
    try {
      // Support JSON array format
      const parsed = JSON.parse(bulkText);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      const mapped: ImportReview[] = arr.map((item: any) => ({
        reviewer_name: item.reviewer_name || item.name || item.author || "Customer",
        rating: Math.min(5, Math.max(1, Number(item.rating) || 5)),
        title: item.title || "",
        body: item.body || item.review || item.text || item.content || "",
        product_handle: item.product_handle || item.handle || "",
        product_title: item.product_title || item.product || "",
      }));
      setImportReviews(mapped);
      setImportMode("form");
      toast.success(`Parsed ${mapped.length} reviews! Review and submit.`);
    } catch {
      // Try line-by-line format: "Name | Rating | Title | Body | Handle | Product"
      const lines = bulkText.split("\n").filter(l => l.trim());
      if (lines.length === 0) {
        toast.error("No reviews found. Use JSON format or pipe-separated format.");
        return;
      }
      const mapped: ImportReview[] = lines.map(line => {
        const parts = line.split("|").map(p => p.trim());
        return {
          reviewer_name: parts[0] || "Customer",
          rating: Math.min(5, Math.max(1, Number(parts[1]) || 5)),
          title: parts[2] || "",
          body: parts[3] || "",
          product_handle: parts[4] || "",
          product_title: parts[5] || "",
        };
      });
      setImportReviews(mapped);
      setImportMode("form");
      toast.success(`Parsed ${mapped.length} reviews! Review and submit.`);
    }
  };

  const handleImport = async () => {
    if (!user) return;
    const valid = importReviews.filter(r => r.body.trim() && r.product_handle.trim() && r.product_title.trim());
    if (valid.length === 0) {
      toast.error("Add at least one review with body, product handle, and product title.");
      return;
    }

    setIsImporting(true);

    // First ensure profile display_names exist for imported reviewer names
    const inserts = valid.map(r => ({
      user_id: user.id,
      rating: r.rating,
      title: r.title || null,
      body: r.body,
      product_handle: r.product_handle,
      product_title: r.product_title,
      is_verified_purchase: true,
      status: "approved",
      photos: [],
    }));

    const { error } = await supabase.from("reviews").insert(inserts);

    if (error) {
      toast.error("Failed to import reviews: " + error.message);
    } else {
      toast.success(`${valid.length} reviews imported and auto-approved!`);
      setImportReviews([{ ...EMPTY_IMPORT }]);
      setBulkText("");
      fetchReviews();
    }
    setIsImporting(false);
  };

  if (authLoading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-28 pb-20">
        <div className="container px-4 md:px-8 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="font-display text-3xl font-bold text-foreground">Review Management</h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-border pb-3">
            <Button
              variant={activeTab === "manage" ? "default" : "ghost"}
              onClick={() => setActiveTab("manage")}
              className={activeTab === "manage" ? "bg-primary text-primary-foreground" : ""}
            >
              Manage Reviews
            </Button>
            <Button
              variant={activeTab === "import" ? "default" : "ghost"}
              onClick={() => setActiveTab("import")}
              className={activeTab === "import" ? "bg-primary text-primary-foreground" : ""}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import DSers/AliExpress Reviews
            </Button>
          </div>

          {activeTab === "manage" && (
            <>
              {/* Filters */}
              <div className="flex gap-2 mb-6">
                {(["pending", "approved", "rejected"] as const).map((s) => (
                  <Button
                    key={s}
                    variant={filter === s ? "default" : "outline"}
                    onClick={() => setFilter(s)}
                    className={filter === s ? "bg-primary text-primary-foreground" : ""}
                    size="sm"
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Button>
                ))}
              </div>

              {isLoading ? (
                <div className="text-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  No {filter} reviews
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-card rounded-xl p-6 border border-border">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-foreground">
                              {review.profiles?.display_name || "Unknown"}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {review.product_title}
                            </Badge>
                            {review.is_verified_purchase && (
                              <Badge className="bg-primary/10 text-primary text-xs">Verified</Badge>
                            )}
                          </div>

                          <div className="flex gap-0.5 mb-2">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} className={`w-4 h-4 ${s <= review.rating ? "fill-primary text-primary" : "text-border"}`} />
                            ))}
                          </div>

                          {review.title && <h4 className="font-semibold text-sm mb-1">{review.title}</h4>}
                          <p className="text-foreground/80 text-sm">{review.body}</p>

                          {review.photos && review.photos.length > 0 && (
                            <div className="flex gap-2 mt-3">
                              {review.photos.map((url, i) => (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                                  className="w-14 h-14 rounded-lg overflow-hidden border border-border hover:border-primary">
                                  <img src={url} alt="" className="w-full h-full object-cover" />
                                </a>
                              ))}
                            </div>
                          )}

                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(review.created_at).toLocaleString()}
                          </p>
                        </div>

                        {filter === "pending" && (
                          <div className="flex flex-col gap-2 shrink-0">
                            <Button
                              size="sm"
                              onClick={() => updateStatus(review.id, "approved")}
                              disabled={actionLoading === review.id}
                              className="bg-primary text-primary-foreground"
                            >
                              {actionLoading === review.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-1" /> Approve</>}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus(review.id, "rejected")}
                              disabled={actionLoading === review.id}
                              className="border-destructive text-destructive hover:bg-destructive/10"
                            >
                              <X className="w-4 h-4 mr-1" /> Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "import" && (
            <div className="space-y-6">
              <div className="bg-card rounded-xl p-6 border border-border">
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  Import Product Reviews
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Import reviews from AliExpress, DSers, or any supplier. Reviews are auto-approved and marked as verified purchases.
                </p>

                {/* Import mode toggle */}
                <div className="flex gap-2 mb-6">
                  <Button
                    size="sm"
                    variant={importMode === "form" ? "default" : "outline"}
                    onClick={() => setImportMode("form")}
                    className={importMode === "form" ? "bg-primary text-primary-foreground" : ""}
                  >
                    Add Manually
                  </Button>
                  <Button
                    size="sm"
                    variant={importMode === "bulk" ? "default" : "outline"}
                    onClick={() => setImportMode("bulk")}
                    className={importMode === "bulk" ? "bg-primary text-primary-foreground" : ""}
                  >
                    Bulk Paste (JSON)
                  </Button>
                </div>

                {importMode === "bulk" && (
                  <div className="space-y-4">
                    <Textarea
                      value={bulkText}
                      onChange={(e) => setBulkText(e.target.value)}
                      rows={10}
                      placeholder={`Paste JSON array or pipe-separated lines:\n\nJSON example:\n[{"name":"Sarah K.","rating":5,"title":"Amazing!","body":"Love this wig!","handle":"body-wave-wig","product":"Body Wave Wig"}]\n\nPipe-separated:\nSarah K.|5|Amazing!|Love this wig!|body-wave-wig|Body Wave Wig`}
                      className="font-mono text-xs"
                    />
                    <Button onClick={parseBulkText} className="bg-primary text-primary-foreground">
                      Parse Reviews
                    </Button>
                  </div>
                )}

                {importMode === "form" && (
                  <div className="space-y-4">
                    {importReviews.map((review, index) => (
                      <div key={index} className="bg-secondary/30 rounded-lg p-4 border border-border/60 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-foreground">Review #{index + 1}</span>
                          {importReviews.length > 1 && (
                            <Button size="sm" variant="ghost" onClick={() => removeImportRow(index)} className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Reviewer Name</label>
                            <Input
                              value={review.reviewer_name}
                              onChange={(e) => updateImportReview(index, "reviewer_name", e.target.value)}
                              placeholder="e.g. Sarah K."
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Rating (1-5)</label>
                            <div className="flex gap-1 items-center pt-1">
                              {[1, 2, 3, 4, 5].map(s => (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => updateImportReview(index, "rating", s)}
                                  className="focus:outline-none"
                                >
                                  <Star className={`w-6 h-6 transition-colors ${s <= review.rating ? "fill-primary text-primary" : "text-border hover:text-primary/50"}`} />
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Product Handle (URL slug)</label>
                            <Input
                              value={review.product_handle}
                              onChange={(e) => updateImportReview(index, "product_handle", e.target.value)}
                              placeholder="e.g. body-wave-lace-front-wig"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Product Title</label>
                            <Input
                              value={review.product_title}
                              onChange={(e) => updateImportReview(index, "product_title", e.target.value)}
                              placeholder="e.g. Body Wave Lace Front Wig"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1 block">Review Title (optional)</label>
                          <Input
                            value={review.title}
                            onChange={(e) => updateImportReview(index, "title", e.target.value)}
                            placeholder="e.g. Absolutely stunning!"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1 block">Review Body *</label>
                          <Textarea
                            value={review.body}
                            onChange={(e) => updateImportReview(index, "body", e.target.value)}
                            placeholder="The review content..."
                            rows={3}
                          />
                        </div>
                      </div>
                    ))}

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={addImportRow} className="border-primary text-primary hover:bg-primary/10">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Another Review
                      </Button>
                      <Button
                        onClick={handleImport}
                        disabled={isImporting}
                        className="bg-gradient-gold hover:opacity-90 text-espresso font-semibold shadow-glow"
                      >
                        {isImporting ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importing...</>
                        ) : (
                          <><Upload className="w-4 h-4 mr-2" /> Import {importReviews.length} Review{importReviews.length !== 1 ? "s" : ""}</>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AdminReviewsPage;
