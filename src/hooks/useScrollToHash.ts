import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const useScrollToHash = () => {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "").split("?")[0];
      let attempts = 0;
      const maxAttempts = 80;

      const scrollToElement = () => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }

        attempts += 1;
        if (attempts < maxAttempts) {
          window.setTimeout(scrollToElement, 250);
        }
      };

      // Retry because homepage sections are lazy-loaded and can shift after product images render.
      const timer = window.setTimeout(scrollToElement, 50);
      return () => clearTimeout(timer);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [hash, pathname]);
};
