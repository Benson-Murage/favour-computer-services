// Guarded service worker registration. Only registers in production, on
// real user origins — never in Lovable preview, dev, or inside an iframe.
// Provides an event-based update notifier and a kill-switch via ?sw=off.

const SW_URL = "/sw.js";

export type UpdateHandler = (registration: ServiceWorkerRegistration) => void;

function isBlockedContext(): boolean {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return true;
  if (!import.meta.env.PROD) return true;
  try {
    if (window.self !== window.top) return true;
  } catch {
    return true;
  }
  const host = window.location.hostname;
  if (host.startsWith("id-preview--") || host.startsWith("preview--")) return true;
  if (host === "lovableproject.com" || host.endsWith(".lovableproject.com")) return true;
  if (host === "lovableproject-dev.com" || host.endsWith(".lovableproject-dev.com")) return true;
  if (host === "beta.lovable.dev" || host.endsWith(".beta.lovable.dev")) return true;
  if (window.location.search.includes("sw=off")) return true;
  return false;
}

async function unregisterMatching() {
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    for (const r of regs) {
      const url = r.active?.scriptURL || r.installing?.scriptURL || r.waiting?.scriptURL || "";
      if (url.endsWith(SW_URL)) await r.unregister();
    }
  } catch {
    /* noop */
  }
}

export function registerServiceWorker(onUpdate?: UpdateHandler) {
  if (isBlockedContext()) {
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      void unregisterMatching();
    }
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(SW_URL, { scope: "/" })
      .then((reg) => {
        if (reg.waiting) onUpdate?.(reg);
        reg.addEventListener("updatefound", () => {
          const sw = reg.installing;
          if (!sw) return;
          sw.addEventListener("statechange", () => {
            if (sw.state === "installed" && navigator.serviceWorker.controller) {
              onUpdate?.(reg);
            }
          });
        });
        // Periodic update poll (every hour when tab open).
        setInterval(() => reg.update().catch(() => undefined), 60 * 60 * 1000);
      })
      .catch((err) => console.warn("[pwa] SW registration failed", err));

    let reloaded = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    });
  });
}

export function applyUpdate(reg: ServiceWorkerRegistration) {
  const sw = reg.waiting;
  if (sw) sw.postMessage({ type: "SKIP_WAITING" });
}