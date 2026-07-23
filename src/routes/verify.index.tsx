import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { Btn, Input } from "@/components/admin/ui";
import logoAsset from "@/assets/fcs-logo.png";

export const Route = createFileRoute("/verify/")({
  head: () => ({
    meta: [
      { title: "Verify Receipt — Favour Computer Services" },
      {
        name: "description",
        content: "Enter your receipt verification code to confirm it is authentic.",
      },
    ],
  }),
  component: VerifyIndex,
});

function VerifyIndex() {
  const nav = useNavigate();
  const [code, setCode] = useState("");
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <div className="rounded-3xl border border-border bg-card p-8 text-center [box-shadow:var(--shadow-elevated)]">
        <img src={logoAsset} alt="FCS" className="mx-auto h-16 w-16 object-contain" />
        <h1 className="mt-4 text-xl font-bold tracking-tight">Verify Your Receipt</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the Verification Code printed on your receipt or scan the QR code.
        </p>
        <form
          className="mt-6"
          onSubmit={(e) => {
            e.preventDefault();
            const c = code.trim().toUpperCase();
            if (c) nav({ to: "/verify/receipt/$code", params: { code: c } });
          }}
        >
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="FCS-2026-XXXXXX"
            className="text-center font-mono uppercase tracking-widest"
          />
          <Btn type="submit" className="mt-3 w-full justify-center">
            <Search className="mr-1 h-3.5 w-3.5" />
            Verify Receipt
          </Btn>
        </form>
      </div>
    </div>
  );
}
