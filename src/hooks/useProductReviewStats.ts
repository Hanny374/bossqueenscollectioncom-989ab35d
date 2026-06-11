import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ReviewStats {
  avgRating: number;
  count: number;
}

export interface ReviewStatsMap {
  exact: Record<string, ReviewStats>;
  /** Sorted by review count desc for best-match fallback */
  handles: string[];
}

async function fetchAllReviewStats(): Promise<ReviewStatsMap> {
  const { data } = await supabase
    .from("reviews")
    .select("product_handle, rating")
    .eq("status", "approved");

  if (!data || data.length === 0) return { exact: {}, handles: [] };

  const map: Record<string, { total: number; count: number }> = {};
  for (const r of data) {
    if (!map[r.product_handle]) map[r.product_handle] = { total: 0, count: 0 };
    map[r.product_handle].total += r.rating;
    map[r.product_handle].count += 1;
  }

  const exact: Record<string, ReviewStats> = {};
  for (const [handle, { total, count }] of Object.entries(map)) {
    exact[handle] = { avgRating: total / count, count };
  }
  const handles = Object.keys(exact).sort(
    (a, b) => exact[b].count - exact[a].count,
  );
  return { exact, handles };
}

export function useAllReviewStats() {
  return useQuery({
    queryKey: ["all-review-stats"],
    queryFn: fetchAllReviewStats,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/** Token-overlap similarity: shared meaningful tokens / max tokens. */
function similarity(a: string, b: string): number {
  const tokenize = (s: string) =>
    new Set(
      s
        .toLowerCase()
        .split(/[-_\s]+/)
        .filter((t) => t.length > 2 && !/^\d+$/.test(t)),
    );
  const ta = tokenize(a);
  const tb = tokenize(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  let shared = 0;
  ta.forEach((t) => {
    if (tb.has(t)) shared += 1;
  });
  return shared / Math.max(ta.size, tb.size);
}

/** Look up review stats with exact match, then fuzzy token-overlap fallback. */
export function getReviewStats(
  map: ReviewStatsMap | undefined,
  handle: string,
): ReviewStats | undefined {
  if (!map) return undefined;
  if (map.exact[handle]) return map.exact[handle];

  // Try stripping common dedupe suffixes (-1, -2, etc.)
  const stripped = handle.replace(/-\d+$/, "");
  if (map.exact[stripped]) return map.exact[stripped];

  // Fuzzy: pick handle with highest token overlap (min 0.5 = mostly same wig).
  let best: { handle: string; score: number } | null = null;
  for (const h of map.handles) {
    const score = similarity(h, handle);
    if (score >= 0.5 && (!best || score > best.score)) {
      best = { handle: h, score };
    }
  }
  return best ? map.exact[best.handle] : undefined;
}
