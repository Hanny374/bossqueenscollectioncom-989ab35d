import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ReviewStats {
  avgRating: number;
  count: number;
}

async function fetchAllReviewStats(): Promise<Record<string, ReviewStats>> {
  const { data } = await supabase
    .from("reviews")
    .select("product_handle, rating")
    .eq("status", "approved");

  if (!data || data.length === 0) return {};

  const map: Record<string, { total: number; count: number }> = {};
  for (const r of data) {
    if (!map[r.product_handle]) map[r.product_handle] = { total: 0, count: 0 };
    map[r.product_handle].total += r.rating;
    map[r.product_handle].count += 1;
  }

  const result: Record<string, ReviewStats> = {};
  for (const [handle, { total, count }] of Object.entries(map)) {
    result[handle] = { avgRating: total / count, count };
  }
  return result;
}

export function useAllReviewStats() {
  return useQuery({
    queryKey: ["all-review-stats"],
    queryFn: fetchAllReviewStats,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
