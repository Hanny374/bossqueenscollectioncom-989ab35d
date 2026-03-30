import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

const STORAGE_KEY = "boss-queens-recently-viewed";
const MAX_ITEMS = 8;

export interface RecentlyViewedItem {
  handle: string;
  title: string;
  image: string;
  price: string;
  currencyCode: string;
}

export function addToRecentlyViewed(item: RecentlyViewedItem) {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as RecentlyViewedItem[];
    const filtered = stored.filter((i) => i.handle !== item.handle);
    filtered.unshift(item);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, MAX_ITEMS)));
  } catch {}
}

export function getRecentlyViewed(): RecentlyViewedItem[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

interface Props {
  excludeHandle?: string;
}

export const RecentlyViewed = ({ excludeHandle }: Props) => {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    const all = getRecentlyViewed().filter((i) => i.handle !== excludeHandle);
    setItems(all);
  }, [excludeHandle]);

  if (items.length === 0) return null;

  return (
    <section className="py-12">
      <div className="container px-4 md:px-8">
        <motion.div
          className="flex items-center gap-2 mb-6"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Recently Viewed
          </h3>
        </motion.div>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          {items.map((item, i) => (
            <motion.div
              key={item.handle}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex-shrink-0 w-40 md:w-48"
            >
              <Link
                to={`/product/${item.handle}`}
                className="group block space-y-2"
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-secondary/30">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                  {item.title}
                </p>
                <p className="text-sm font-bold text-primary">
                  ${(parseFloat(item.price) + PRICE_MARKUP).toFixed(2)}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
