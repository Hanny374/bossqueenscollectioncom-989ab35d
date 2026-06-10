import { useEffect, useState } from "react";
import { Star, BadgeCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface LooxReviewsProps {
  productHandle: string;
}

interface ReviewRow {
  id: string;
  reviewer_name: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  photos: string[] | null;
  review_date: string | null;
  created_at: string;
  is_verified_purchase: boolean | null;
}

/**
 * Displays the top 20 verified 5-star Loox-imported reviews for a product,
 * prioritising those that include photos.
 */
export const LooxReviews = ({ productHandle }: LooxReviewsProps) => {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("reviews")
        .select(
          "id, reviewer_name, rating, title, body, photos, review_date, created_at, is_verified_purchase"
        )
        .eq("product_handle", productHandle)
        .eq("source", "loox")
        .eq("rating", 5)
        .eq("status", "approved")
        .order("review_date", { ascending: false, nullsFirst: false })
        .limit(40);

      if (cancelled) return;
      if (error || !data) {
        setReviews([]);
      } else {
        // Prioritise reviews with photos, cap at 20.
        const withPhotos = data.filter((r) => (r.photos?.length ?? 0) > 0);
        const withoutPhotos = data.filter((r) => (r.photos?.length ?? 0) === 0);
        setReviews([...withPhotos, ...withoutPhotos].slice(0, 20));
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [productHandle]);

  if (loading) return null;
  if (reviews.length === 0) return null;

  return (
    <div className="mt-12 pt-8 border-t border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
          Verified 5-Star Reviews
        </h2>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <BadgeCheck className="w-4 h-4 text-primary" />
          <span>Top {reviews.length}</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((r) => (
          <article
            key={r.id}
            className="rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex items-center gap-1 mb-2" aria-label="5 out of 5 stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-primary text-primary" />
              ))}
            </div>
            {r.title && (
              <h3 className="font-semibold text-foreground line-clamp-1 mb-1">
                {r.title}
              </h3>
            )}
            {r.body && (
              <p className="text-sm text-muted-foreground line-clamp-4 mb-3">
                {r.body}
              </p>
            )}
            {r.photos && r.photos.length > 0 && (
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                {r.photos.slice(0, 3).map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`Customer photo ${i + 1}`}
                    loading="lazy"
                    className="aspect-square w-full rounded-md object-cover"
                  />
                ))}
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium text-foreground/80">
                {r.reviewer_name || "Verified Buyer"}
              </span>
              <span className="flex items-center gap-1">
                <BadgeCheck className="w-3 h-3 text-primary" />
                {r.review_date
                  ? format(new Date(r.review_date), "MMM d, yyyy")
                  : format(new Date(r.created_at), "MMM d, yyyy")}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
