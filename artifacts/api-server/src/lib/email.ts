/**
 * Email notification service (Resend REST API).
 *
 * Gracefully optional — if RESEND_API_KEY is not set, a warning is logged
 * and the function returns { ok: false, reason: 'not_configured' }.
 * The DB insert always happens first, so a missing key never fails the
 * user-facing request.
 */

const RESEND_API_URL = "https://api.resend.com/emails";

interface SendResult {
  ok: boolean;
  reason?: string;
  resendId?: string;
}

async function sendEmail(opts: {
  to: string;
  replyTo: string;
  subject: string;
  html: string;
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not configured — notification skipped");
    return { ok: false, reason: "not_configured" };
  }

  const from =
    process.env.CONTACT_SENDER_EMAIL ||
    "Stage Notifications <onboarding@resend.dev>";

  const payload = {
    from,
    to: opts.to,
    reply_to: opts.replyTo,
    subject: opts.subject,
    html: opts.html,
  };

  console.log(`[email] Sending: from="${from}" to="${opts.to}" reply_to="${opts.replyTo}" subject="${opts.subject}"`);

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseBody = await res.text().catch(() => "(unreadable)");

    if (!res.ok) {
      console.error(`[email] Resend error ${res.status}: ${responseBody}`);
      return { ok: false, reason: "api_error" };
    }

    let resendId: string | undefined;
    try { resendId = (JSON.parse(responseBody) as { id?: string }).id; } catch { /* noop */ }
    console.log(`[email] Delivered OK — Resend id: ${resendId ?? "unknown"}`);
    return { ok: true, resendId };
  } catch (err) {
    console.error("[email] Network error while sending notification:", err);
    return { ok: false, reason: "network_error" };
  }
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function row(label: string, value: string | null | undefined): string {
  if (!value) return "";
  return `<tr><td style="padding:4px 16px 4px 0;color:#666;white-space:nowrap;vertical-align:top"><b>${esc(label)}</b></td><td style="padding:4px 0;color:#111">${esc(value)}</td></tr>`;
}

// ── Public helpers ───────────────────────────────────────────────────────────

export async function sendContactEmail(opts: {
  to: string;
  name: string;
  email: string;
  locale: string;
  enquiryCategory: string;
  message: string;
}): Promise<SendResult> {
  const subject = `[bohatova.art] Contact: ${opts.name} — ${opts.enquiryCategory}`;
  const html = `
<div style="font-family:sans-serif;max-width:640px;margin:0 auto;color:#111">
  <h2 style="color:#C25F84;margin-bottom:24px">New contact message</h2>
  <table style="border-collapse:collapse;width:100%">
    ${row("Name", opts.name)}
    ${row("Email", opts.email)}
    ${row("Category", opts.enquiryCategory)}
    ${row("Locale", opts.locale)}
  </table>
  <hr style="border:none;border-top:1px solid #ddd;margin:24px 0"/>
  <p style="white-space:pre-wrap;line-height:1.6">${esc(opts.message)}</p>
  <hr style="border:none;border-top:1px solid #ddd;margin:24px 0"/>
  <p style="font-size:12px;color:#999">Received via bohatova.art · Hit reply to respond directly to ${esc(opts.name)}.</p>
</div>`;
  return sendEmail({ to: opts.to, replyTo: opts.email, subject, html });
}

export async function sendScriptRequestEmail(opts: {
  to: string;
  playTitle: string;
  name: string;
  email: string;
  organization: string;
  role?: string | null;
  city?: string | null;
  country: string;
  intendedUse: string;
  locale: string;
  message: string;
}): Promise<SendResult> {
  const subject = `[bohatova.art] Script request: "${opts.playTitle}" — ${opts.organization}`;
  const html = `
<div style="font-family:sans-serif;max-width:640px;margin:0 auto;color:#111">
  <h2 style="color:#C25F84;margin-bottom:24px">Script request received</h2>
  <table style="border-collapse:collapse;width:100%">
    ${row("Play", opts.playTitle)}
    ${row("Name", opts.name)}
    ${row("Email", opts.email)}
    ${row("Organisation", opts.organization)}
    ${row("Role", opts.role)}
    ${row("City", opts.city)}
    ${row("Country", opts.country)}
    ${row("Intended use", opts.intendedUse)}
    ${row("Locale", opts.locale)}
  </table>
  <hr style="border:none;border-top:1px solid #ddd;margin:24px 0"/>
  <p style="white-space:pre-wrap;line-height:1.6">${esc(opts.message)}</p>
  <hr style="border:none;border-top:1px solid #ddd;margin:24px 0"/>
  <p style="font-size:12px;color:#999">Received via bohatova.art · Hit reply to respond directly to ${esc(opts.name)}.</p>
</div>`;
  return sendEmail({ to: opts.to, replyTo: opts.email, subject, html });
}
