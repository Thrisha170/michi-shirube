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
/* REGISTER SERVICE WORKER */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js")
      .then(() => console.log("SW registered"))
      .catch(err => console.log("SW failed", err));
  });
}