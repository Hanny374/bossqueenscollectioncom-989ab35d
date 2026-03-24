import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Star, Upload, X, Loader2, LogIn } from "lucide-react";
import { Link } from "react-router-dom";

interface ReviewFormProps {
  productHandle: string;
  productTitle: string;
  onReviewSubmitted: () => void;
}

export const ReviewForm = ({ productHandle, productTitle, onReviewSubmitted }: ReviewFormProps) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    return (
      <div className="bg-secondary/50 rounded-2xl p-8 text-center">
        <LogIn className="w-8 h-8 text-primary mx-auto mb-3" />
        <p className="text-foreground font-semibold mb-2">Sign in to leave a review</p>
        <p className="text-muted-foreground text-sm mb-4">Share your experience with other queens!</p>
        <Link to="/auth">
          <Button className="bg-gradient-gold hover:opacity-90 text-espresso shadow-glow">
            Sign In / Create Account
          </Button>
        </Link>
      </div>
    );
  }

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 5) {
      toast.error("Maximum 5 photos allowed");
      return;
    }
    const validFiles = files.filter(f => f.size <= 5 * 1024 * 1024);
    if (validFiles.length !== files.length) {
      toast.error("Some files exceed 5MB limit");
    }
    setPhotos(prev => [...prev, ...validFiles]);
    validFiles.forEach(f => {
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreviews(prev => [...prev, e.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }
    if (body.trim().length < 10) {
      toast.error("Review must be at least 10 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload photos
      const photoUrls: string[] = [];
      for (const photo of photos) {
        const ext = photo.name.split(".").pop();
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("review-photos")
          .upload(path, photo);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("review-photos").getPublicUrl(path);
        photoUrls.push(urlData.publicUrl);
      }

      const { error } = await supabase.from("reviews").insert({
        user_id: user.id,
        product_handle: productHandle,
        product_title: productTitle,
        rating,
        title: title.trim() || null,
        body: body.trim(),
        photos: photoUrls,
      });

      if (error) throw error;

      toast.success("Review submitted! It will appear after admin approval. 👑");
      setRating(0);
      setTitle("");
      setBody("");
      setPhotos([]);
      setPhotoPreviews([]);
      onReviewSubmitted();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 md:p-8 border border-border space-y-5">
      <h3 className="font-display text-xl font-bold text-foreground">Write Your Review</h3>

      {/* Star Rating */}
      <div className="space-y-2">
        <Label>Rating *</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoverRating || rating)
                    ? "fill-primary text-primary"
                    : "text-border"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="reviewTitle">Review Title (optional)</Label>
        <Input
          id="reviewTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sum up your experience"
          maxLength={100}
        />
      </div>

      {/* Body */}
      <div className="space-y-2">
        <Label htmlFor="reviewBody">Your Review *</Label>
        <Textarea
          id="reviewBody"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Tell other queens about your experience with this product..."
          rows={4}
          maxLength={2000}
          required
        />
        <p className="text-xs text-muted-foreground">{body.length}/2000</p>
      </div>

      {/* Photos */}
      <div className="space-y-2">
        <Label>Photos (optional, max 5)</Label>
        <div className="flex flex-wrap gap-3">
          {photoPreviews.map((src, i) => (
            <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {photos.length < 5 && (
            <label className="w-20 h-20 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center cursor-pointer transition-colors">
              <Upload className="w-5 h-5 text-muted-foreground" />
              <input type="file" accept="image/*" onChange={handlePhotoAdd} className="hidden" multiple />
            </label>
          )}
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-gold hover:opacity-90 text-espresso shadow-glow font-semibold h-12"
      >
        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Review"}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Your review will be published after admin approval
      </p>
    </form>
  );
};
