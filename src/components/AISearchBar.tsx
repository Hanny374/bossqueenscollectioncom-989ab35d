import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, Loader2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface SearchResult {
  handle: string;
  title: string;
  description: string;
  productType: string;
  price: number;
  compareAtPrice: number | null;
  availableForSale: boolean;
  similarity: number;
}

const SEARCH_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/search-products`;

const SUGGESTIONS = [
  "Something wavy for a beach look",
  "Short bob wig",
  "Blonde colored wig",
  "Brazilian bundles",
  "Beginner-friendly wig",
  "Deep wave bundles",
];

export const AISearchBar = ({ onClose }: { onClose?: () => void }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowSuggestions(false);
        onClose?.();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setShowSuggestions(false);
        onClose?.();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const resp = await fetch(SEARCH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ query: q.trim(), match_count: 6, match_threshold: 0.3 }),
      });

      if (resp.ok) {
        const data = await resp.json();
        setResults(data.results || []);
        setIsOpen(true);
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInput = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 400);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleResultClick = () => {
    setIsOpen(false);
    setShowSuggestions(false);
    setQuery("");
    setResults([]);
    onClose?.();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    search(suggestion);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      {/* Input */}
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
            else if (!query) setShowSuggestions(true);
          }}
          placeholder="Search by style, texture, color..."
          className="w-full pl-9 pr-9 py-2.5 text-sm bg-secondary rounded-full outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground transition-all"
          autoComplete="off"
        />
        {isLoading ? (
          <Loader2 className="absolute right-3 w-4 h-4 text-muted-foreground animate-spin" />
        ) : query ? (
          <button onClick={clearSearch} className="absolute right-3">
            <X className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
          </button>
        ) : null}
      </div>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && !isOpen && !query && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-elevated overflow-hidden z-50"
          >
            <div className="px-3 py-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Try searching for
            </div>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSuggestionClick(s)}
                className="flex items-center gap-2 w-full text-left px-3 py-2.5 hover:bg-secondary/80 transition-colors text-sm text-foreground"
              >
                <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                {s}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-elevated overflow-hidden z-50"
          >
            {results.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                No matching products found. Try a different description!
              </div>
            ) : (
              <div className="max-h-[360px] overflow-y-auto">
                <div className="px-3 py-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  AI-matched results
                </div>
                {results.map((product) => (
                  <Link
                    key={product.handle}
                    to={`/product/${product.handle}`}
                    onClick={handleResultClick}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-secondary/80 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground truncate">
                          {product.title}
                        </span>
                        {!product.availableForSale && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-medium shrink-0">
                            Sold out
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {product.productType}
                        </span>
                        <span className="text-xs font-semibold text-primary">
                          ${product.price.toFixed(2)}
                        </span>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <span className="text-[11px] line-through text-muted-foreground/60">
                            ${product.compareAtPrice.toFixed(2)}
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground/50 ml-auto">
                          {Math.round(product.similarity * 100)}% match
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
