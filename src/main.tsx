import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

/* PWA INSTALL PROMPT DETECTOR */
declare global {
  interface Window {
    deferredPrompt?: any;
  }
}

window.addEventListener("beforeinstallprompt", (e: Event) => {
  e.preventDefault();
  window.deferredPrompt = e;
  window.dispatchEvent(new Event("pwa-installable"));
});

/* RENDER APP */
createRoot(document.getElementById("root")!).render(<App />);