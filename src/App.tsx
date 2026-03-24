import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";

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

// Lazy load below-fold widgets
const WhatsAppButton = lazy(() => import("./components/WhatsAppButton").then(m => ({ default: m.WhatsAppButton })));
const AIChatWidget = lazy(() => import("./components/AIChatWidget").then(m => ({ default: m.AIChatWidget })));
const CookieConsent = lazy(() => import("./components/CookieConsent").then(m => ({ default: m.CookieConsent })));
const WelcomePopup = lazy(() => import("./components/WelcomePopup").then(m => ({ default: m.WelcomePopup })));
const SocialProofToast = lazy(() => import("./components/SocialProofToast").then(m => ({ default: m.SocialProofToast })));
const ExitIntentPopup = lazy(() => import("./components/ExitIntentPopup").then(m => ({ default: m.ExitIntentPopup })));
const queryClient = new QueryClient();

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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Suspense fallback={null}>
        <WhatsAppButton />
        <AIChatWidget />
        <CookieConsent />
        <WelcomePopup />
        <SocialProofToast />
        <ExitIntentPopup />
      </Suspense>
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
          <AppContent />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
