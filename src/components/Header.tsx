import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { VerifiedSellerBadge } from "./VerifiedSellerBadge";
import { AISearchBar } from "./AISearchBar";
import { CartDrawer } from "./CartDrawer";
import { Menu, X, Crown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Shop All", href: "/#products" },
  { label: "Colored Wigs", href: "/#products?category=colored-wigs" },
  { label: "Bob Wigs", href: "/#products?category=bob-wigs" },
  { label: "Bundles", href: "/#products?category=bundles" },
  { label: "About Us", href: "/about" },
  { label: "Shipping", href: "/shipping" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close search on route change
  useEffect(() => {
    setSearchOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-espresso text-cream text-center py-2 text-xs sm:text-sm font-medium tracking-wider">
        <div className="container px-4">
          ✨ Use code <span className="font-bold underline">WELCOME10</span> for 10% off your first order · FREE SHIPPING OVER $100 ✨
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 w-full transition-all duration-500 ${
          scrolled
            ? "glass border-b border-border/40 shadow-soft"
            : "bg-transparent"
        }`}
      >
        <div className="container flex h-16 md:h-20 items-center justify-between px-4 md:px-8">
          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[350px]">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-6 pt-4">
                  <Crown className="h-6 w-6 text-primary" />
                  <span className="font-display text-xl font-bold">Boss Queens</span>
                </div>

                {/* Mobile search */}
                <div className="mb-4">
                  <AISearchBar onClose={() => setIsOpen(false)} />
                </div>

                <nav className="flex flex-col gap-1">
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        to={link.href}
                        onClick={() => setIsOpen(false)}
                        className="text-lg font-medium text-foreground hover:text-primary transition-colors py-3 px-2 rounded-lg hover:bg-primary/5 block"
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </nav>
                <div className="mt-auto pb-8">
                  <VerifiedSellerBadge />
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <Crown className="h-7 w-7 text-primary transition-transform duration-300 group-hover:rotate-12" />
            <div className="flex flex-col leading-none">
              <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Boss Queens
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-display text-[10px] sm:text-xs tracking-[0.25em] uppercase text-muted-foreground">
                  Collection
                </span>
                <span className="text-muted-foreground/40 text-[10px]">·</span>
                <span className="font-display text-[10px] sm:text-xs tracking-[0.2em] uppercase text-muted-foreground/60">
                  Est. 2020
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href || (link.href !== "/" && location.pathname.startsWith(link.href));
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-full
                    ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Desktop search toggle */}
            <AnimatePresence mode="wait">
              {searchOpen ? (
                <motion.div
                  key="search-bar"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 320, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="hidden md:block overflow-visible"
                >
                  <AISearchBar onClose={() => setSearchOpen(false)} />
                </motion.div>
              ) : (
                <motion.div key="search-icon" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden md:flex shrink-0"
                    onClick={() => setSearchOpen(true)}
                  >
                    <Search className="h-5 w-5" />
                    <span className="sr-only">Search products</span>
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            <CartDrawer />
            <VerifiedSellerBadge className="hidden lg:inline-flex" />
          </div>
        </div>
      </header>
    </>
  );
};
