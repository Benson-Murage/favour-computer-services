import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
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
      // try to claim first admin (only succeeds if no admin exists yet)
      const claimed = await claim({});
      if (claimed.claimed) return setState("ok");
      setState("no");
    })();
  }, [check, claim]);

  if (state === "checking") {
    return <div className="mx-auto max-w-md p-16 text-center text-sm text-muted-foreground">Checking permissions…</div>;
  }
  if (state === "no") {
    return (
      <div className="mx-auto max-w-md p-16 text-center">
        <h2 className="text-xl font-bold">Admin access required</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account does not have administrator privileges. Contact an existing admin to grant you access.
        </p>
      </div>
    );
  }
  return <Outlet />;
}