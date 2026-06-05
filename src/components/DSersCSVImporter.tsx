import { useMemo, useState } from "react";
import Papa from "papaparse";
import { supabase } from "@/integrations/supabase/client";
import { useFullCatalog } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Upload, Trash2, Image as ImageIcon } from "lucide-react";

interface ParsedRow {
  reviewer_name: string;
  rating: number;
  title: string;
  body: string;
  product_handle: string; // editable, auto-matched
  product_title: string;
  source_key: string; // raw product id/handle/title from CSV (for grouping)
  photoUrls: string[];
}

const lower = (s: string) => s.toLowerCase().trim();

function pick(row: Record<string, any>, keys: string[]): string {
  for (const k of Object.keys(row)) {
    if (keys.includes(lower(k))) {
      const v = row[k];
      if (v !== undefined && v !== null && String(v).trim() !== "") return String(v).trim();
    }
  }
  return "";
}

function pickAll(row: Record<string, any>, prefixes: string[]): string[] {
  const out: string[] = [];
  for (const k of Object.keys(row)) {
    const lk = lower(k);
    if (prefixes.some(p => lk.startsWith(p))) {
      const v = row[k];
      if (v && String(v).trim()) {
        // may be comma/space separated multiple urls
        for (const part of String(v).split(/[\s,]+/)) {
          if (/^https?:\/\//i.test(part) || part.startsWith("//")) out.push(part);
        }
      }
    }
  }
  return out;
}

function fuzzyMatch(target: string, candidates: { handle: string; title: string }[]): string {
  const t = lower(target);
  if (!t) return "";
  // exact handle
  const exact = candidates.find(c => c.handle === t || lower(c.title) === t);
  if (exact) return exact.handle;
  // contains
  const tokens = t.split(/\W+/).filter(w => w.length > 2);
  let best = { handle: "", score: 0 };
  for (const c of candidates) {
    const ht = lower(c.title) + " " + c.handle;
    let score = 0;
    for (const tok of tokens) if (ht.includes(tok)) score++;
    if (score > best.score) best = { handle: c.handle, score };
  }
  return best.score >= 2 ? best.handle : "";
}

export function DSersCSVImporter({ onDone }: { onDone: () => void }) {
  const { data: products = [], isLoading: loadingProducts } = useFullCatalog(true);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const candidates = useMemo(
    () => products.map(p => ({ handle: p.node.handle, title: p.node.title })),
    [products]
  );

  const handleFile = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const data = res.data as Record<string, any>[];
        const parsed: ParsedRow[] = data.map((r) => {
          const handleRaw = pick(r, ["product_handle", "handle", "shopify_handle"]);
          const productKey = handleRaw || pick(r, ["product_id", "productid", "product id", "sku"]) || pick(r, ["product_title", "product_name", "product name", "product"]);
          const productTitle = pick(r, ["product_title", "product_name", "product name", "product"]) || productKey;
          const matched = handleRaw && candidates.some(c => c.handle === handleRaw)
            ? handleRaw
            : fuzzyMatch(productTitle, candidates);
          return {
            reviewer_name: pick(r, ["reviewer_name", "name", "author", "reviewer", "customer"]) || "Customer",
            rating: Math.min(5, Math.max(1, Number(pick(r, ["rating", "star", "stars", "score"])) || 5)),
            title: pick(r, ["title", "review_title", "headline"]),
            body: pick(r, ["body", "content", "review", "text", "comment", "message"]),
            product_handle: matched,
            product_title: candidates.find(c => c.handle === matched)?.title || productTitle,
            source_key: productKey,
            photoUrls: pickAll(r, ["picture", "image", "photo", "img"]),
          };
        }).filter(r => r.body);
        setRows(parsed);
        const unmatched = parsed.filter(r => !r.product_handle).length;
        toast.success(`Parsed ${parsed.length} reviews. ${unmatched ? `${unmatched} need a product match.` : "All matched!"}`);
      },
      error: (err) => toast.error("CSV parse failed: " + err.message),
    });
  };

  const updateRow = (i: number, patch: Partial<ParsedRow>) => {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  };

  const removeRow = (i: number) => setRows(prev => prev.filter((_, idx) => idx !== i));

  // Bulk-apply handle to all rows with the same source_key
  const applyHandleToGroup = (sourceKey: string, handle: string) => {
    const title = candidates.find(c => c.handle === handle)?.title || "";
    setRows(prev => prev.map(r => r.source_key === sourceKey ? { ...r, product_handle: handle, product_title: title || r.product_title } : r));
  };

  const submit = async () => {
    const valid = rows.filter(r => r.product_handle && r.body);
    if (valid.length === 0) {
      toast.error("No reviews ready. Match each row to a product first.");
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Not signed in"); return; }

    setSubmitting(true);
    setProgress({ done: 0, total: valid.length });

    let inserted = 0;
    for (let i = 0; i < valid.length; i++) {
      const r = valid[i];
      let hosted: string[] = [];
      if (r.photoUrls.length > 0) {
        try {
          const { data } = await supabase.functions.invoke("import-review-photos", {
            body: { urls: r.photoUrls },
          });
          if (data?.hosted) hosted = data.hosted;
        } catch (_) { /* keep going without photos */ }
      }
      const matchedTitle = candidates.find(c => c.handle === r.product_handle)?.title || r.product_title;
      const { error } = await supabase.from("reviews").insert({
        user_id: user.id,
        rating: r.rating,
        title: r.title || null,
        body: r.body,
        product_handle: r.product_handle,
        product_title: matchedTitle,
        is_verified_purchase: true,
        status: "approved",
        photos: hosted,
      });
      if (!error) inserted++;
      setProgress({ done: i + 1, total: valid.length });
    }

    setSubmitting(false);
    setProgress(null);
    toast.success(`Imported ${inserted}/${valid.length} reviews.`);
    setRows([]);
    onDone();
  };

  // Group by source for easy "apply to all" UX
  const groups = useMemo(() => {
    const m = new Map<string, ParsedRow[]>();
    rows.forEach(r => {
      const k = r.source_key || "(unknown)";
      m.set(k, [...(m.get(k) || []), r]);
    });
    return Array.from(m.entries());
  }, [rows]);

  return (
    <div className="bg-card rounded-xl p-6 border border-border space-y-5">
      <div>
        <h3 className="font-display text-xl font-bold text-foreground mb-2">Import DSers CSV</h3>
        <p className="text-sm text-muted-foreground">
          Upload the CSV exported from DSers → Marketing → Product Reviews. We'll auto-match each review to a product using the CSV's <code className="text-xs bg-secondary px-1 rounded">product_handle</code> / <code className="text-xs bg-secondary px-1 rounded">product_id</code> / product name column, then download any photos to your own storage.
        </p>
      </div>

      <Input
        type="file"
        accept=".csv,text/csv"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        className="cursor-pointer"
        disabled={loadingProducts}
      />
      {loadingProducts && (
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          <Loader2 className="w-3 h-3 animate-spin" /> Loading product catalog for matching…
        </p>
      )}

      {rows.length > 0 && (
        <>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {rows.length} parsed · {rows.filter(r => r.product_handle).length} matched · {rows.filter(r => !r.product_handle).length} need a handle
            </span>
            <Button size="sm" variant="ghost" onClick={() => setRows([])} className="text-destructive">Clear</Button>
          </div>

          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
            {groups.map(([key, groupRows]) => {
              const groupHandle = groupRows[0].product_handle;
              return (
                <div key={key} className="border border-border/60 rounded-lg p-3 bg-secondary/20">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">CSV product key</p>
                      <p className="font-medium text-sm text-foreground truncate">{key}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="text-xs text-muted-foreground">Match to Shopify handle ({groupRows.length} review{groupRows.length > 1 ? "s" : ""})</label>
                      <Input
                        list="shopify-handles"
                        value={groupHandle}
                        onChange={(e) => applyHandleToGroup(key, e.target.value.trim())}
                        placeholder="product-handle"
                        className={groupHandle ? "" : "border-destructive"}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    {groupRows.map((r) => {
                      const i = rows.indexOf(r);
                      return (
                        <div key={i} className="bg-card rounded p-2 border border-border/40 flex gap-3 items-start text-sm">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium truncate">{r.reviewer_name}</span>
                              <span className="text-xs text-primary">{"★".repeat(r.rating)}</span>
                              {r.photoUrls.length > 0 && (
                                <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                                  <ImageIcon className="w-3 h-3" /> {r.photoUrls.length}
                                </span>
                              )}
                            </div>
                            {r.title && <p className="text-xs font-semibold">{r.title}</p>}
                            <p className="text-xs text-foreground/80 line-clamp-2">{r.body}</p>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => removeRow(i)} className="text-destructive shrink-0">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <datalist id="shopify-handles">
            {candidates.map(c => <option key={c.handle} value={c.handle}>{c.title}</option>)}
          </datalist>

          <Button
            onClick={submit}
            disabled={submitting || rows.every(r => !r.product_handle)}
            className="bg-gradient-gold hover:opacity-90 text-espresso font-semibold shadow-glow w-full"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importing {progress?.done}/{progress?.total}…</>
            ) : (
              <><Upload className="w-4 h-4 mr-2" /> Import {rows.filter(r => r.product_handle).length} matched reviews</>
            )}
          </Button>
        </>
      )}
    </div>
  );
}