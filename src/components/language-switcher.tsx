"use client";

import { useRouter } from "next/navigation";
import { LANGS, type Lang } from "@/lib/i18n";

export default function LanguageSwitcher({ current }: { current: Lang }) {
  const router = useRouter();
  function pick(code: Lang) {
    document.cookie = `buya_lang=${code}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }
  return (
    <div className="flex gap-1" role="group" aria-label="Language">
      {LANGS.map((l) => (
        <button key={l.code} type="button" onClick={() => pick(l.code)} aria-pressed={current === l.code}
          className={`min-h-[44px] rounded-full px-3 text-sm font-semibold ${
            current === l.code ? "bg-accent text-white" : "text-ink/70 ring-1 ring-black/15"}`}>
          {l.label}
        </button>
      ))}
    </div>
  );
}
