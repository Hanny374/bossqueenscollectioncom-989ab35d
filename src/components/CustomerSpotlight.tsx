import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SpotlightReview {
  id: string;
  reviewer_name: string;
  rating: number;
  body: string | null;
  photos: string[];
  product_handle: string;
}

export const CustomerSpotlight = () => {
  const [items, setItems] = useState<SpotlightReview[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("reviews")
        .select("id, reviewer_name, rating, body, photos, product_handle")
        .eq("status", "approved")
        .not("photos", "is", null)
        .order("review_date", { ascending: false, nullsFirst: false })
        .limit(60);

      if (cancelled || !data) return;

      // Keep only reviews that actually have at least one photo URL.
      const withPhotos = data
        .filter((r) => Array.isArray(r.photos) && r.photos.length > 0)
        .slice(0, 12) as SpotlightReview[];

      setItems(withPhotos);
    })();
    return () => { cancelled = true; };
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="py-14 md:py-20 bg-gradient-to-b from-background to-secondary/30">
      <div className="container px-4 md:px-8">
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-xs uppercase tracking-[0.25em] text-primary mb-4">
            <Camera className="w-3.5 h-3.5" />
            Customer Spotlight
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
            Real Queens. Real Hair.
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Verified reviews and photos from customers wearing Boss Queens Collection.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {items.map((r) => (
            <Link
              key={r.id}
              to={`/product/${r.product_handle}`}
              className="group relative block rounded-2xl overflow-hidden shadow-soft hover-lift bg-card"
            >
              <div className="aspect-[3/4] overflow-hidden bg-secondary/30">
                <img
                  src={r.photos[0]}
                  alt={`Customer photo from ${r.reviewer_name}`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-3 md:p-4 bg-gradient-to-t from-foreground/85 via-foreground/40 to-transparent">
                <div className="flex items-center gap-0.5 mb-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= r.rating ? "fill-primary text-primary" : "text-background/40"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-background text-xs md:text-sm font-semibold truncate">
                  {r.reviewer_name}
                </p>
                {r.body && (
                  <p className="text-background/80 text-[11px] md:text-xs line-clamp-2 mt-0.5">
                    {r.body}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};