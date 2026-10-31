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
    QRCode.toString(link, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#000000", light: "#ffffff" } })
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
        <h2 className="t-title">Invite link</h2>
        <p className="t-item-sub mt-2 max-w-md">
          {joinMode === "approval"
            ? "Guests who open this link ask to join. You approve them on the Guests tab."
            : "Anyone who opens this link and signs in can search for their photos."}
        </p>
        <div className="mt-5 flex max-w-xl flex-col gap-2 sm:flex-row">
          <input readOnly value={link} className="field font-medium" aria-label="Invite link" onFocus={(e) => e.target.select()} />
          <button type="button" onClick={copy} className="btn btn-primary shrink-0">
            {copied ? <span className="confirm-in"><svg viewBox="0 0 16 16" className="pop h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" /></svg>Copied</span> : "Copy link"}
          </button>
        </div>
        <a href={whatsAppHref} target="_blank" rel="noreferrer" className="btn btn-quiet mt-2">
          Share on WhatsApp
        </a>

        <div className="mt-10 max-w-xl border-t border-hairline pt-8">
          <h3 className="t-item">Tell guests about face matching</h3>
          <p className="t-item-sub mt-1">
            Add a line like this to the programme, invitation or screen so everyone knows how photos are shared:
          </p>
          <p className="mt-4 rounded-[4px] bg-fill p-4 text-[0.875rem] leading-[1.45]">
            &ldquo;Photos from today will be shared privately on Ancular. Scan the QR code and take a selfie to find the
            ones you&apos;re in. Face matching only runs if you agree to it.&rdquo;
          </p>
        </div>
      </div>

      <div className="flex flex-col items-start md:items-center">
        <div
          className="media w-56 bg-white p-3 shadow-[inset_0_0_0_1px_var(--hairline)] [&_svg]:h-auto [&_svg]:w-full"
          aria-label="QR code for the invite link"
          role="img"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <button type="button" onClick={downloadQr} className="btn btn-quiet btn-sm mt-3" disabled={!svg}>
          Download QR code
        </button>
        <p className="t-meta mt-2 max-w-56 md:text-center">Print it on the programme or show it on the screen.</p>
      </div>
    </div>
  );
}
