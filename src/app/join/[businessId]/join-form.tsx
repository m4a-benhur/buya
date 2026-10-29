"use client";

import { useActionState } from "react";
import { fill, type Dict } from "@/lib/i18n";
import { joinProgramme, type JoinState } from "./actions";

export default function JoinForm({ businessId, businessName, t }: { businessId: string; businessName: string; t: Dict }) {
  const [state, action, pending] = useActionState<JoinState, FormData>(joinProgramme.bind(null, businessId), {});
  const v = { business: businessName };

  return (
    <form action={action} className="card mt-6 space-y-4">
      <div>
        <label htmlFor="name" className="label">{t.yourName}</label>
        <input id="name" name="name" required minLength={2} maxLength={80} autoComplete="name" className="input" />
      </div>
      <div>
        <label htmlFor="phone" className="label">{t.phone}</label>
        <input id="phone" name="phone" type="tel" inputMode="tel" required autoComplete="tel"
          placeholder="082 123 4567" className="input" />
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-3">
          <input type="checkbox" name="consent" required className="mt-1 h-6 w-6 shrink-0 accent-accent" />
          <span className="text-sm">{fill(t.consent, v)}</span>
        </label>
        <details className="mt-2 pl-9 text-sm text-ink/70">
          <summary className="cursor-pointer font-medium text-accent">{t.privacyNotice}</summary>
          <p className="mt-2">{fill(t.privacyBody, v)}</p>
        </details>
      </div>

      {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn w-full">
        {pending ? t.joining : t.joinBtn}
      </button>
    </form>
  );
}
