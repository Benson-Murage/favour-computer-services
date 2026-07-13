import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { WifiOff, RefreshCw, Home } from "lucide-react";
import { useOnlineStatus } from "@/components/pwa/pwa-manager";

export const Route = createFileRoute("/offline")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "You're offline — Favour Computer Services" },
      {
        name: "description",
        content: "You are currently offline. Reconnect to continue shopping.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OfflinePage,
});

function OfflinePage() {
  const online = useOnlineStatus();

  useEffect(() => {
    if (online) window.location.replace("/");
  }, [online]);

  return (
    <div className="mx-auto grid min-h-[70vh] max-w-md place-items-center px-4 py-16">
      <div className="w-full text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-secondary text-muted-foreground">
          <WifiOff className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">You are currently offline</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Check your internet connection. We'll reconnect you automatically when you're back online.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90"
          >
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium hover:bg-secondary"
          >
            <Home className="h-4 w-4" /> Return home
          </Link>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          Status:{" "}
          <span className={online ? "text-emerald-600" : "text-amber-600"}>
            {online ? "Reconnecting…" : "Offline"}
          </span>
        </p>
      </div>
    </div>
  );
}
