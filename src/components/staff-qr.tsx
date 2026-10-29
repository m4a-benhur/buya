"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

// Shown on the customer's card. Only the logged-in owner can use the link it opens,
// so a customer scanning their own code gets nothing.
export default function StaffQr({ customerId, size = 150 }: { customerId: string; size?: number }) {
  const [url, setUrl] = useState("");
  useEffect(() => { setUrl(`${window.location.origin}/dashboard/customers/${customerId}`); }, [customerId]);
  return (
    <div className="mx-auto rounded-2xl bg-white p-3 ring-1 ring-black/10" style={{ width: size + 24, height: size + 24 }}>
      {url && <QRCodeSVG value={url} size={size} level="M" marginSize={0} />}
    </div>
  );
}
