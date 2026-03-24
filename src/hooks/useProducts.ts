import { useQuery } from "@tanstack/react-query";
import { fetchProducts, fetchNewestProducts, ShopifyProduct } from "@/lib/shopify";

export function useProducts(count: number = 500) {
  return useQuery<ShopifyProduct[]>({
    queryKey: ["shopify-products", count],
    queryFn: () => fetchProducts(count),
    staleTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

export function useNewestProducts(count: number = 8, query?: string) {
  return useQuery<ShopifyProduct[]>({
    queryKey: ["shopify-newest-products", count, query],
    queryFn: () => fetchNewestProducts(count, query),
    staleTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
