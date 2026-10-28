"use client";

import { useActionState } from "react";
import { joinProgramme, type JoinState } from "./actions";

export default function JoinForm({ businessId, businessName }: { businessId: string; businessName: string }) {
  const [state, action, pending] = useActionState<JoinState, FormData>(joinProgramme.bind(null, businessId), {});

  return (
    <form action={action} className="card mt-6 space-y-4">
      <div>
        <label htmlFor="name" className="label">Your name</label>
        <input id="name" name="name" required minLength={2} maxLength={80} autoComplete="name" className="input" />
      </div>
      <div>
        <label htmlFor="phone" className="label">Phone number</label>
        <input id="phone" name="phone" type="tel" inputMode="tel" required autoComplete="tel"
          placeholder="082 123 4567" className="input" />
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-3">
          <input type="checkbox" name="consent" required className="mt-1 h-6 w-6 shrink-0 accent-accent" />
          <span className="text-sm">
            I agree that {businessName} may store my name and phone number to run this loyalty programme.
          </span>
        </label>
        <details className="mt-2 pl-9 text-sm text-ink/70">
          <summary className="cursor-pointer font-medium text-accent">Privacy notice</summary>
          <p className="mt-2">
            We store your name, phone number and the dates of your visits. {businessName} can see them. They are used only
            for this loyalty programme. You can ask {businessName} to delete your details at any time.
          </p>
        </details>
      </div>

      {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn w-full">
        {pending ? "Joining…" : "Join and get my card"}
      </button>
    </form>
  );
}
