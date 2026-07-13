import { createRoot, type Root } from "react-dom/client";
import { useEffect, useState } from "react";
import { Btn } from "./ui";

type Opts = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
};

let mountEl: HTMLDivElement | null = null;
let root: Root | null = null;

function ensureRoot(): Root {
  if (typeof window === "undefined") throw new Error("confirm() requires browser");
  if (!mountEl) {
    mountEl = document.createElement("div");
    document.body.appendChild(mountEl);
    root = createRoot(mountEl);
  }
  return root!;
}

function Dialog({ opts, onResolve }: { opts: Opts; onResolve: (v: boolean) => void }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setOpen(true);
  }, []);
  const close = (v: boolean) => {
    setOpen(false);
    setTimeout(() => onResolve(v), 120);
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(false);
      if (e.key === "Enter") close(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[200] grid place-items-center bg-black/60 p-4"
      onClick={() => close(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl"
      >
        <h3 className="text-lg font-bold">{opts.title}</h3>
        {opts.message && <p className="mt-2 text-sm text-muted-foreground">{opts.message}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <Btn variant="secondary" onClick={() => close(false)}>
            {opts.cancelLabel ?? "Cancel"}
          </Btn>
          <Btn variant={opts.tone === "danger" ? "danger" : "primary"} onClick={() => close(true)}>
            {opts.confirmLabel ?? "Confirm"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

export function confirmAction(opts: Opts): Promise<boolean> {
  return new Promise((resolve) => {
    const r = ensureRoot();
    r.render(
      <Dialog
        opts={opts}
        onResolve={(v) => {
          r.render(<></>);
          resolve(v);
        }}
      />,
    );
  });
}
