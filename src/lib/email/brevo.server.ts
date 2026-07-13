import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const SENDER_NAME = "Favour Computer Services";

export interface BrevoSendResult {
  ok: boolean;
  messageId?: string;
  error?: string;
  status?: number;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function wrapHtml(subject: string, body: string): string {
  // If body already looks like HTML, keep as-is; otherwise convert plaintext.
  const inner = /<\w+[\s>]/.test(body)
    ? body
    : `<p style="margin:0 0 12px 0;white-space:pre-wrap;">${escapeHtml(body)}</p>`;
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 14px rgba(15,23,42,0.08);">
        <tr><td style="padding:22px 28px;background:linear-gradient(135deg,#0b1e3f,#1e40af);color:#ffffff;">
          <div style="font-size:18px;font-weight:700;letter-spacing:0.3px;">Favour Computer Services</div>
          <div style="font-size:12px;opacity:0.85;margin-top:2px;">Trusted Technology Partner</div>
        </td></tr>
        <tr><td style="padding:28px;font-size:15px;line-height:1.55;color:#0f172a;">
          <h1 style="font-size:20px;margin:0 0 16px 0;color:#0b1e3f;">${escapeHtml(subject)}</h1>
          ${inner}
        </td></tr>
        <tr><td style="padding:18px 28px;border-top:1px solid #e2e8f0;background:#f8fafc;font-size:12px;color:#64748b;">
          <div>Favour Computer Services &middot; Nairobi, Kenya</div>
          <div style="margin-top:4px;">This is an automated message. Reply to reach our team.</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function sendViaBrevo(params: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<BrevoSendResult> {
  const apiKey = process.env.BREVO_API_KEY;
  const from = process.env.EMAIL_FROM || "favourcomputersofficial@gmail.com";
  if (!apiKey) return { ok: false, error: "BREVO_API_KEY not configured" };

  const payload = {
    sender: { name: SENDER_NAME, email: from },
    to: [{ email: params.to }],
    subject: params.subject,
    htmlContent: params.html,
    replyTo: params.replyTo ? { email: params.replyTo } : undefined,
  };

  let lastErr = "unknown";
  let lastStatus = 0;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(BREVO_API_URL, {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      lastStatus = res.status;
      const text = await res.text();
      if (res.ok) {
        let messageId: string | undefined;
        try {
          const j = JSON.parse(text);
          messageId = j.messageId ?? j.messageIds?.[0];
        } catch {
          /* ignore */
        }
        return { ok: true, messageId, status: res.status };
      }
      lastErr = `HTTP ${res.status}: ${text.slice(0, 500)}`;
      // Retry only on 429 / 5xx
      if (res.status !== 429 && res.status < 500) break;
    } catch (e) {
      lastErr = e instanceof Error ? e.message : String(e);
    }
    await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
  }
  return { ok: false, error: lastErr, status: lastStatus };
}

/** Send an email through Brevo AND update the given email_log row. */
export async function sendAndUpdateLog(
  supabase: SupabaseClient<Database>,
  logId: string,
  params: { to: string; subject: string; html: string; replyTo?: string },
) {
  const result = await sendViaBrevo(params);
  await supabase
    .from("email_log")
    .update({
      status: result.ok ? "sent" : "failed",
      error: result.ok ? null : (result.error ?? "send failed"),
      provider_message_id: result.messageId ?? null,
      sent_at: result.ok ? new Date().toISOString() : null,
    })
    .eq("id", logId);
  return result;
}

export { wrapHtml };
