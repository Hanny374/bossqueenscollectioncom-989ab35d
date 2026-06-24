import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { VerifiedSellerBadge } from "./VerifiedSellerBadge";
import { AISearchBar } from "./AISearchBar";
import { CartDrawer } from "./CartDrawer";
import { SummerSaleBanner } from "./SummerSaleBanner";
import { Menu, X, Crown, Search, Globe, ChevronDown, Sparkles, Scissors, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";

const wigCategories = [
  { label: "Shop All Wigs", subtitle: "Browse the full collection", href: "/#products", icon: Crown },
  { label: "Colored Wigs", subtitle: "Blonde, burgundy, honey & ombré HD lace", href: "/#products?category=colored-wigs", icon: Sparkles },
  { label: "Bob Wigs", subtitle: "Short bob lace front wigs in all textures", href: "/#products?category=bob-wigs", icon: Scissors },
  { label: "Lace Front Wigs", subtitle: "HD lace frontals, 13x4 & 13x6", href: "/#products?category=lace-front-wigs", icon: Crown },
  { label: "Headband Wigs", subtitle: "Easy-to-wear, no glue or lace needed", href: "/#products?category=headband-wigs", icon: Crown },
  { label: "V Part & Half Wigs", subtitle: "Glueless, natural-looking install", href: "/#products?category=v-part-half-wigs", icon: Crown },
  { label: "Boho Braids", subtitle: "Crochet & boho braids in human hair", href: "/#products?category=boho-braids", icon: Palette },
  { label: "Bundles", subtitle: "Virgin hair bundle deals", href: "/#products?category=bundles", icon: Sparkles },
  { label: "Accessories", subtitle: "Caps, glue, edge control & essentials", href: "/#products?category=accessories", icon: Palette },
];

const navLinks = [
  { label: "About Us", href: "/about" },
  { label: "VIP Hair Club", href: "/hair-club" },
  { label: "Ebook", href: "/product/60-seconds-to-100k-brand-blueprint-ebook" },
  { label: "Reviews", href: "/#reviews" },
  { label: "Shipping", href: "/shipping" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [wigsOpen, setWigsOpen] = useState(false);
  const [mobileWigsOpen, setMobileWigsOpen] = useState(true);
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

  const handleHashNav = (href: string, closeMobile = false) => {
    if (closeMobile) setIsOpen(false);
    if (!href.startsWith("/#") || location.pathname !== "/") return;

    const id = href.slice(2).split("?")[0];
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? "glass border-b border-border/40 shadow-soft"
          : "bg-transparent"
      }`}
    >
      <SummerSaleBanner />
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
                {/* Mobile Wigs accordion */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  <button
                    onClick={() => setMobileWigsOpen((v) => !v)}
                    className="w-full flex items-center justify-between text-lg font-medium text-foreground hover:text-primary transition-colors py-3 px-2 rounded-lg hover:bg-primary/5"
                  >
                    <span>Shop Wigs</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${mobileWigsOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {mobileWigsOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pl-3 border-l border-border/60 ml-2"
                      >
                        {wigCategories.map((c) => (
                          <Link
                            key={c.label}
                            to={c.href}
                            onClick={() => handleHashNav(c.href, true)}
                            className="flex flex-col py-2 px-2 rounded-lg hover:bg-primary/5"
                          >
                            <span className="text-sm font-semibold text-foreground">{c.label}</span>
                            <span className="text-xs text-muted-foreground">{c.subtitle}</span>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (i + 1) * 0.05 }}
                  >
                    <Link
                      to={link.href}
                      onClick={() => handleHashNav(link.href, true)}
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
              <span className="text-muted-foreground text-[10px]">·</span>
              <span className="font-display text-[10px] sm:text-xs tracking-[0.2em] uppercase text-muted-foreground">
                Est. 2020
              </span>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-0.5">
          {/* Wigs mega-dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setWigsOpen(true)}
            onMouseLeave={() => setWigsOpen(false)}
          >
            <button
              onClick={() => setWigsOpen((v) => !v)}
              className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                wigsOpen ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Shop Wigs
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${wigsOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {wigsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50"
                >
                  <div className="w-[640px] grid grid-cols-2 gap-1 rounded-2xl border border-border/60 bg-popover/95 backdrop-blur-xl shadow-elevated p-3">
                    {wigCategories.map((c) => (
                      <Link
                        key={c.label}
                        to={c.href}
                        onClick={() => {
                          setWigsOpen(false);
                          handleHashNav(c.href);
                        }}
                        className="group flex items-start gap-3 p-3 rounded-xl hover:bg-primary/5 transition-colors"
                      >
                        <div className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <c.icon className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-foreground">{c.label}</span>
                          <span className="text-xs text-muted-foreground leading-snug">{c.subtitle}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {navLinks.map((link) => {
            const isActive = location.pathname === link.href || (link.href !== "/" && location.pathname.startsWith(link.href));
            return (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => handleHashNav(link.href)}
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
          {/* Desktop search toggle — fixed width container to prevent CLS */}
          <div className="hidden md:block relative" style={{ width: searchOpen ? 320 : 40, transition: 'width 0.25s ease' }}>
            {searchOpen ? (
              <AISearchBar onClose={() => setSearchOpen(false)} />
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
                <span className="sr-only">Search products</span>
              </Button>
            )}
          </div>

          <div id="google_translate_element" className="notranslate [&_.goog-te-gadget]:!font-sans [&_.goog-te-combo]:!text-xs [&_.goog-te-combo]:!border [&_.goog-te-combo]:!border-border [&_.goog-te-combo]:!rounded-md [&_.goog-te-combo]:!bg-background [&_.goog-te-combo]:!text-foreground [&_.goog-te-combo]:!py-1 [&_.goog-te-combo]:!px-1.5 [&_.goog-te-combo]:!appearance-auto [&_.goog-te-gadget-simple]:!border-0 [&_.goog-te-gadget-simple]:!bg-transparent [&_.goog-te-gadget>span]:!hidden [&_a]:!hidden [&_.VIpgJd-ZVi9od-l4eHX-hSRGPd]:!hidden" />
          <CartDrawer />
          <VerifiedSellerBadge className="hidden lg:inline-flex" />
        </div>
      </div>
    </header>
  );
};