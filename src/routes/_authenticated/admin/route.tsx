import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { checkIsAdmin, claimFirstAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  component: AdminGate,
});

function AdminGate() {
  const [state, setState] = useState<"checking" | "no" | "ok">("checking");
  const check = useServerFn(checkIsAdmin);
  const claim = useServerFn(claimFirstAdmin);

  useEffect(() => {
    (async () => {
      const r = await check({});
      if (r.isAdmin) return setState("ok");
      // Auto-claim only succeeds for the designated Super Admin email
      // (bensonmurage254@gmail.com). All other accounts are denied.
      const claimed = await claim({});
      if (claimed.claimed) return setState("ok");
      setState("no");
    })();
  }, [check, claim]);

  if (state === "checking") {
    return (
      <div className="mx-auto max-w-md p-16 text-center text-sm text-muted-foreground">
        Checking permissions…
      </div>
    );
  }
  if (state === "no") {
    return (
      <div className="mx-auto max-w-md p-16 text-center">
        <h2 className="text-xl font-bold">Admin access required</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account does not have administrator privileges. The Super Admin account for Favour
          Computer Services is <span className="font-mono">bensonmurage254@gmail.com</span>. Sign in
          with that account to manage the platform.
        </p>
      </div>
    );
  }
  return <Outlet />;
}
