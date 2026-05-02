import { useQuery } from "@tanstack/react-query";
import { fetchProducts, fetchNewestProducts, ShopifyProduct } from "@/lib/shopify";

// Fetch initial batch (fast load for curated sections)
export function useProducts(count: number = 50, enabled: boolean = true) {
  return useQuery<ShopifyProduct[]>({
    queryKey: ["shopify-products", count],
    queryFn: () => fetchProducts(count),
    staleTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    enabled,
  });
}

// Fetch full catalog (deferred, triggered when catalog section is visible)
export function useFullCatalog(enabled: boolean = false) {
  return useQuery<ShopifyProduct[]>({
    queryKey: ["shopify-products", 500],
    queryFn: () => fetchProducts(500),
    staleTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    enabled,
  });
}

export function useNewestProducts(count: number = 8, query?: string, enabled: boolean = true) {
  return useQuery<ShopifyProduct[]>({
    queryKey: ["shopify-newest-products", count, query],
    queryFn: () => fetchNewestProducts(count, query),
    staleTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    enabled,
  });
}
