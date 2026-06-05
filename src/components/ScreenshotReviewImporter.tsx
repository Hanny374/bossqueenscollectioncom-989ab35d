import { useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFullCatalog } from "@/hooks/useProducts";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Upload, Trash2, Image as ImageIcon, Sparkles, Star } from "lucide-react";

interface DraftReview {
  reviewer_name: string;
  rating: number;
  body: string;
  product_handle: string;
  product_title: string;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export function ScreenshotReviewImporter({ onDone }: { onDone: () => void }) {
  const { user } = useAuth();
  const { data: products = [] } = useFullCatalog(true);
  const [handle, setHandle] = useState("");
  const [title, setTitle] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [drafts, setDrafts] = useState<DraftReview[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const candidates = useMemo(
    () => products.map(p => ({ handle: p.node.handle, title: p.node.title })),
    [products]
  );

  const filteredSuggestions = useMemo(() => {
    if (!handle) return [];
    const q = handle.toLowerCase();
    return candidates
      .filter(c => c.handle.includes(q) || c.title.toLowerCase().includes(q))
      .slice(0, 6);
  }, [handle, candidates]);

  const onPickProduct = (h: string, t: string) => {
    setHandle(h);
    setTitle(t);
  };

  const onFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    if (!handle || !title) {
      toast.error("Pick the target product first.");
      return;
    }
    setExtracting(true);
    let total = 0;
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        const dataUrl = await fileToDataUrl(file);
        const { data, error } = await supabase.functions.invoke("extract-reviews-from-image", {
          body: { imageDataUrl: dataUrl },
        });
        if (error) {
          toast.error(`Extract failed: ${error.message}`);
          continue;
        }
        const extracted = (data?.reviews ?? []) as Array<{ reviewer_name: string; rating: number; body: string }>;
        setDrafts(prev => [
          ...prev,
          ...extracted.map(r => ({
            reviewer_name: r.reviewer_name || "Verified Buyer",
            rating: Math.min(5, Math.max(1, Number(r.rating) || 5)),
            body: r.body || "",
            product_handle: handle,
            product_title: title,
          })),
        ]);
        total += extracted.length;
      }
      toast.success(`Extracted ${total} reviews. Review and import below.`);
    } finally {
      setExtracting(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const updateDraft = (i: number, patch: Partial<DraftReview>) => {
    setDrafts(prev => prev.map((d, idx) => idx === i ? { ...d, ...patch } : d));
  };

  const removeDraft = (i: number) => setDrafts(prev => prev.filter((_, idx) => idx !== i));

  const handleImport = async () => {
    if (!user) return;
    const valid = drafts.filter(d => d.body.trim() && d.product_handle && d.product_title);
    if (!valid.length) {
      toast.error("No valid reviews to import.");
      return;
    }
    setSubmitting(true);
    const inserts = valid.map(d => ({
      user_id: user.id,
      rating: d.rating,
      title: null,
      body: d.body,
      product_handle: d.product_handle,
      product_title: d.product_title,
      is_verified_purchase: true,
      status: "approved",
      photos: [],
    }));
    const { error } = await supabase.from("reviews").insert(inserts);
    if (error) {
      toast.error("Import failed: " + error.message);
    } else {
      toast.success(`${valid.length} reviews imported!`);
      setDrafts([]);
      onDone();
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl p-6 border border-border space-y-4">
        <div>
          <h3 className="font-display text-xl font-bold text-foreground mb-1">Screenshot → AI Extract</h3>
          <p className="text-sm text-muted-foreground">
            Upload DSers/AliExpress review screenshots. Gemini vision will read reviewer names, star ratings, and review text. Edit before importing.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Target product</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="product handle (e.g. body-wave-lace-front-wig)"
            />
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="product title"
            />
          </div>
          {filteredSuggestions.length > 0 && handle && !candidates.find(c => c.handle === handle) && (
            <div className="flex flex-wrap gap-1.5">
              {filteredSuggestions.map(s => (
                <button
                  key={s.handle}
                  type="button"
                  onClick={() => onPickProduct(s.handle, s.title)}
                  className="text-xs px-2 py-1 rounded-full bg-secondary hover:bg-primary/15 border border-border"
                >
                  {s.title}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => onFiles(e.target.files)}
          />
          <Button
            onClick={() => inputRef.current?.click()}
            disabled={extracting || !handle || !title}
            className="bg-gradient-gold text-espresso font-semibold"
          >
            {extracting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Extracting with AI…</>
            ) : (
              <><ImageIcon className="w-4 h-4 mr-2" /> Upload screenshot(s)</>
            )}
          </Button>
        </div>
      </div>

      {drafts.length > 0 && (
        <div className="bg-card rounded-xl p-6 border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> {drafts.length} extracted review{drafts.length !== 1 ? "s" : ""}
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setDrafts([])}>Clear</Button>
          </div>

          <div className="space-y-3">
            {drafts.map((d, i) => (
              <div key={i} className="bg-secondary/30 rounded-lg p-4 border border-border/60 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      value={d.reviewer_name}
                      onChange={(e) => updateDraft(i, { reviewer_name: e.target.value })}
                      placeholder="Reviewer name"
                    />
                    <div className="flex gap-1 items-center">
                      {[1, 2, 3, 4, 5].map(s => (
                        <button key={s} type="button" onClick={() => updateDraft(i, { rating: s })}>
                          <Star className={`w-5 h-5 ${s <= d.rating ? "fill-primary text-primary" : "text-border"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => removeDraft(i)} className="text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <Textarea
                  value={d.body}
                  onChange={(e) => updateDraft(i, { body: e.target.value })}
                  rows={3}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input
                    value={d.product_handle}
                    onChange={(e) => updateDraft(i, { product_handle: e.target.value })}
                    placeholder="product handle"
                    className="text-xs"
                  />
                  <Input
                    value={d.product_title}
                    onChange={(e) => updateDraft(i, { product_title: e.target.value })}
                    placeholder="product title"
                    className="text-xs"
                  />
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={handleImport}
            disabled={submitting}
            className="bg-gradient-gold text-espresso font-semibold w-full sm:w-auto"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importing…</>
            ) : (
              <><Upload className="w-4 h-4 mr-2" /> Import {drafts.length} review{drafts.length !== 1 ? "s" : ""}</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}