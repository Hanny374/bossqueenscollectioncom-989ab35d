import { lazy, Suspense, useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { EmailGate } from "@/components/EmailGate";

import Index from "./pages/Index";

// Lazy load non-critical routes
const ProductPage = lazy(() => import("./pages/ProductPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const ShippingPage = lazy(() => import("./pages/ShippingPage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const AdminReviewsPage = lazy(() => import("./pages/AdminReviewsPage"));
const MothersDaySalePage = lazy(() => import("./pages/MothersDaySalePage"));

// Lazy load below-fold widgets
const WhatsAppButton = lazy(() => import("./components/WhatsAppButton").then(m => ({ default: m.WhatsAppButton })));
const AIChatWidget = lazy(() => import("./components/AIChatWidget").then(m => ({ default: m.AIChatWidget })));
const CookieConsent = lazy(() => import("./components/CookieConsent").then(m => ({ default: m.CookieConsent })));
const WelcomePopup = lazy(() => import("./components/WelcomePopup").then(m => ({ default: m.WelcomePopup })));
const SocialProofToast = lazy(() => import("./components/SocialProofToast").then(m => ({ default: m.SocialProofToast })));
const ExitIntentPopup = lazy(() => import("./components/ExitIntentPopup").then(m => ({ default: m.ExitIntentPopup })));
const MobileBottomNav = lazy(() => import("./components/MobileBottomNav").then(m => ({ default: m.MobileBottomNav })));

const CarnivalStickyWidget = lazy(() => import("./components/CarnivalStickyWidget").then(m => ({ default: m.CarnivalStickyWidget })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Defer non-critical widgets until after initial paint + interaction idle
const DeferredWidgets = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const idleWindow = window as Window & typeof globalThis & {
      requestIdleCallback?: (callback: () => void) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    let idleId: number | null = null;
    const timeoutId = window.setTimeout(() => setReady(true), 3000);

    if (typeof idleWindow.requestIdleCallback === "function") {
      idleId = idleWindow.requestIdleCallback(() => {
        window.clearTimeout(timeoutId);
        setReady(true);
      });
    }

    return () => {
      window.clearTimeout(timeoutId);
      if (idleId !== null && typeof idleWindow.cancelIdleCallback === "function") {
        idleWindow.cancelIdleCallback(idleId);
      }
    };
  }, []);

  if (!ready) return null;

  return (
    <Suspense fallback={null}>
      <WhatsAppButton />
      <AIChatWidget />
      <CookieConsent />
      <WelcomePopup />
      <SocialProofToast />
      <ExitIntentPopup />
      <MobileBottomNav />
      <CarnivalStickyWidget />
    </Suspense>
  );
};

const AppContent = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/product/:handle" element={<ProductPage />} />
          <Route path="/products/:handle" element={<ProductPage />} />
          <Route path="/collections" element={<Navigate to="/" replace />} />
          <Route path="/collections/*" element={<Navigate to="/" replace />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/shipping" element={<ShippingPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/admin/reviews" element={<AdminReviewsPage />} />
          <Route path="/mothers-day-sale" element={<MothersDaySalePage />} />
          <Route path="/mothers-day" element={<Navigate to="/mothers-day-sale" replace />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <DeferredWidgets />
    </BrowserRouter>
  );
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <EmailGate />
          <AppContent />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
