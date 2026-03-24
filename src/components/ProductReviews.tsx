import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ReviewForm } from "./ReviewForm";
import { Star, ShieldCheck, Camera } from "lucide-react";
import { motion } from "framer-motion";

interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  photos: string[];
  is_verified_purchase: boolean;
  created_at: string;
  profiles: { display_name: string | null } | null;
}

interface ProductReviewsProps {
  productHandle: string;
  productTitle: string;
}

export const ProductReviews = ({ productHandle, productTitle }: ProductReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const fetchReviews = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("reviews")
      .select("id, rating, title, body, photos, is_verified_purchase, created_at, user_id")
      .eq("product_handle", productHandle)
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      // Fetch profiles for review authors
      const userIds = data.map(r => r.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      const reviewsWithProfiles = data.map(r => ({
        ...r,
        profiles: profileMap.get(r.user_id) || null,
      }));
      
      setReviews(reviewsWithProfiles);
    } else {
      setReviews([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, [productHandle]);

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="mt-12 pt-8 border-t border-border">
      <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8">
        Customer Reviews
      </h2>

      {/* Summary */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-4 mb-8 p-4 bg-secondary/50 rounded-xl">
          <div className="text-center">
            <div className="font-display text-4xl font-bold text-primary">{avgRating.toFixed(1)}</div>
            <div className="flex gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className={`w-4 h-4 ${s <= Math.round(avgRating) ? "fill-primary text-primary" : "text-border"}`} />
              ))}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8">
          <Star className="w-10 h-10 text-primary/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No reviews yet — be the first to share your experience!</p>
        </div>
      ) : (
        <div className="space-y-6 mb-10">
          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl p-6 border border-border/60"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-display text-sm font-bold text-primary">
                      {(review.profiles?.display_name || "Q")[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-foreground text-sm">
                      {review.profiles?.display_name || "Queen"}
                    </span>
                    {review.is_verified_purchase && (
                      <span className="inline-flex items-center gap-1 ml-2 text-xs text-primary font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" /> Verified Purchase
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="flex gap-0.5 mb-2">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} className={`w-4 h-4 ${s <= review.rating ? "fill-primary text-primary" : "text-border"}`} />
                ))}
              </div>

              {review.title && (
                <h4 className="font-semibold text-foreground mb-1">{review.title}</h4>
              )}
              <p className="text-foreground/80 text-sm leading-relaxed">{review.body}</p>

              {review.photos && review.photos.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {review.photos.map((url, pi) => (
                    <button
                      key={pi}
                      onClick={() => setSelectedPhoto(url)}
                      className="w-16 h-16 rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Photo Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-foreground/80 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <img src={selectedPhoto} alt="Review photo" className="max-w-full max-h-[80vh] rounded-xl" />
        </div>
      )}

      {/* Write Review Form */}
      <ReviewForm
        productHandle={productHandle}
        productTitle={productTitle}
        onReviewSubmitted={fetchReviews}
      />
    </div>
  );
};
