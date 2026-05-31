import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { clearShopifyCookies } from "./lib/clearShopifyCookies";

// Wipe Shopify cookies and localStorage cart/session state on every fresh load
clearShopifyCookies();

createRoot(document.getElementById("root")!).render(<App />);
