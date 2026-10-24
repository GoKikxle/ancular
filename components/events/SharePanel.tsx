"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import QRCode from "qrcode";

type Props = { url: string; inviteCode: string; eventName: string; joinMode: "open" | "approval" };

const noSubscribe = () => () => undefined;

/**
 * One invite link for the QR code, the copy box and WhatsApp.
 * In the browser it uses the address the host is actually on (so a phone on the same
 * Wi-Fi gets a link that opens); on the server it uses the configured site address.
 */
function useInviteLink(serverUrl: string, inviteCode: string) {
  const origin = useSyncExternalStore(
    noSubscribe,
    () => window.location.origin,
    () => new URL(serverUrl).origin
  );
  return `${origin}/e/${inviteCode}`;
}

export function SharePanel({ url, inviteCode, eventName, joinMode }: Props) {
  const link = useInviteLink(url, inviteCode);
  const [svg, setSvg] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    QRCode.toString(link, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#1e2a78", light: "#ffffff" } })
      .then((out) => !cancelled && setSvg(out))
      .catch(() => !cancelled && setSvg(""));
    return () => {
      cancelled = true;
    };
  }, [link]);

  const message = `Find your photos from ${eventName}. Open this link, take one selfie, and you'll only see the pictures you're in. ${link}`;
  const whatsAppHref = `https://wa.me/?text=${encodeURIComponent(message)}`;

  async function copy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadQr() {
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ancular-qr-${eventName.toLowerCase().replace(/[^\w]+/g, "-")}.svg`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_auto]">
      <div>
        <h2 className="text-xl font-bold">Invite link</h2>
        <p className="mt-1 text-ink-muted">
          {joinMode === "approval"
            ? "Guests who open this link ask to join. You approve them on the Guests tab."
            : "Anyone who opens this link and signs in can search for their photos."}
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input readOnly value={link} className="field font-medium" aria-label="Invite link" onFocus={(e) => e.target.select()} />
          <button type="button" onClick={copy} className="btn btn-primary">
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
        <a href={whatsAppHref} target="_blank" rel="noreferrer" className="btn btn-quiet mt-3">
          Share on WhatsApp
        </a>

        <div className="mt-8 rounded-2xl bg-indigo-soft p-5">
          <h3 className="font-bold">Tell guests about face matching</h3>
          <p className="mt-1 text-[0.95rem] text-ink-muted">
            Add a line like this to the programme, invitation or screen so everyone knows how photos are shared:
          </p>
          <p className="mt-3 rounded-xl bg-paper p-4 text-[0.95rem]">
            &ldquo;Photos from today will be shared privately on Ancular. Scan the QR code and take a selfie to find the
            ones you&apos;re in. Face matching only runs if you agree to it.&rdquo;
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div
          className="w-56 rounded-2xl bg-paper p-3 shadow-[0_0_0_1.5px_var(--line)] [&_svg]:h-auto [&_svg]:w-full"
          aria-label="QR code for the invite link"
          role="img"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <button type="button" onClick={downloadQr} className="btn btn-quiet btn-sm mt-3" disabled={!svg}>
          Download QR code
        </button>
        <p className="hint mt-2 max-w-56 text-center">Print it on the programme or show it on the screen.</p>
      </div>
    </div>
  );
}
