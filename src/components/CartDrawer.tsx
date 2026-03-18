import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart, Minus, Plus, Trash2, Loader2, Truck, Shield, CreditCard, Gift, ArrowLeft, Clock, Flame } from "lucide-react";
import { VisaLogo, MastercardLogo, AmexLogo, DiscoverLogo, PayPalLogo, ApplePayLogo, GooglePayLogo } from "./PaymentLogos";
import { useCartStore } from "@/stores/cartStore";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";

// Cart reservation countdown (15 minutes)
const CART_RESERVE_MINUTES = 15;

const CartTimer = () => {
  const [seconds, setSeconds] = useState(CART_RESERVE_MINUTES * 60);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (seconds <= 0) return null;

  return (
    <motion.div
      className="flex items-center gap-2 px-3 py-2 bg-destructive/5 border border-destructive/20 rounded-lg"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Clock className="w-4 h-4 text-destructive shrink-0" />
      <span className="text-sm text-foreground">
        Cart reserved for{" "}
        <span className="font-bold text-destructive font-mono">
          {mins}:{secs.toString().padStart(2, "0")}
        </span>
      </span>
    </motion.div>
  );
};

const FREE_SHIPPING_THRESHOLD = 100;

export const CartDrawer = () => {
  const { items, isLoading, isSyncing, isCartOpen, updateQuantity, removeItem, getCheckoutUrl, syncCart, setCartOpen } = useCartStore();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price.amount) * item.quantity), 0);
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 9.99;
  const total = subtotal + shippingCost;
  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

  useEffect(() => { 
    if (isCartOpen) syncCart(); 
  }, [isCartOpen, syncCart]);

  const handleCheckout = () => {
    const checkoutUrl = getCheckoutUrl();
    if (checkoutUrl) {
      window.open(checkoutUrl, '_blank');
      setCartOpen(false);
    }
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setCartOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative border-primary/20 hover:bg-primary/5 hover:border-primary/40">
          <ShoppingCart className="h-5 w-5" />
          <AnimatePresence>
            {totalItems > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", bounce: 0.5, duration: 0.4 }}
              >
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-gradient-gold text-primary-foreground border-0">
                  {totalItems}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full bg-background">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle className="font-display text-2xl">Your Cart</SheetTitle>
          <SheetDescription>
            {totalItems === 0 ? "Your cart is empty" : `${totalItems} item${totalItems !== 1 ? 's' : ''} in your cart`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col flex-1 pt-4 min-h-0">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <ShoppingCart className="h-16 w-16 text-muted-foreground/30 mx-auto" />
                <div>
                  <p className="text-muted-foreground font-display text-lg">Your cart is empty</p>
                  <p className="text-sm text-muted-foreground mt-1">Add some beautiful hair to get started</p>
                </div>
                <Button variant="outline" onClick={() => setCartOpen(false)} asChild>
                  <Link to="/#products">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Browse Products
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Free Shipping Progress */}
              {amountToFreeShipping > 0 && (
                <div className="mb-4 p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <Truck className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">
                      Add <span className="font-semibold text-foreground">${amountToFreeShipping.toFixed(2)}</span> for free shipping
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-gold" 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                </div>
              )}

              {amountToFreeShipping <= 0 && (
                <motion.div 
                  className="mb-4 p-3 bg-primary/10 rounded-lg flex items-center gap-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Gift className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">You've unlocked free shipping! 🎉</span>
                </motion.div>
              )}

              {/* Cart reservation timer */}
              <div className="mb-4 space-y-2">
                <CartTimer />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Flame className="w-3.5 h-3.5 text-destructive" />
                  <span>High demand — items in your cart may sell out</span>
                </div>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto pr-2 min-h-0">
                <AnimatePresence initial={false}>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <motion.div 
                        key={item.variantId} 
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="flex gap-3 p-3 rounded-lg bg-card border border-border/50 shadow-soft"
                      >
                        <div className="w-20 h-20 bg-secondary/30 rounded-md overflow-hidden flex-shrink-0">
                          {item.product.node.images?.edges?.[0]?.node && (
                            <img 
                              src={item.product.node.images.edges[0].node.url} 
                              alt={item.product.node.title} 
                              className="w-full h-full object-cover" 
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-display font-semibold text-foreground text-sm leading-tight line-clamp-2">
                            {item.product.node.title}
                          </h4>
                          {item.variantTitle !== "Default Title" && (
                            <p className="text-xs text-muted-foreground mt-0.5">{item.variantTitle}</p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-7 w-7 border-border/50" 
                                onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-7 w-7 border-border/50" 
                                onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="font-semibold text-primary">
                              ${(parseFloat(item.price.amount) * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-muted-foreground hover:text-destructive flex-shrink-0" 
                          onClick={() => removeItem(item.variantId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              </div>

              {/* Order Summary */}
              <div className="flex-shrink-0 space-y-4 pt-4 border-t border-border bg-background">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={`font-medium ${shippingCost === 0 ? 'text-primary' : ''}`}>
                      {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-display font-semibold">Total</span>
                    <span className="text-2xl font-bold text-gradient-gold">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <motion.div
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                >
                  <Button 
                    onClick={handleCheckout} 
                    className="w-full bg-gradient-gold hover:opacity-90 text-primary-foreground shadow-gold text-base" 
                    size="lg" 
                    disabled={items.length === 0 || isLoading || isSyncing}
                  >
                    {isLoading || isSyncing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Proceed to Checkout — ${total.toFixed(2)}
                      </>
                    )}
                  </Button>
                </motion.div>

                {/* Continue Shopping */}
                <Button 
                  variant="ghost" 
                  className="w-full text-muted-foreground hover:text-foreground" 
                  onClick={() => setCartOpen(false)}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>

                {/* Trust Badges */}
                <div className="flex flex-wrap items-center justify-center gap-4 pt-2 pb-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Shield className="h-3.5 w-3.5" />
                    <span>Secure Checkout</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Truck className="h-3.5 w-3.5" />
                    <span>Worldwide Shipping</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pb-1">
                  <VisaLogo className="h-8 w-auto" />
                  <MastercardLogo className="h-8 w-auto" />
                  <AmexLogo className="h-8 w-auto" />
                  <DiscoverLogo className="h-8 w-auto" />
                  <PayPalLogo className="h-8 w-auto" />
                  <ApplePayLogo className="h-8 w-auto" />
                  <GooglePayLogo className="h-8 w-auto" />
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
