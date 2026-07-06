import { useEffect, useState } from "react";
import { Download, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { registerServiceWorker, applyUpdate } from "@/lib/pwa/register-sw";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const INSTALL_DISMISSED_KEY = "fcs-install-dismissed";

export function PWAManager() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    registerServiceWorker((reg) => {
      toast("Update available", {
        description: "A new version of the app is ready.",
        duration: Infinity,
        action: {
          label: "Refresh",
          onClick: () => applyUpdate(reg),
        },
        cancel: { label: "Later", onClick: () => undefined },
      });
    });
  }, []);

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
      try {
        const dismissed = localStorage.getItem(INSTALL_DISMISSED_KEY);
        if (dismissed && Date.now() - Number(dismissed) < 7 * 24 * 60 * 60 * 1000) return;
      } catch { /* empty */ }
      // Detect standalone / installed → skip banner
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        // @ts-expect-error iOS Safari
        window.navigator.standalone === true;
      if (!standalone) setShowBanner(true);
    };
    const onInstalled = () => {
      setInstallEvent(null);
      setShowBanner(false);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome !== "dismissed") setShowBanner(false);
    setInstallEvent(null);
  };

  const dismiss = () => {
    setShowBanner(false);
    try { localStorage.setItem(INSTALL_DISMISSED_KEY, String(Date.now())); } catch { /* empty */ }
  };

  if (!showBanner || !installEvent) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-md rounded-xl border border-border bg-background/95 p-4 shadow-lg backdrop-blur-xl sm:inset-x-auto sm:right-4">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[color:var(--accent)]/15 text-[color:var(--accent)]">
          <Download className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Install FCS App</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Install Favour Computer Services for faster access and offline browsing.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={install}
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:opacity-90"
            >
              <Download className="h-3.5 w-3.5" /> Install
            </button>
            <button
              onClick={dismiss}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          onClick={dismiss}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-secondary"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Standalone install button — mount anywhere (e.g. footer).
export function InstallButton({ className = "" }: { className?: string }) {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const on = (e: Event) => {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
    };
    const onI = () => setInstalled(true);
    const standalone = window.matchMedia?.("(display-mode: standalone)").matches;
    if (standalone) setInstalled(true);
    window.addEventListener("beforeinstallprompt", on);
    window.addEventListener("appinstalled", onI);
    return () => {
      window.removeEventListener("beforeinstallprompt", on);
      window.removeEventListener("appinstalled", onI);
    };
  }, []);

  if (installed || !evt) return null;
  return (
    <button
      onClick={async () => {
        await evt.prompt();
        await evt.userChoice;
        setEvt(null);
      }}
      className={
        "inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-secondary " +
        className
      }
    >
      <Download className="h-4 w-4" /> Install App
    </button>
  );
}

// Small reconnect hook for the offline page.
export function useOnlineStatus() {
  const [online, setOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);
  return online;
}

export { RefreshCw };