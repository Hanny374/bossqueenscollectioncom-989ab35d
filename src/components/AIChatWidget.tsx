import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Crown, Loader2, ShoppingBag, Sparkles, ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { fetchProductByHandle, PRICE_MARKUP } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/boss-queens-chat`;

async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (err: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    onError(data.error || "Something went wrong. Try again!");
    return;
  }

  if (!resp.body) {
    onError("No response received.");
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") { streamDone = true; break; }
      try {
        const parsed = JSON.parse(json);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch {
        buffer = line + "\n" + buffer;
        break;
      }
    }
  }
  onDone();
}

const QUICK_PROMPTS = [
  { label: "🔥 Best sellers", prompt: "Show me your best selling wigs" },
  { label: "💇‍♀️ Help me choose", prompt: "Help me find the perfect wig for me" },
  { label: "📦 Shipping info", prompt: "How does shipping work?" },
  { label: "🎨 Custom order", prompt: "I want to order a custom wig" },
];

/** Inline Add to Cart button for chatbot product links */
const ChatAddToCartButton = ({ handle }: { handle: string }) => {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const addItem = useCartStore(s => s.addItem);

  const handleAdd = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (state !== "idle") return;
    setState("loading");
    try {
      const product = await fetchProductByHandle(handle);
      if (!product) { toast.error("Product not found"); setState("idle"); return; }
      const firstVariant = product.variants.edges[0]?.node;
      if (!firstVariant?.availableForSale) { toast.error("Currently sold out"); setState("idle"); return; }
      await addItem({
        product: { node: product },
        variantId: firstVariant.id,
        variantTitle: firstVariant.title,
        price: { amount: (parseFloat(firstVariant.price.amount) + PRICE_MARKUP).toFixed(2), currencyCode: firstVariant.price.currencyCode },
        quantity: 1,
        selectedOptions: firstVariant.selectedOptions || [],
      });
      toast.success("Added to cart!", { description: product.title });
      setState("done");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      toast.error("Failed to add to cart");
      setState("idle");
    }
  }, [handle, state, addItem]);

  return (
    <button
      onClick={handleAdd}
      disabled={state === "loading"}
      className="inline-flex items-center gap-1 ml-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-60"
    >
      {state === "loading" ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : state === "done" ? (
        <><Check className="w-3 h-3" /> Added</>
      ) : (
        <><ShoppingCart className="w-3 h-3" /> Add to Cart</>
      )}
    </button>
  );
};

/** Sticky cart bar shown inside the chatbot when items are in cart */
const ChatCartBar = ({ onCheckout }: { onCheckout: () => void }) => {
  const items = useCartStore(s => s.items);
  const getCheckoutUrl = useCartStore(s => s.getCheckoutUrl);
  const setCartOpen = useCartStore(s => s.setCartOpen);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + parseFloat(i.price.amount) * i.quantity, 0);

  if (totalItems === 0) return null;

  return (
    <div className="shrink-0 border-t border-primary/20 bg-primary/5 px-3 py-2 flex items-center gap-2">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground">
          🛒 {totalItems} item{totalItems !== 1 ? "s" : ""} · ${totalPrice.toFixed(2)}
        </p>
      </div>
      <button
        onClick={() => { onCheckout(); setCartOpen(true); }}
        className="text-xs font-semibold px-3 py-1.5 rounded-full border border-primary/30 bg-background text-primary hover:bg-primary/10 transition-colors"
      >
        View Cart
      </button>
      <button
        onClick={() => {
          const url = getCheckoutUrl();
          if (url) { window.open(url, "_blank"); onCheckout(); }
          else { onCheckout(); setCartOpen(true); }
        }}
        className="text-xs font-semibold px-3 py-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Checkout
      </button>
    </div>
  );
};

export const AIChatWidget = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Auto-open prompt on mobile after 8s if user hasn't interacted
  useEffect(() => {
    if (hasInteracted) return;
    const timer = setTimeout(() => {
      if (!hasInteracted) setHasInteracted(true);
    }, 12000);
    return () => clearTimeout(timer);
  }, [hasInteracted]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Msg = { role: "user", content: text.trim() };
    setInput("");
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    let assistantSoFar = "";
    const allMessages = [...messages, userMsg];

    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: allMessages,
        onDelta: upsert,
        onDone: () => setIsLoading(false),
        onError: (err) => {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: err },
          ]);
          setIsLoading(false);
        },
      });
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Oops! Something went wrong. Please try again or reach us on WhatsApp! 💕",
        },
      ]);
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Toggle Button — conversion-optimized */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: 20 }}
            className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-2 md:bottom-5"
          >
            {/* Attention-grabbing CTA bubble */}
            <motion.button
              onClick={() => { setIsOpen(true); setHasInteracted(true); }}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 2, duration: 0.4 }}
              className="bg-card border border-border shadow-elevated rounded-2xl rounded-br-sm px-4 py-3 max-w-[220px] text-left group hover:border-primary/40 transition-colors"
            >
              <p className="text-xs font-medium text-foreground leading-snug">
                👋 Need help finding the perfect wig?
              </p>
              <p className="text-[11px] text-primary font-semibold mt-1">
                Chat with Queen B →
              </p>
            </motion.button>

            {/* FAB button */}
            <button
              onClick={() => { setIsOpen(true); setHasInteracted(true); }}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-amber-600 text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform duration-200"
              aria-label="Open chat with Queen B"
            >
              <Crown className="w-7 h-7" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Panel — mobile-first, full-screen on small devices */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed z-50 bg-background border border-border shadow-elevated flex flex-col overflow-hidden
              bottom-0 right-0 w-full h-[100dvh]
              sm:bottom-4 sm:right-4 sm:w-[380px] sm:h-[560px] sm:max-h-[calc(100vh-2rem)] sm:rounded-2xl"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-amber-600 px-4 py-3 flex items-center gap-3 shrink-0">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-sm font-bold text-white">Queen B</h3>
                <p className="text-[11px] text-white/70">Your hair shopping assistant • Online</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Close chat"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 overscroll-contain">
              {messages.length === 0 && (
                <div className="space-y-4 py-4">
                  {/* Welcome */}
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <Crown className="w-8 h-8 text-primary" />
                    </div>
                    <p className="font-display font-bold text-lg text-foreground">
                      Hey Queen! 👑
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-[280px] mx-auto">
                      I'll help you find the perfect hair. Tell me what you're looking for — or tap below to get started!
                    </p>
                  </div>

                  {/* Quick action buttons — conversion focused */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    {QUICK_PROMPTS.map((q) => (
                      <button
                        key={q.label}
                        onClick={() => sendMessage(q.prompt)}
                        className="text-left text-xs px-3 py-2.5 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-colors group"
                      >
                        <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {q.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Trust signal */}
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <ShoppingBag className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground">
                      I can show you products, prices & help you order
                    </span>
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  {msg.role === "assistant" && (
                    <span className="text-[11px] font-display font-semibold text-primary ml-1 mb-0.5">Queen B 👑</span>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-secondary text-secondary-foreground rounded-bl-md"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none [&_p]:m-0 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0 [&_a]:text-primary [&_a]:underline [&_a]:font-medium">
                        <ReactMarkdown
                          components={{
                            a: ({ href, children }) => {
                              // Check if this is an internal product link
                              const internalMatch = href?.match(/bossqueenscollection[^/]*\.(?:lovable\.app|com)\/product\/([^\s?#]+)/);
                              const internalPath = internalMatch ? `/product/${internalMatch[1]}` : null;
                              const productHandle = internalMatch?.[1];
                              
                              if (internalPath && productHandle) {
                                return (
                                  <span className="inline-flex flex-wrap items-center gap-1">
                                    <a
                                      href={internalPath}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setIsOpen(false);
                                        navigate(internalPath);
                                      }}
                                      className="text-primary underline font-medium hover:text-primary/80 cursor-pointer"
                                    >
                                      {children}
                                    </a>
                                    <ChatAddToCartButton handle={productHandle} />
                                  </span>
                                );
                              }
                              return (
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary underline font-medium hover:text-primary/80"
                                >
                                  {children}
                                </a>
                              );
                            },
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}

              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex items-start gap-2">
                  <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* View Cart bar */}
            <ChatCartBar onCheckout={() => setIsOpen(false)} />

            {/* Input — larger touch targets for mobile */}
            <div className="border-t border-border p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shrink-0 bg-background">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage(input);
                }}
                className="flex gap-2"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about hair..."
                  className="flex-1 min-w-0 bg-secondary rounded-full px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
                  disabled={isLoading}
                />
                <Button
                  id="chat-send-btn"
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isLoading}
                  className="rounded-full bg-primary hover:bg-primary/90 w-11 h-11 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
