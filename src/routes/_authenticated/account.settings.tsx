import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ArrowLeft, Save, KeyRound } from "lucide-react";
import { Btn, Card, Input } from "@/components/admin/ui";
import { getMyProfile, updateMyProfile, changeMyPassword } from "@/lib/account.functions";

export const Route = createFileRoute("/_authenticated/account/settings")({
  head: () => ({ meta: [{ title: "Account Settings — Favour Computer Services" }] }),
  component: Settings,
});

function Settings() {
  const load = useServerFn(getMyProfile);
  const save = useServerFn(updateMyProfile);
  const changePw = useServerFn(changeMyPassword);
  const [profile, setProfile] = useState<{ email: string; full_name: string; phone: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => { load({}).then(setProfile).catch((e) => toast.error((e as Error).message)); }, [load]);

  const submit = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await save({ data: { full_name: profile.full_name, phone: profile.phone } });
      toast.success("Profile saved");
    } catch (e) { toast.error((e as Error).message); }
    finally { setSaving(false); }
  };

  const submitPw = async () => {
    if (pw.length < 8) return toast.error("Password must be at least 8 characters");
    if (pw !== pw2) return toast.error("Passwords do not match");
    setPwSaving(true);
    try {
      await changePw({ data: { new_password: pw } });
      toast.success("Password updated");
      setPw(""); setPw2("");
    } catch (e) { toast.error((e as Error).message); }
    finally { setPwSaving(false); }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link to="/account" className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to account
      </Link>
      <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">Update your personal information and security.</p>

      {!profile ? (
        <div className="mt-8 text-sm text-muted-foreground">Loading…</div>
      ) : (
        <div className="mt-6 grid gap-4">
          <Card>
            <h2 className="text-base font-semibold">Profile</h2>
            <div className="mt-4 grid gap-3">
              <label className="grid gap-1 text-xs font-medium text-muted-foreground">
                <span>Email</span>
                <Input value={profile.email} disabled />
              </label>
              <label className="grid gap-1 text-xs font-medium text-muted-foreground">
                <span>Full name</span>
                <Input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
              </label>
              <label className="grid gap-1 text-xs font-medium text-muted-foreground">
                <span>Phone</span>
                <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="e.g. 0712 345 678" />
              </label>
              <div>
                <Btn onClick={submit} disabled={saving}><Save className="mr-1 h-3.5 w-3.5" />{saving ? "Saving…" : "Save changes"}</Btn>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-base font-semibold">Change password</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-xs font-medium text-muted-foreground">
                <span>New password</span>
                <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="At least 8 characters" />
              </label>
              <label className="grid gap-1 text-xs font-medium text-muted-foreground">
                <span>Confirm password</span>
                <Input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
              </label>
            </div>
            <div className="mt-4">
              <Btn onClick={submitPw} disabled={pwSaving}><KeyRound className="mr-1 h-3.5 w-3.5" />{pwSaving ? "Updating…" : "Update password"}</Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}