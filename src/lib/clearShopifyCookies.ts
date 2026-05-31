/**
 * Clears all Shopify-related cookies and localStorage items on app load.
 * This prevents stale cart/session state from persisting across visits.
 */

const SHOPIFY_COOKIE_PREFIXES = [
  "_shopify_",
  "cart",
  "checkout",
  "customer",
  "dynamic_checkout",
  "secure_customer",
  "storefront_digest",
  "tracked_start_checkout",
  "keep_alive",
];

const SHOPIFY_LOCALSTORAGE_KEYS = [
  "shopify-cart",
  "shopify-checkout",
  "shopify-customer",
  "shopify_order",
  "shopifyCart",
];

function deleteCookie(name: string, domain?: string) {
  const domains = domain ? [domain, `.${domain}`] : [undefined];
  const paths = ["/", ""];

  domains.forEach((d) => {
    paths.forEach((p) => {
      let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${p}`;
      if (d) cookieString += `; domain=${d}`;
      // Also try secure and SameSite variants
      document.cookie = `${cookieString}; SameSite=None; Secure`;
      document.cookie = cookieString;
    });
  });
}

export function clearShopifyCookies() {
  // Get all cookies
  const allCookies = document.cookie.split(";");

  for (const cookie of allCookies) {
    const [namePart] = cookie.split("=");
    const name = namePart?.trim();
    if (!name) continue;

    const isShopifyCookie = SHOPIFY_COOKIE_PREFIXES.some(
      (prefix) => name.startsWith(prefix)
    );

    if (isShopifyCookie) {
      deleteCookie(name, window.location.hostname);
    }
  }

  // Also clear known Shopify localStorage keys
  SHOPIFY_LOCALSTORAGE_KEYS.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore storage errors
    }
  });
}
