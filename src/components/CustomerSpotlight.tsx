import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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
      const withPhotos = data.filter(
        (r) => Array.isArray(r.photos) && r.photos.length > 0
      ) as SpotlightReview[];

      // Dedupe across multiple signals: photo URL, reviewer+body, and body text.
      const sorted = [...withPhotos].sort(
        (a, b) => (b.photos?.length ?? 0) - (a.photos?.length ?? 0)
      );
      const normalizePhoto = (u: string) => {
        if (!u) return "";
        try {
          const url = new URL(u);
          // Strip query/hash and trailing slash; use host+pathname (filename) lowercased.
          const path = url.pathname.replace(/\/+$/, "");
          const file = path.split("/").pop() || path;
          return `${url.host}${path}|${file}`.toLowerCase();
        } catch {
          return u.split("?")[0].split("#")[0].trim().toLowerCase();
        }
      };
      const seenPhotos = new Set<string>();
      const seenKeys = new Set<string>();
      const seenProductReviewer = new Set<string>();
      const unique: SpotlightReview[] = [];
      for (const r of sorted) {
        const normalizedPhotos = (r.photos || []).map(normalizePhoto).filter(Boolean);
        const firstPhoto = normalizedPhotos[0] || "";
        const nameKey = (r.reviewer_name || "").trim().toLowerCase();
        const bodyKey = (r.body || "").trim().toLowerCase().slice(0, 120);
        const composite = `${nameKey}|${bodyKey}`;
        const prKey = `${r.product_handle}|${nameKey}`;
        // Skip if ANY photo in this review has already been shown in another review.
        if (normalizedPhotos.some((p) => seenPhotos.has(p))) continue;
        if (composite !== "|" && seenKeys.has(composite)) continue;
        if (bodyKey && seenKeys.has(`|${bodyKey}`)) continue;
        // Avoid showing same reviewer twice for the same product.
        if (nameKey && seenProductReviewer.has(prKey)) continue;
        normalizedPhotos.forEach((p) => seenPhotos.add(p));
        seenKeys.add(composite);
        if (bodyKey) seenKeys.add(`|${bodyKey}`);
        if (nameKey) seenProductReviewer.add(prKey);
        unique.push(r);
      }

      // Only keep reviews whose product still exists, so links aren't broken.
      const handles = Array.from(new Set(unique.map((r) => r.product_handle)));
      const { data: validProducts } = await supabase
        .from("product_embeddings")
        .select("shopify_handle")
        .in("shopify_handle", handles);
      const validSet = new Set((validProducts || []).map((p) => p.shopify_handle));

      const filtered = unique
        .filter((r) => validSet.has(r.product_handle))
        .slice(0, 20);

      if (!cancelled) setItems(filtered);
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

        <Carousel opts={{ align: "start", loop: false }} className="relative">
          <CarouselContent className="-ml-3 md:-ml-5 cursor-grab active:cursor-grabbing">
            {items.map((r) => (
              <CarouselItem
                key={r.id}
                className="pl-3 md:pl-5 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
              >
                <Link
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
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex -left-4 h-10 w-10" />
          <CarouselNext className="hidden sm:flex -right-4 h-10 w-10" />
        </Carousel>
      </div>
    </section>
  );
};