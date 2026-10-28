"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Re-fetches the card when the customer returns to the tab, so new stamps appear.
export default function AutoRefresh() {
  const router = useRouter();
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === "visible") router.refresh(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [router]);
  return null;
}
