import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, ShoppingCart, User } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

export const MobileBottomNav = () => {
  const location = useLocation();
  const totalItems = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const { user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Search", path: "/#products", action: () => {
      const el = document.getElementById("products");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      else window.location.href = "/#products";
    }},
    { icon: ShoppingCart, label: "Cart", path: "/cart", isCart: true },
    { icon: User, label: "Account", path: user ? (user ? "/admin/reviews" : "/") : "/auth" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/98 backdrop-blur-xl border-t border-border/60 md:hidden safe-area-bottom shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          if (item.isCart) {
            return (
              <button
                key={item.label}
                onClick={() => {
                  useCartStore.getState().setCartOpen(true);
                }}
                className="flex flex-col items-center gap-0.5 px-3 py-1 relative"
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                  {totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {totalItems > 9 ? "9+" : totalItems}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>
                  {item.label}
                </span>
              </button>
            );
          }

          if (item.action) {
            return (
              <button
                key={item.label}
                onClick={item.action}
                className="flex flex-col items-center gap-0.5 px-3 py-1"
              >
                <Icon className="w-5 h-5 text-muted-foreground" />
                <span className="text-[10px] font-medium text-muted-foreground">{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.path}
              className="flex flex-col items-center gap-0.5 px-3 py-1"
            >
              <Icon className={`w-5 h-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-[10px] font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
