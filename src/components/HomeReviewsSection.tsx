import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface HomeReview {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  product_handle: string;
  product_title: string;
  is_verified_purchase: boolean;
  created_at: string;
  display_name: string | null;
}

export const HomeReviewsSection = () => {
  const [reviews, setReviews] = useState<HomeReview[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from("reviews")
        .select("id, rating, title, body, product_handle, product_title, is_verified_purchase, created_at, user_id")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(6);

      if (data && data.length > 0) {
        const userIds = data.map(r => r.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name")
          .in("id", userIds);
        const profileMap = new Map(profiles?.map(p => [p.id, p.display_name]) || []);

        setReviews(data.map(r => ({
          ...r,
          display_name: profileMap.get(r.user_id) || null,
        })));
      }
    };
    fetchReviews();
  }, []);

  if (reviews.length === 0) {
    return (
      <section className="py-16 bg-secondary/30">
        <div className="container px-4 md:px-8 text-center">
          <span className="text-primary text-sm font-medium tracking-[0.2em] uppercase mb-3 block">
            Reviews
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            What Our Queens Say
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            No reviews yet — be the first to share your experience! Purchase a product and leave a review.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-secondary/30">
      <div className="container px-4 md:px-8">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-primary text-sm font-medium tracking-[0.2em] uppercase mb-3 block">
            Real Reviews
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
            What Our Queens Say
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="bg-card rounded-xl p-6 border border-border/60 hover:border-primary/20 transition-colors"
            >
              <div className="flex gap-0.5 mb-3">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${s <= review.rating ? "fill-primary text-primary" : "text-border"}`}
                  />
                ))}
              </div>

              {review.title && (
                <h4 className="font-semibold text-foreground mb-1 text-sm">{review.title}</h4>
              )}
              <p className="text-foreground/80 text-sm leading-relaxed line-clamp-3 mb-4">
                {review.body}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-display text-xs font-bold text-primary">
                      {(review.display_name || "Q")[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-foreground">
                      {review.display_name || "Queen"}
                    </span>
                    {review.is_verified_purchase && (
                      <span className="flex items-center gap-1 text-[10px] text-primary">
                        <ShieldCheck className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                </div>
                <Link
                  to={`/product/${review.product_handle}`}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  {review.product_title.length > 25
                    ? review.product_title.slice(0, 25) + "..."
                    : review.product_title}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
