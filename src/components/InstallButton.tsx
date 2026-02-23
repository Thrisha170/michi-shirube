import { useEffect, useState } from "react";

export default function InstallButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = () => setShow(true);
    window.addEventListener("pwa-installable", handler);
    return () => window.removeEventListener("pwa-installable", handler);
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={async () => {
        const prompt = (window as any).deferredPrompt;
        if (!prompt) return;

        prompt.prompt();
        await prompt.userChoice;
        window.deferredPrompt = null;
        setShow(false);
      }}
      className="fixed bottom-6 right-6 bg-red-500 text-white px-5 py-3 rounded-xl shadow-lg"
    >
      Install App
    </button>
  );
}