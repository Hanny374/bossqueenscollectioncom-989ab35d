import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Star, Check, X, Loader2, Shield, Eye } from "lucide-react";

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

const AdminReviewsPage = () => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AdminReviewsPage;
