import "server-only";

const FROM = "Ancular <photos@updates.ancular.com>";
const REPLY_TO = "hello@ancular.com";

export function emailEnabled() {
  return !!process.env.RESEND_API_KEY;
}

export type OutgoingEmail = { to: string; subject: string; html: string; text: string; headers?: Record<string, string> };

/** Send through Resend, 100 per request. Returns how many were accepted. */
export async function sendBatch(emails: OutgoingEmail[]): Promise<{ sent: number; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: 0, error: "Email isn't set up yet." };
  let sent = 0;
  for (let i = 0; i < emails.length; i += 100) {
    const chunk = emails.slice(i, i + 100).map((e) => ({ from: FROM, reply_to: REPLY_TO, ...e }));
    const res = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(chunk),
    });
    if (!res.ok) return { sent, error: `Email service said ${res.status}` };
    sent += chunk.length;
  }
  return { sent };
}

export const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
