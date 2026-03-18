import { useQuery } from "@tanstack/react-query";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";

export function useProducts(count: number = 50) {
  return useQuery<ShopifyProduct[]>({
    queryKey: ["shopify-products", count],
    queryFn: () => fetchProducts(count),
    staleTime: 5 * 60 * 1000, // 5 min cache
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
