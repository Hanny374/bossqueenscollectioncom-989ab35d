import { useEffect, useState } from "react";
import { Star, BadgeCheck, X, ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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
  const [activeReview, setActiveReview] = useState<ReviewRow | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_loox_reviews", {
        p_handle: productHandle,
        p_limit: 40,
      });

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

  const openReview = (r: ReviewRow, idx = 0) => {
    setActiveReview(r);
    setPhotoIndex(idx);
  };
  const activePhotos = activeReview?.photos ?? [];
  const nextPhoto = () => setPhotoIndex((i) => (i + 1) % Math.max(activePhotos.length, 1));
  const prevPhoto = () => setPhotoIndex((i) => (i - 1 + activePhotos.length) % Math.max(activePhotos.length, 1));

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

      <Carousel opts={{ align: "start", loop: true }} className="relative">
        <CarouselContent className="-ml-4">
          {reviews.map((r) => (
            <CarouselItem
              key={r.id}
              className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
            >
              <article
                onClick={() => openReview(r, 0)}
                className="h-full rounded-xl border border-border bg-card p-4 shadow-sm cursor-pointer hover:border-primary/60 hover:shadow-md transition-all"
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
              <div className="relative grid grid-cols-3 gap-1.5 mb-3">
                {r.photos.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); openReview(r, i); }}
                    className="relative aspect-square w-full overflow-hidden rounded-md group"
                  >
                    <img
                      src={src}
                      alt={`Customer photo ${i + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </button>
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
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex -left-4" />
        <CarouselNext className="hidden sm:flex -right-4" />
      </Carousel>

      <Dialog open={!!activeReview} onOpenChange={(o) => !o && setActiveReview(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-card">
          {activeReview && (
            <div className="grid md:grid-cols-2">
              <div className="relative bg-black flex items-center justify-center min-h-[300px] md:min-h-[480px]">
                {activePhotos.length > 0 ? (
                  <>
                    <img
                      src={activePhotos[photoIndex]}
                      alt={`Customer photo ${photoIndex + 1}`}
                      className="w-full h-full object-contain max-h-[70vh]"
                    />
                    {activePhotos.length > 1 && (
                      <>
                        <button
                          onClick={prevPhoto}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow"
                          aria-label="Previous photo"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={nextPhoto}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow"
                          aria-label="Next photo"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 text-white text-xs">
                          {photoIndex + 1} / {activePhotos.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-white/60 text-sm">No photos</div>
                )}
              </div>
              <div className="p-6 flex flex-col gap-3">
                <div className="flex items-center gap-1" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                  {activePhotos.length > 0 && (
                    <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      <ImageIcon className="w-3 h-3" />
                      {activePhotos.length} {activePhotos.length === 1 ? "photo" : "photos"}
                    </span>
                  )}
                </div>
                {activeReview.title && (
                  <h3 className="font-display text-xl font-semibold text-foreground">
                    {activeReview.title}
                  </h3>
                )}
                {activeReview.body && (
                  <p className="text-sm text-muted-foreground whitespace-pre-line max-h-64 overflow-y-auto">
                    {activeReview.body}
                  </p>
                )}
                {activePhotos.length > 1 && (
                  <div className="grid grid-cols-5 gap-1.5 pt-2">
                    {activePhotos.map((src, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setPhotoIndex(i)}
                        className={`aspect-square overflow-hidden rounded-md border-2 transition-all ${
                          i === photoIndex ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img src={src} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
                <div className="mt-auto pt-3 flex items-center justify-between text-xs text-muted-foreground border-t border-border">
                  <span className="font-medium text-foreground/80">
                    {activeReview.reviewer_name || "Verified Buyer"}
                  </span>
                  <span className="flex items-center gap-1">
                    <BadgeCheck className="w-3 h-3 text-primary" />
                    {activeReview.review_date
                      ? format(new Date(activeReview.review_date), "MMM d, yyyy")
                      : format(new Date(activeReview.created_at), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
