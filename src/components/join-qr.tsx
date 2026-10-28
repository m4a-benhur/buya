"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

// QR code that links customers to /join/[businessId]. Scanning only JOINS the
// programme; stamps are only ever awarded by the owner.
export default function JoinQr({
  businessId,
  size = 200,
  showLink = true,
}: {
  businessId: string;
  size?: number;
  showLink?: boolean;
}) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(`${window.location.origin}/join/${businessId}`);
  }, [businessId]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable; the link is visible to copy by hand */
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-2xl bg-white p-3 ring-1 ring-black/10" style={{ width: size + 24, height: size + 24 }}>
        {url && <QRCodeSVG value={url} size={size} level="M" marginSize={0} />}
      </div>
      {showLink && url && (
        <div className="flex flex-col items-center gap-2 print:hidden">
          <p className="max-w-full break-all text-center text-sm text-ink/60">{url}</p>
          <button type="button" onClick={copy} className="btn-ghost">
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
      )}
    </div>
  );
}
